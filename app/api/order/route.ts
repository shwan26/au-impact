// app/api/orders/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

type Line = {
  itemId: number | string;
  size?: string | null;
  color?: string | null;
  qty: number;
};

type CreateOrderReq = {
  studentId: string;
  fullName?: string;     // not in your schema; ignored unless you add a column
  lineId?: string;       // not in your schema; ignored unless you add a column
  slipUpload?: string | null;
  lines: Line[];         // <-- IMPORTANT: client must send this key
};

const MERCH_TABLE = 'Merchandise';           // has ItemID, Price, Status
const ORDER_TABLE = 'Order';                  // has Order_ID, TotalAmount, PromptPayQR, SlipUpload, StudentID, PaidAt
const ORDER_ITEM_TABLE = 'OrderItem';         // has OrderItemID, ItemID, SelectedSize, SelectedColor, Quantity, UnitPrice, LineTotal

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();

    // (optional) require login
    // const { data: au } = await supabase.auth.getUser();
    // if (!au?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = (await req.json()) as CreateOrderReq;
    const lines = Array.isArray(body.lines) ? body.lines : [];
    if (!lines.length) {
      return NextResponse.json({ error: 'No items to order' }, { status: 400 });
    }
    if (!body.studentId?.trim()) {
      return NextResponse.json({ error: 'StudentID is required' }, { status: 400 });
    }

    // Normalize
    const norm = lines.map((l) => ({
      itemId: Number(l.itemId),
      qty: Math.max(1, Number(l.qty || 1)),
      size: (l.size ?? null) || null,
      color: (l.color ?? null) || null,
    }));
    if (norm.some((l) => !Number.isFinite(l.itemId))) {
      return NextResponse.json({ error: 'Invalid itemId' }, { status: 400 });
    }

    // Fetch authoritative price + availability
    const ids = [...new Set(norm.map((l) => l.itemId))];
    const { data: merchRows, error: merchErr } = await supabase
      .from(MERCH_TABLE)
      .select('"ItemID","Price","Status"')
      .in('ItemID', ids);

    if (merchErr) throw merchErr;
    const byId = new Map<number, { price: number; status: string }>();
    for (const r of merchRows ?? []) {
      byId.set(Number(r.ItemID), { price: Number(r.Price ?? 0), status: String(r.Status ?? '') });
    }
    for (const l of norm) {
      const row = byId.get(l.itemId);
      if (!row) return NextResponse.json({ error: `Item ${l.itemId} not found` }, { status: 400 });
      if (row.status !== 'APPROVED') {
        return NextResponse.json({ error: `Item ${l.itemId} not available` }, { status: 400 });
      }
    }

    // Build order items
    const items = norm.map((l) => {
      const unit = byId.get(l.itemId)!.price;
      const lineTotal = unit * l.qty;
      return {
        ItemID: l.itemId,
        SelectedSize: l.size,
        SelectedColor: l.color,
        Quantity: l.qty,
        UnitPrice: unit,
        LineTotal: lineTotal,
      };
    });

    const orderTotal = items.reduce((s, it) => s + it.LineTotal, 0);

    // Create order
    const { data: orderIns, error: orderErr } = await supabase
      .from(ORDER_TABLE)
      .insert({
        TotalAmount: orderTotal,
        PromptPayQR: null,                 // set if you store a QR per order
        SlipUpload: body.slipUpload ?? null,
        StudentID: body.studentId,
        PaidAt: new Date().toISOString(),  // set null if you want manual verification flow
      })
      .select('"Order_ID"')
      .single();

    if (orderErr) throw orderErr;
    const orderId = Number(orderIns.Order_ID);

    // Insert order items
    const rows = items.map((it) => ({
      ...it,
      OrderID: orderId, // FK
    }));

    const { error: itemErr } = await supabase.from(ORDER_ITEM_TABLE).insert(rows);
    if (itemErr) throw itemErr;

    return NextResponse.json({ ok: true, orderId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status: 400 });
  }
}

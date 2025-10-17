// app/api/order/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

type Line = { itemId: number | string; size?: string | null; color?: string | null; qty: number; };
type CreateOrderReq = { studentId: string; slipUpload?: string | null; lines: Line[]; };

const MERCH_TABLE = 'Merchandise';
const ORDER_TABLE = 'Order';
const ORDER_ITEM_TABLE = 'OrderItem';

export async function GET() {
  return NextResponse.json({ ok: true, hint: 'orders route is alive' });
}

export async function POST(req: Request) {
  try {
    const { getSupabaseServer } = await import('@/lib/supabaseServer');
    const supabase = await getSupabaseServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

    const body = (await req.json()) as CreateOrderReq;

    const rawLines = Array.isArray(body.lines) ? body.lines : [];
    if (!rawLines.length) return NextResponse.json({ error: 'No items to order' }, { status: 400 });
    if (!body.studentId?.trim()) return NextResponse.json({ error: 'StudentID is required' }, { status: 400 });

    const norm = rawLines.map((l) => ({
      itemId: Number(l.itemId),
      qty: Math.max(1, Number(l.qty || 1)),
      size: (l.size ?? null) || null,
      color: (l.color ?? null) || null,
    }));
    if (norm.some((l) => !Number.isFinite(l.itemId))) {
      return NextResponse.json({ error: 'Invalid itemId' }, { status: 400 });
    }

    // fetch prices & status
    const ids = [...new Set(norm.map((l) => l.itemId))];
    const { data: merchRows, error: merchErr } = await supabase
      .schema('public')
      .from(MERCH_TABLE)
      .select('ItemID, Price, Status')
      .in('ItemID', ids);
    if (merchErr) throw merchErr;

    const byId = new Map<number, { price: number; status: string }>();
    for (const r of merchRows ?? []) {
      byId.set(Number(r.ItemID), { price: Number(r.Price ?? 0), status: String(r.Status ?? '') });
    }
    for (const l of norm) {
      const row = byId.get(l.itemId);
      if (!row) return NextResponse.json({ error: `Item ${l.itemId} not found` }, { status: 400 });
      if (row.status !== 'APPROVED') return NextResponse.json({ error: `Item ${l.itemId} not available` }, { status: 400 });
    }

    // Build items WITHOUT LineTotal (generated in DB)
    const itemsForInsert = norm.map((l) => ({
      ItemID: l.itemId,
      SelectedSize: l.size,
      SelectedColor: l.color,
      Quantity: l.qty,
      UnitPrice: byId.get(l.itemId)!.price,
      // ❌ LineTotal: let DB compute (generated column)
    }));

    // If your Order.TotalAmount is NOT generated, compute it here:
    const orderTotal = itemsForInsert.reduce(
      (s, it) => s + Number(it.UnitPrice) * Number(it.Quantity),
      0
    );

    // Insert order — use your UUID ownership column (UserID). Do not set TotalAmount if it's generated.
    const orderInsert: any = {
      UserID: user.id,                  // uuid column used by RLS
      SlipUpload: body.slipUpload ?? null,
      StudentID: body.studentId,
      PaidAt: new Date().toISOString(),
      TotalAmount: orderTotal,          // ❗ keep only if NOT generated in DB
    };

    const { data: orderIns, error: orderErr } = await supabase
      .schema('public')
      .from(ORDER_TABLE)
      .insert(orderInsert)
      .select('Order_ID')
      .single();
    if (orderErr) throw orderErr;

    const orderId = Number(orderIns?.Order_ID);
    if (!Number.isFinite(orderId)) {
      return NextResponse.json({ error: 'Failed to create order (no id)' }, { status: 500 });
    }

    // Insert order items (no LineTotal)
    const itemRows = itemsForInsert.map((it) => ({ ...it, OrderID: orderId }));
    const { error: itemErr } = await supabase
      .schema('public')
      .from(ORDER_ITEM_TABLE)
      .insert(itemRows);
    if (itemErr) throw itemErr;

    return NextResponse.json({ ok: true, orderId });
  } catch (e: any) {
    console.error('POST /api/order error:', e);
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status: 400 });
  }
}

// app/api/cart/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data, error } = await supabase.from('v_cart').select('*');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId, size, color, qty } = body;

    if (itemId == null) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
    }

    const { error } = await supabase.rpc('add_to_cart', {
      p_item_id: itemId,
      p_size: size,
      p_color: color,
      p_qty: qty ?? 1,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

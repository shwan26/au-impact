// app/api/events/[id]/status/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TABLE = 'event';
const FIELDS = '*';

function mapRow(r: any) {
  if (!r) return null;
  return {
    EventID: r.eventid ?? r.id ?? null,
    Title: r.title ?? 'Untitled Event',
    Status: r.status ?? null,
  };
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));

    let next = String(body?.status ?? '').toUpperCase();
    if (!next) return NextResponse.json({ error: 'Missing status' }, { status: 400 });
    if (next === 'APPROVED') next = 'LIVE';
    if (!['PENDING', 'LIVE', 'REJECTED', 'DRAFT', 'COMPLETE'].includes(next)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from(TABLE)
      .update({ status: next })
      .eq('eventid', id)
      .select(FIELDS)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Update failed' }, { status: 400 });
    }
    return NextResponse.json(mapRow(data));
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

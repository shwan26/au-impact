// app/api/merchandise/[id]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

const TABLE  = 'Merchandise';
const FIELDS =
  '"ItemID","Title","Description","Price","PickUpDate","PickUpTime","PickUpPoint",' +
  '"ContactName","ContactLineID","PosterURL","FrontViewURL","BackViewURL","SizeChartURL",' +
  '"SAU_ID","AUSO_ID","Status"';

type Ctx = { params: Promise<{ id: string }> };

const EDITABLE_FIELDS = new Set([
  'Title',
  'Description',
  'Price',
  'PickUpDate',
  'PickUpTime',
  'PickUpPoint',
  'ContactName',
  'ContactLineID',
  'PosterURL',
  'FrontViewURL',
  'BackViewURL',
  'SizeChartURL',
]);

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from(TABLE)
    .select(FIELDS)
    .eq('ItemID', idNum)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)  return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const idNum = Number(id);
    if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const supabase = await getSupabaseServer();
    const body = await req.json();

    // who is calling?
    const { data: au } = await supabase.auth.getUser();
    const role = (au?.user?.app_metadata as any)?.role ?? null;

    // Handle Status transitions inline (no extra /approve route needed):
    if ('Status' in body) {
      const next = String(body.Status);

      if (role === 'auso' && next === 'APPROVED') {
        const { data, error } = await supabase
          .from(TABLE)
          .update({ Status: 'APPROVED' })
          .eq('ItemID', idNum)
          .select(FIELDS)
          .single();

        if (error) {
          const status = error.code === '42501' ? 403 : 400;
          return NextResponse.json({ error: error.message }, { status });
        }
        return NextResponse.json(data);
      }

      if (role === 'sau' && next === 'SOLD_OUT') {
        const { data, error } = await supabase
          .from(TABLE)
          .update({ Status: 'SOLD_OUT' })
          .eq('ItemID', idNum)
          .select(FIELDS)
          .single();

        if (error) {
          const status = error.code === '42501' ? 403 : 400;
          return NextResponse.json({ error: error.message }, { status });
        }
        return NextResponse.json(data);
      }

      // Any other status attempt is stripped
      delete body.Status;
    }

    // Non-status edits: SAU-only (RLS still enforces row ownership and timing)
    if (role !== 'sau') {
      return NextResponse.json({ error: 'Only SAU can edit merchandise details' }, { status: 403 });
    }

    const payload: Record<string, any> = {};
    for (const [k, v] of Object.entries(body || {})) {
      if (EDITABLE_FIELDS.has(k)) payload[k] = v;
    }
    if (!Object.keys(payload).length) {
      return NextResponse.json({ error: 'No updatable fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('ItemID', idNum)
      .select(FIELDS)
      .single();

    if (error) {
      const status = error.code === '42501' ? 403 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const idNum = Number(id);
    if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const supabase = await getSupabaseServer();
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('ItemID', idNum);

    if (error) {
      const status = error.code === '42501' ? 403 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status: 400 });
  }
}

export const runtime = 'nodejs';

import { NextResponse, NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

const TABLE  = 'Announcement';
const FIELDS = '"AnnouncementID","Topic","Description","PhotoURL","DatePosted","Status","SAU_ID","AUSO_ID"';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from(TABLE)
    .select(FIELDS)
    .eq('AnnouncementID', idNum) // PascalCase
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

    const payload: Record<string, any> = {};
    if ('Topic' in body)       payload.Topic       = body.Topic ?? null;
    if ('Description' in body) payload.Description = body.Description ?? null;
    if ('PhotoURL' in body)    payload.PhotoURL    = body.PhotoURL ?? null;
    if ('Status' in body)      payload.Status      = body.Status ?? null;
    if ('SAU_ID' in body)      payload.SAU_ID      = body.SAU_ID ?? null;
    if ('AUSO_ID' in body)     payload.AUSO_ID     = body.AUSO_ID ?? null;

    if (!Object.keys(payload).length)
      return NextResponse.json({ error: 'No updatable fields' }, { status: 400 });

    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('AnnouncementID', idNum) // PascalCase
      .select(FIELDS)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
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
      .eq('AnnouncementID', idNum); // PascalCase

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status: 400 });
  }
}

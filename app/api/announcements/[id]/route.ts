// app/api/announcements/[id]/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseClient';

const TABLE = 'announcement';
const FIELDS =
  'announcementid, topic, description, photourl, dateposted, status, sau_id, auso_id';

// DB -> API (PascalCase) mapper
function mapRow(r: any) {
  return {
    AnnouncementID: r.announcementid,
    Topic: r.topic,
    Description: r.description,
    PhotoURL: r.photourl,
    DatePosted: r.dateposted,
    Status: r.status,
    SAU_ID: r.sau_id ?? null,
    AUSO_ID: r.auso_id ?? null,
  };
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const idNum = Number(id);
    if (!Number.isFinite(idNum)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from(TABLE)
      .select(FIELDS)
      .eq('announcementid', idNum)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(mapRow(data));
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const idNum = Number(id);
    if (!Number.isFinite(idNum)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const body = await req.json();

    // only set provided fields to avoid overwriting with undefined
    const payload: Record<string, any> = {};
    if ('Topic' in body) payload.topic = body.Topic ?? null;
    if ('Description' in body) payload.description = body.Description ?? null;
    if ('PhotoURL' in body) payload.photourl = body.PhotoURL ?? null;
    if ('Status' in body) payload.status = body.Status ?? null;
    if ('SAU_ID' in body) payload.sau_id = body.SAU_ID ?? null;
    if ('AUSO_ID' in body) payload.auso_id = body.AUSO_ID ?? null;

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: 'No updatable fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('announcementid', idNum)
      .select(FIELDS)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(mapRow(data));
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const idNum = Number(id);
    if (!Number.isFinite(idNum)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('announcementid', idNum);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status: 400 });
  }
}

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseClient';

const TABLE = 'announcement';
const FIELDS =
  'announcementid, topic, description, photourl, dateposted, status, sau_id, auso_id';

type Status = 'DRAFT' | 'PENDING' | 'LIVE' | 'COMPLETE' | string;

interface AnnouncementDBRow {
  announcementid: number;
  topic: string;
  description: string | null;
  photourl: string | null;
  dateposted: string;
  status: Status;
  sau_id: number | null;
  auso_id: number | null;
}
interface AnnouncementAPI {
  AnnouncementID: number;
  Topic: string;
  Description: string | null;
  PhotoURL: string | null;
  DatePosted: string;
  Status: Status;
  SAU_ID: number | null;
  AUSO_ID: number | null;
}

function toApi(r: AnnouncementDBRow): AnnouncementAPI {
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
function msg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
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
      .returns<AnnouncementDBRow>()
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(toApi(data));
  } catch (e: unknown) {
    return NextResponse.json({ error: msg(e) || 'Internal error' }, { status: 500 });
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
    const body = (await req.json()) as unknown as Partial<{
      Topic: string | null;
      Description: string | null;
      PhotoURL: string | null;
      Status: Status | null;
      SAU_ID: number | null;
      AUSO_ID: number | null;
    }>;

    const payload: Record<string, unknown> = {};
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
      .returns<AnnouncementDBRow>()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(toApi(data));
  } catch (e: unknown) {
    return NextResponse.json({ error: msg(e) || 'Bad request' }, { status: 400 });
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
  } catch (e: unknown) {
    return NextResponse.json({ error: msg(e) || 'Bad request' }, { status: 400 });
  }
}

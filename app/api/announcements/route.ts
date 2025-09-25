// app/api/announcements/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseClient';

const TABLE = 'announcement';
const FIELDS =
  'announcementid, topic, description, photourl, dateposted, status, sau_id, auso_id';

const ALLOWED_STATUS = new Set(['DRAFT', 'PENDING', 'LIVE', 'COMPLETE']);

// DB -> API (PascalCase)
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

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseServer();
    const { searchParams } = new URL(req.url);

    const status = searchParams.get('status') || undefined;
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const pageSize = Math.max(1, Number(searchParams.get('pageSize') || '9'));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let q = supabase
      .from(TABLE)
      .select(FIELDS, { count: 'exact' })
      // ✅ newest first so fresh SAU submissions appear immediately
      .order('announcementid', { ascending: false });

    if (status) {
      if (!ALLOWED_STATUS.has(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      q = q.eq('status', status);
    }

    const { data, error, count } = await q.range(from, to);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const items = (data ?? []).map(mapRow);

    return NextResponse.json({ page, pageSize, total: count ?? 0, items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServer();
    const body = await req.json();

    const payload: Record<string, any> = {
      topic: (body?.Topic ?? '').trim(),
      description: body?.Description ?? null,
      photourl: body?.PhotoURL ?? null,
      status: body?.Status ?? 'DRAFT',
      sau_id: body?.SAU_ID ?? null,
      auso_id: body?.AUSO_ID ?? null,
    };

    if (!payload.topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }
    if (!ALLOWED_STATUS.has(payload.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from(TABLE)
      .insert(payload)
      .select(FIELDS)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json(mapRow(data), { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status: 400 });
  }
}

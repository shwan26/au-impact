// app/api/announcements/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseClient';

const TABLE = 'announcement';
const FIELDS =
  'announcementid, topic, description, photourl, dateposted, status, sau_id, auso_id';

type Status = 'DRAFT' | 'PENDING' | 'LIVE' | 'COMPLETE' | string;
const ALLOWED_STATUS = new Set<Status>(['DRAFT', 'PENDING', 'LIVE', 'COMPLETE']);

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

interface CreateBody {
  Topic: string;
  Description?: string | null;
  PhotoURL?: string | null;
  Status?: Status;
  SAU_ID?: number | null;
  AUSO_ID?: number | null;
}

const toApi = (r: AnnouncementDBRow): AnnouncementAPI => ({
  AnnouncementID: r.announcementid,
  Topic: r.topic,
  Description: r.description,
  PhotoURL: r.photourl,
  DatePosted: r.dateposted,
  Status: r.status,
  SAU_ID: r.sau_id ?? null,
  AUSO_ID: r.auso_id ?? null,
});

const msg = (e: unknown): string =>
  e instanceof Error ? e.message : String(e);

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
      .order('announcementid', { ascending: false });

    if (status) {
      if (!ALLOWED_STATUS.has(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      q = q.eq('status', status);
    }

    const { data, error, count } = await q
      .returns<AnnouncementDBRow[]>()
      .range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const items = (data ?? []).map(toApi);
    return NextResponse.json({ page, pageSize, total: count ?? 0, items });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: msg(e) || 'Internal error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServer();
    const body = (await req.json()) as CreateBody;

    const payload: Omit<AnnouncementDBRow, 'announcementid' | 'dateposted'> = {
      topic: (body.Topic ?? '').trim(),
      description: body.Description ?? null,
      photourl: body.PhotoURL ?? null,
      status: (body.Status ?? 'DRAFT') as Status,
      sau_id: body.SAU_ID ?? null,
      auso_id: body.AUSO_ID ?? null,
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
      .returns<AnnouncementDBRow>()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || 'Create failed' },
        { status: 400 }
      );
    }

    return NextResponse.json(toApi(data), { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: msg(e) || 'Bad request' },
      { status: 400 }
    );
  }
}

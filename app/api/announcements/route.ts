export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseClient';

const TABLE = 'announcement';
const FIELDS =
  'announcementid, topic, description, photourl, dateposted, status, sau_id, auso_id';

type Status = 'DRAFT' | 'PENDING' | 'LIVE' | 'COMPLETE' | string;
<<<<<<< HEAD
const ALLOWED_STATUS = new Set<Status>(['DRAFT', 'PENDING', 'LIVE', 'COMPLETE']);
=======
>>>>>>> 97bd460cf094a4380cb3b7a5fa6c562d71094487

interface AnnouncementDBRow {
  announcementid: number;
  topic: string;
  description: string | null;
  photourl: string | null;
  dateposted: string;
  status: Status;
  sau_id: number | null;
  auso_id: number | null;
<<<<<<< HEAD
=======
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
>>>>>>> 97bd460cf094a4380cb3b7a5fa6c562d71094487
}
function msg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
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
    const url = new URL(req.url);
    const page = Number(url.searchParams.get('page') || '1');
    const pageSize = Number(url.searchParams.get('pageSize') || '20');
    const status = url.searchParams.get('status');
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = getSupabaseServer();

    let query = supabase
      .from(TABLE)
      .select(FIELDS, { count: 'exact' })
<<<<<<< HEAD
      .order('announcementid', { ascending: false });
=======
      .order('announcementid', { ascending: false })
      .returns<AnnouncementDBRow[]>();
>>>>>>> 97bd460cf094a4380cb3b7a5fa6c562d71094487

    if (status) query = query.eq('status', status);

<<<<<<< HEAD
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
=======
    const { data, error, count } = await query.range(from, to);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({
      items: (data ?? []).map(toApi),
      total: count ?? 0,
      page,
      pageSize,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: msg(e) || 'Internal error' }, { status: 500 });
>>>>>>> 97bd460cf094a4380cb3b7a5fa6c562d71094487
  }
}

export async function POST(req: Request) {
  try {
<<<<<<< HEAD
    const supabase = getSupabaseServer();
    const body = (await req.json()) as CreateBody;

    const payload: Omit<AnnouncementDBRow, 'announcementid' | 'dateposted'> = {
      topic: (body.Topic ?? '').trim(),
      description: body.Description ?? null,
      photourl: body.PhotoURL ?? null,
      status: (body.Status ?? 'DRAFT') as Status,
=======
    const body = (await req.json()) as unknown as Partial<{
      Topic: string;
      Description: string | null;
      PhotoURL: string | null;
      Status: Status;
      SAU_ID: number | null;
      AUSO_ID: number | null;
    }>;

    const payload: Record<string, unknown> = {
      topic: (body.Topic ?? '').toString(),
      description: body.Description ?? null,
      photourl: body.PhotoURL ?? null,
      status: body.Status ?? 'DRAFT',
>>>>>>> 97bd460cf094a4380cb3b7a5fa6c562d71094487
      sau_id: body.SAU_ID ?? null,
      auso_id: body.AUSO_ID ?? null,
    };

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from(TABLE)
      .insert(payload)
      .select(FIELDS)
      .returns<AnnouncementDBRow>()
      .single();

<<<<<<< HEAD
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
=======
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(toApi(data));
  } catch (e: unknown) {
    return NextResponse.json({ error: msg(e) || 'Bad request' }, { status: 400 });
>>>>>>> 97bd460cf094a4380cb3b7a5fa6c562d71094487
  }
}

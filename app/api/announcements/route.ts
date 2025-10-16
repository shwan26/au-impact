// app/api/announcements/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

const TABLE = 'Announcement';
const FIELDS =
  '"AnnouncementID","Topic","Description","PhotoURL","DatePosted","Status","SAU_ID","AUSO_ID"';

// ---- Status typing (no `any`) ---------------------------------------------

const STATUSES = ['DRAFT', 'PENDING', 'LIVE', 'COMPLETE'] as const;
type AnnouncementStatus = (typeof STATUSES)[number];
const ALLOWED_STATUS = new Set<AnnouncementStatus>(STATUSES);

function isAnnouncementStatus(x: string): x is AnnouncementStatus {
  return ALLOWED_STATUS.has(x as AnnouncementStatus);
}

// ---- small helpers ---------------------------------------------------------

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}

function toStringOrEmpty(v: unknown): string {
  return typeof v === 'string' ? v : (v == null ? '' : String(v));
}

function toNullableString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  return String(v);
}

// ---- GET: list with pagination & status filter -----------------------------

export async function GET(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
    const pageSize = Math.max(1, Number(searchParams.get('pageSize') ?? '20'));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let q = supabase
      .from(TABLE)
      .select(FIELDS, { count: 'exact' })
      .order('DatePosted', { ascending: false }); // PascalCase column

    const statusParam = searchParams.get('status');
    if (statusParam) {
      if (!isAnnouncementStatus(statusParam)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      q = q.eq('Status', statusParam); // PascalCase column
    }

    const { data, error, count } = await q.range(from, to);
    if (error) {
      // eslint-disable-next-line no-console
      console.error('GET /api/announcements error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      page,
      pageSize,
      total: count ?? 0,
      items: data ?? [],
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal error';
    // eslint-disable-next-line no-console
    console.error('GET /api/announcements crash:', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---- POST: create an announcement (uses SAU of current user) --------------

type AnnouncementInsert = {
  Topic: string;
  Description: string | null;
  PhotoURL: string | null;
  Status: AnnouncementStatus;
  SAU_ID: number; // required once we resolve current SAU
  AUSO_ID?: number | null;
};

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const raw = (await req.json()) as unknown;

    if (!isRecord(raw)) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const Topic = toStringOrEmpty(raw.Topic).trim();
    const Description = toNullableString(raw.Description);
    const PhotoURL = toNullableString(raw.PhotoURL);

    const rawStatus = toStringOrEmpty(raw.Status).trim() || 'DRAFT';
    const Status: AnnouncementStatus = isAnnouncementStatus(rawStatus)
      ? rawStatus
      : 'DRAFT';

    if (!Topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // current user
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr) {
      return NextResponse.json({ error: authErr.message }, { status: 401 });
    }
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    // resolve SAU for current user
    const { data: me } = await supabase
      .from('sau')
      .select('sau_id,name')
      .eq('auth_uid', user.id)
      .maybeSingle();

    if (!me?.sau_id) {
      return NextResponse.json(
        { error: 'Your account is not linked to any SAU' },
        { status: 403 }
      );
    }

    const insertPayload: AnnouncementInsert = {
      Topic,
      Description,
      PhotoURL,
      Status,
      SAU_ID: me.sau_id,
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert(insertPayload)
      .select(FIELDS)
      .single();

    if (error) {
      // Common RLS failure hint:
      // Ensure your insert policy allows rows with SAU_ID = current user's SAU.
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Bad request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

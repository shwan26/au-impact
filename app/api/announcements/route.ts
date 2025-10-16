// app/api/announcements/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

const TABLE  = 'Announcement';
const FIELDS = '"AnnouncementID","Topic","Description","PhotoURL","DatePosted","Status","SAU_ID","AUSO_ID"';
const ALLOWED_STATUS = new Set(['DRAFT', 'PENDING', 'LIVE', 'COMPLETE']);

export async function GET(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const pageSize = Math.max(1, Number(searchParams.get('pageSize') || '20'));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let q = supabase
      .from(TABLE)
      .select(FIELDS, { count: 'exact' })
      .order('DatePosted', { ascending: false }); // PascalCase

    const status = searchParams.get('status') || undefined;
    if (status) {
      if (!ALLOWED_STATUS.has(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      q = q.eq('Status', status); // PascalCase
    }

    const { data, error, count } = await q.range(from, to);
    if (error) {
      console.error('GET /api/announcements error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ page, pageSize, total: count ?? 0, items: data ?? [] });
  } catch (e: any) {
    console.error('GET /api/announcements crash:', e);
    return NextResponse.json({ error: e?.message ?? 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const body = await req.json();

    const Topic       = (body?.Topic ?? '').toString().trim();
    const Description = body?.Description ?? null;
    const PhotoURL    = body?.PhotoURL ?? null;
    const Status      = body?.Status ?? 'DRAFT';

    if (!Topic) return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    if (!ALLOWED_STATUS.has(Status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Find SAU_ID for the current user (using auth.uid())
    // BEFORE (your pasted copy already fixed the .from, but columns still uppercase)
    const { data: me, error: meErr } = await supabase
      .from('sau')                          // ✅ correct table name
      .select('sau_id,name')                // ✅ column names are lowercase if created unquoted
      .eq('auth_uid', (await supabase.auth.getUser()).data.user?.id ?? '')
      .maybeSingle();

    if (!me?.sau_id) {                      // ✅ use lowercase alias here too
      return NextResponse.json({ error: 'Your account is not linked to any SAU' }, { status: 403 });
    }

    const insertPayload = {
      Topic,
      Description,
      PhotoURL,
      Status,
      SAU_ID: me.sau_id,                    // ✅ map lowercase → PascalCase column on Announcement
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert(insertPayload)
      .select(FIELDS)
      .single();

    if (error) {
      // Common RLS failure hint:
      // Check that "announcement_insert_by_sau" policy matches SAU_ID above.
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status: 400 });
  }
}
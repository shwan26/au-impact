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

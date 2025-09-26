// app/api/announcements/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

const TABLE = 'Announcement';
const FIELDS = '"AnnouncementID","Topic","Description","PhotoURL","DatePosted","Status","SAU_ID","AUSO_ID"';
const ALLOWED_STATUS = new Set(['DRAFT', 'PENDING', 'LIVE', 'COMPLETE']);

export async function GET(req: Request) {
  const supabase = await getSupabaseServer();
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const pageSize = Math.max(1, Number(searchParams.get('pageSize') || '20'));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase.from(TABLE).select(FIELDS, { count: 'exact' }).order('AnnouncementID', { ascending: false });

  const status = searchParams.get('status') || undefined;
  if (status) {
    if (!ALLOWED_STATUS.has(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    q = q.eq('Status', status);
  }

  const { data, error, count } = await q.range(from, to);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ page, pageSize, total: count ?? 0, items: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = await getSupabaseServer();
  const body = await req.json().catch(() => ({} as any));

  // must receive cookies from client: fetch(..., { credentials: 'include' })
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // 🔽 use lowercase table/columns
  const { data: sau, error: sauErr } = await supabase
    .from('sau')
    .select('sau_id,name')           // your columns are lowercase
    .eq('auth_uid', user.id)
    .maybeSingle();

  if (sauErr) return NextResponse.json({ error: sauErr.message }, { status: 500 });
  if (!sau?.sau_id) {
    return NextResponse.json(
      { error: 'No SAU linked to this account (sau.auth_uid must equal your auth user id, and RLS must allow SELECT).' },
      { status: 400 }
    );
  }

  const topic = String(body?.Topic ?? '').trim();
  const status = body?.Status ?? 'DRAFT';
  if (!topic) return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
  if (!ALLOWED_STATUS.has(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });

  const payload = {
    Topic: topic,
    Description: body?.Description ?? null,
    PhotoURL: body?.PhotoURL ?? null,
    Status: status,
    SAU_ID: sau.sau_id,   // 🔽 link the lowercase id to PascalCase column on Announcement
    AUSO_ID: null,
  };

  const { data, error } = await supabase
    .from(TABLE)          // 'Announcement' is PascalCase in your DB
    .insert(payload)
    .select(FIELDS)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

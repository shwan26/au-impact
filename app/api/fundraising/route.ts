// app/api/fundraising/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseClient';

const TABLE = 'fundraising' as const;

const POSTER_BUCKET = process.env.NEXT_PUBLIC_POSTER_BUCKET ?? 'posters';
const QR_BUCKET = process.env.NEXT_PUBLIC_QR_BUCKET ?? 'qr';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

const SELECT_COLS = [
  'fundid',
  'title',
  'description',
  'status',
  'orgname',
  'orglineid',
  'location',
  'expectedamount',
  'currentamount',
  'posterurl',
  'qrurl',
  'bankbookname',
  'bankbookaccount',
  'bankname',
].join(',');

// helpers
function toPublicUrl(bucket: string, p?: string | null) {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  const clean = String(p).replace(/^\/+/, '');
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${clean}`;
}
function stripPublicPrefix(bucket: string, url: string) {
  const re = new RegExp(
    `^https?:\\/\\/[^/]+\\/storage\\/v1\\/object\\/public\\/${bucket}\\/`,
    'i'
  );
  return url.replace(re, '');
}
function normalizeIncomingStatus(s?: string | null) {
  const up = String(s ?? 'PENDING').toUpperCase();
  if (up === 'APPROVED' || up === 'COMPLETE') return 'ENDED';
  return up; // PENDING, LIVE, REJECTED, ENDED…
}

function mapRow(r: any) {
  return {
    id: String(r.fundid),
    title: r.title,
    description: r.description ?? null,
    status: r.status ?? 'PENDING',
    organizerName: r.orgname ?? null,
    contactLine: r.orglineid ?? null,
    location: r.location ?? null,
    startDate: null,
    endDate: null,
    goal: r.expectedamount ?? null,
    currentDonation: r.currentamount ?? null,
    imageUrl: toPublicUrl(POSTER_BUCKET, r.posterurl ?? null),
    qrUrl: toPublicUrl(QR_BUCKET, r.qrurl ?? null),
    bankBookName: r.bankbookname ?? null,
    bankBookAccount: r.bankbookaccount ?? null,
    bankName: r.bankname ?? null,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? undefined;
  const q = (searchParams.get('q') ?? '').trim();

  const supabase = getSupabaseServer();
  let query = supabase.from(TABLE).select(SELECT_COLS).order('fundid', { ascending: false });

  if (status) query = query.eq('status', status);
  if (q) query = query.ilike('title', `%${q}%`);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return NextResponse.json(
    { items: (data ?? []).map(mapRow) },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));

  const row: Record<string, any> = {};
  if (typeof body.title === 'string') row.title = body.title;
  if (typeof body.description === 'string') row.description = body.description;
  // ✅ normalize to ENDED for approved/complete
  row.status = normalizeIncomingStatus(typeof body.status === 'string' ? body.status : 'PENDING');

  if (typeof body.organizerName === 'string') row.orgname = body.organizerName;
  if (typeof body.contactLine === 'string') row.orglineid = body.contactLine;
  if (typeof body.location === 'string') row.location = body.location;

  // Poster URL -> path
  if (typeof body.imageUrl === 'string' && body.imageUrl.trim()) {
    const s = body.imageUrl.trim();
    row.posterurl = /^https?:\/\//i.test(s) ? stripPublicPrefix(POSTER_BUCKET, s) : s;
  }

  // QR URL -> path
  if (typeof body.qrUrl === 'string' && body.qrUrl.trim()) {
    const s = body.qrUrl.trim();
    row.qrurl = /^https?:\/\//i.test(s) ? stripPublicPrefix(QR_BUCKET, s) : s;
  }

  // Bank fields
  if (typeof body.bankBookName === 'string') row.bankbookname = body.bankBookName;
  if (typeof body.bankBookAccount === 'string') row.bankbookaccount = body.bankBookAccount;
  if (typeof body.bankName === 'string') row.bankname = body.bankName;

  // Goal
  if (body.goal !== undefined && body.goal !== null && !Number.isNaN(Number(body.goal))) {
    row.expectedamount = Number(body.goal);
  }

  if (!row.title) {
    return NextResponse.json(
      { error: 'title is required' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from(TABLE).insert(row).select(SELECT_COLS).maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: 'Insert failed' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return NextResponse.json(mapRow(data), {
    status: 201,
    headers: { 'Cache-Control': 'no-store' },
  });
}

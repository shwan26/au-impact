/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

const TABLE = 'Fundraising' as const;

const POSTER_BUCKET = process.env.NEXT_PUBLIC_POSTER_BUCKET ?? 'posters';
const QR_BUCKET = process.env.NEXT_PUBLIC_QR_BUCKET ?? 'qr';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

const SELECT_COLS = [
  '"FundID"',
  '"Title"',
  '"Description"',
  '"Status"',
  '"OrgName"',
  '"OrgLineID"',
  '"Location"',
  '"Timeframe"',
  '"ExpectedAmount"',
  '"CurrentAmount"',
  '"PosterURL"',
  '"QRURL"',
  '"BankBookName"',
  '"BankBookAccount"',
  '"BankName"',
  '"SAU_ID"',
  '"AUSO_ID"',
].join(',');

function toPublicUrl(bucket: string, p?: string | null) {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  const clean = String(p).replace(/^\/+/, '');
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${clean}`;
}
function stripPublicPrefix(bucket: string, url: string) {
  const re = new RegExp(`^https?:\\/\\/[^/]+\\/storage\\/v1\\/object\\/public\\/${bucket}\\/`, 'i');
  return url.replace(re, '');
}

function mapRow(r: any) {
  return {
    id: String(r.FundID),
    title: r.Title,
    description: r.Description ?? null,
    status: r.Status ?? 'PENDING',
    organizerName: r.OrgName ?? null,
    contactLine: r.OrgLineID ?? null,
    location: r.Location ?? null,
    timeframe: r.Timeframe ?? null,
    goal: r.ExpectedAmount ?? null,
    currentDonation: r.CurrentAmount ?? 0,
    imageUrl: toPublicUrl(POSTER_BUCKET, r.PosterURL ?? null),
    qrUrl: toPublicUrl(QR_BUCKET, r.QRURL ?? null),
    bankBookName: r.BankBookName ?? null,
    bankBookAccount: r.BankBookAccount ?? null,
    bankName: r.BankName ?? null,
    SAU_ID: r.SAU_ID ?? null,
    AUSO_ID: r.AUSO_ID ?? null,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? undefined;
  const q = (searchParams.get('q') ?? '').trim();

  const supabase = await getSupabaseServer(); // ✅ await
  let query = supabase.from(TABLE).select(SELECT_COLS).order('FundID', { ascending: false });

  if (status) query = query.eq('Status', status);                 // ✅ exact case
  if (q)      query = query.ilike('Title', `%${q}%`);             // ✅ exact case

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ items: (data ?? []).map(mapRow) }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));

  // Build row with PascalCase keys matching your schema
  const row: Record<string, any> = {};
  if (typeof body.title === 'string') row.Title = body.title;
  if (typeof body.description === 'string') row.Description = body.description;
  if (typeof body.status === 'string') row.Status = body.status;
  if (typeof body.organizerName === 'string') row.OrgName = body.organizerName;
  if (typeof body.contactLine === 'string') row.OrgLineID = body.contactLine;
  if (typeof body.location === 'string') row.Location = body.location;
  if (typeof body.timeframe === 'string') row.Timeframe = body.timeframe;

  if (body.goal !== undefined && body.goal !== null && !Number.isNaN(Number(body.goal))) {
    row.ExpectedAmount = Number(body.goal);
  }

  // Poster/QR: allow full URL or storage path
  if (typeof body.imageUrl === 'string' && body.imageUrl.trim()) {
    const s = body.imageUrl.trim();
    row.PosterURL = /^https?:\/\//i.test(s) ? stripPublicPrefix(POSTER_BUCKET, s) : s;
  }
  if (typeof body.qrUrl === 'string' && body.qrUrl.trim()) {
    const s = body.qrUrl.trim();
    row.QRURL = /^https?:\/\//i.test(s) ? stripPublicPrefix(QR_BUCKET, s) : s;
  }

  // Bank fields
  if (typeof body.bankBookName === 'string') row.BankBookName = body.bankBookName;
  if (typeof body.bankBookAccount === 'string') row.BankBookAccount = body.bankBookAccount;
  if (typeof body.bankName === 'string') row.BankName = body.bankName;

  if (!row.Title) return NextResponse.json({ error: 'title is required' }, { status: 400 });

  const supabase = await getSupabaseServer(); // ✅ await
  const { data, error } = await supabase
    .from(TABLE)
    .insert(row)
    .select(SELECT_COLS)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Insert failed' }, { status: 500 });

  return NextResponse.json(mapRow(data), { status: 201, headers: { 'Cache-Control': 'no-store' } });
}

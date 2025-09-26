/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

const TABLE = 'Fundraising';
const SELECT_COLS =
  '"FundID","Title","Description","Status","OrgName","OrgLineID","Location","Timeframe","ExpectedAmount","CurrentAmount","PosterURL","QRURL","BankBookName","BankBookAccount","BankName","SAU_ID","AUSO_ID"';

const POSTER_BUCKET = process.env.NEXT_PUBLIC_POSTER_BUCKET ?? 'posters';
const QR_BUCKET = process.env.NEXT_PUBLIC_QR_BUCKET ?? 'qr';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

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

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT_COLS)
    .eq('FundID', idNum)         // ✅ exact case
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(mapRow(data), { headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const body = await req.json().catch(() => ({}));
  const { id } = await ctx.params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const update: Record<string, any> = {};
  if (typeof body.title === 'string') update.Title = body.title;
  if (typeof body.description === 'string') update.Description = body.description;
  if (typeof body.status === 'string') update.Status = body.status;
  if (typeof body.organizerName === 'string') update.OrgName = body.organizerName;
  if (typeof body.contactLine === 'string') update.OrgLineID = body.contactLine;
  if (typeof body.location === 'string') update.Location = body.location;
  if (typeof body.timeframe === 'string') update.Timeframe = body.timeframe;

  if (typeof body.imageUrl === 'string') {
    const s = body.imageUrl.trim();
    update.PosterURL = s ? (/^https?:\/\//i.test(s) ? stripPublicPrefix(POSTER_BUCKET, s) : s) : null;
  }
  if (typeof body.qrUrl === 'string') {
    const s = body.qrUrl.trim();
    update.QRURL = s ? (/^https?:\/\//i.test(s) ? stripPublicPrefix(QR_BUCKET, s) : s) : null;
  }

  if (typeof body.bankBookName === 'string') update.BankBookName = body.bankBookName;
  if (typeof body.bankBookAccount === 'string') update.BankBookAccount = body.bankBookAccount;
  if (typeof body.bankName === 'string') update.BankName = body.bankName;

  if (body.goal !== undefined && body.goal !== null && !Number.isNaN(Number(body.goal))) {
    update.ExpectedAmount = Number(body.goal);
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No updatable fields', receivedKeys: Object.keys(body) }, { status: 400 });
  }

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from(TABLE)
    .update(update)
    .eq('FundID', idNum)         // ✅ exact case
    .select(SELECT_COLS)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(mapRow(data), { headers: { 'Cache-Control': 'no-store' } });
}

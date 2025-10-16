// app/api/fundraising/[id]/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseClient';

const TABLE = 'fundraising';

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
  const re = new RegExp(
    `^https?:\\/\\/[^/]+\\/storage\\/v1\\/object\\/public\\/${bucket}\\/`,
    'i'
  );
  return url.replace(re, '');
}

const SELECT_COLS =
  'fundid,title,description,status,orgname,orglineid,location,expectedamount,currentamount,posterurl,qrurl,bankbookname,bankbookaccount,bankname';

function mapRow(r: any) {
  return {
    id: r.fundid,
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

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) {
    return NextResponse.json(
      { error: 'Invalid id' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT_COLS)
    .eq('fundid', idNum)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return NextResponse.json(mapRow(data), { headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const body = await req.json().catch(() => ({}));
  const { id } = await ctx.params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) {
    return NextResponse.json(
      { error: 'Invalid id' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const update: Record<string, any> = {};
  if (typeof body.title === 'string') update.title = body.title;
  if (typeof body.description === 'string') update.description = body.description;
  if (typeof body.status === 'string') update.status = body.status;
  if (typeof body.organizerName === 'string') update.orgname = body.organizerName;
  if (typeof body.contactLine === 'string') update.orglineid = body.contactLine;
  if (typeof body.location === 'string') update.location = body.location;

  // Poster
  if (typeof body.imageUrl === 'string') {
    const s = body.imageUrl.trim();
    update.posterurl = s ? (/^https?:\/\//i.test(s) ? stripPublicPrefix(POSTER_BUCKET, s) : s) : null;
  }

  // QR
  if (typeof body.qrUrl === 'string') {
    const s = body.qrUrl.trim();
    update.qrurl = s ? (/^https?:\/\//i.test(s) ? stripPublicPrefix(QR_BUCKET, s) : s) : null;
  }

  // Bank fields
  if (typeof body.bankBookName === 'string') update.bankbookname = body.bankBookName;
  if (typeof body.bankBookAccount === 'string') update.bankbookaccount = body.bankBookAccount;
  if (typeof body.bankName === 'string') update.bankname = body.bankName;

  // Goal
  if (body.goal !== undefined && body.goal !== null && !Number.isNaN(Number(body.goal))) {
    update.expectedamount = Number(body.goal);
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: 'No updatable fields', receivedKeys: Object.keys(body) },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from(TABLE)
    .update(update)
    .eq('fundid', idNum)
    .select(SELECT_COLS)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return NextResponse.json(mapRow(data), { headers: { 'Cache-Control': 'no-store' } });
}

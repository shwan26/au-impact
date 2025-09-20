import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseClient';

const TABLE = 'fundraising' as const;
const SELECT_COLS =
  'fundid, title, description, status, orgname, orglineid, location, expectedamount, currentamount, posterurl';

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
    imageUrl: r.posterurl ?? null,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? undefined;

  const supabase = getSupabaseServer();
  let q = supabase.from(TABLE).select(SELECT_COLS).order('fundid', { ascending: false });
  if (status) q = q.eq('status', status);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ items: (data ?? []).map(mapRow) });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));

  const row: Record<string, any> = {};
  if (typeof body.title === 'string') row.title = body.title;
  if (typeof body.description === 'string') row.description = body.description;
  if (typeof body.status === 'string') row.status = body.status; // defaults to PENDING if you set it in DB
  if (typeof body.organizerName === 'string') row.orgname = body.organizerName;
  if (typeof body.contactLine === 'string') row.orglineid = body.contactLine;
  if (typeof body.location === 'string') row.location = body.location;
  if (typeof body.imageUrl === 'string') row.posterurl = body.imageUrl;
  if (body.goal !== undefined && body.goal !== null && !Number.isNaN(Number(body.goal))) {
    row.expectedamount = Number(body.goal);
  }

  if (!row.title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from(TABLE).insert(row).select(SELECT_COLS).maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Insert failed' }, { status: 500 });

  return NextResponse.json(mapRow(data), { status: 201 });
}

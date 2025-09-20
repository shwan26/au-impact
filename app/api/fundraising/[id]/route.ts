// app/api/fundraising/[id]/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseClient';

const TABLE = 'fundraising';

function toPublicUrl(p?: string | null) {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public/posters/${String(p).replace(/^\/+/, '')}`;
}

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
    imageUrl: toPublicUrl(r.posterurl ?? null),
  };
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from(TABLE)
    .select('fundid,title,description,status,orgname,orglineid,location,expectedamount,currentamount,posterurl')
    .eq('fundid', idNum)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(mapRow(data));
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const body = await req.json().catch(() => ({}));
  const { id } = await ctx.params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const update: Record<string, any> = {};
  if (typeof body.title === 'string') update.title = body.title;
  if (typeof body.description === 'string') update.description = body.description;
  if (typeof body.status === 'string') update.status = body.status;
  if (typeof body.organizerName === 'string') update.orgname = body.organizerName;
  if (typeof body.contactLine === 'string') update.orglineid = body.contactLine;
  if (typeof body.location === 'string') update.location = body.location;
  if (typeof body.imageUrl === 'string') {
    update.posterurl = body.imageUrl.replace(
      /^https?:\/\/[^/]+\/storage\/v1\/object\/public\/posters\//,
      ''
    );
  }
  if (body.goal !== undefined && body.goal !== null && !Number.isNaN(Number(body.goal))) {
    update.expectedamount = Number(body.goal);
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: 'No updatable fields', receivedKeys: Object.keys(body) },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from(TABLE)
    .update(update)
    .eq('fundid', idNum)
    .select('fundid,title,description,status,orgname,orglineid,location,expectedamount,currentamount,posterurl')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(mapRow(data));
}

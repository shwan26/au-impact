// app/api/fundraising/[id]/donations/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseClient';

type OutDonation = {
  id: number;
  name: string;
  amount: number;
  at: string;
  slip?: string | null;
};

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    return NextResponse.json({ error: 'Invalid fundraising id' }, { status: 400 });
  }

  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from('donation')
    .select('donationid, fundid, amount, nickname, isanonymous, submittedat, slipupload')
    .eq('fundid', idNum)
    .order('submittedat', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items: OutDonation[] = (data ?? []).map((r: any) => ({
    id: r.donationid,
    name: r.isanonymous ? 'Anonymous' : (r.nickname || 'Anonymous'),
    amount: Number(r.amount ?? 0),
    at: r.submittedat ? new Date(r.submittedat).toISOString() : new Date().toISOString(),
    slip: r.slipupload ?? null,
  }));

  const totalAmount = items.reduce((s, d) => s + (d.amount || 0), 0);

  return NextResponse.json(
    { items, total: items.length, totalAmount },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    return NextResponse.json({ error: 'Invalid fundraising id' }, { status: 400 });
  }

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 });
  }

  const nickname = typeof body.name === 'string' ? body.name.trim() : '';
  const isanonymous = Boolean(body.anonymous);
  const slipupload =
    typeof body.slip === 'string' && body.slip.trim() ? body.slip.trim() : null;

  const supabase = getSupabaseServer();

  // 1) Ensure the fundraising exists (optional: require status LIVE)
  const { data: fundRow, error: fundErr } = await supabase
    .from('fundraising')
    .select('fundid, status')
    .eq('fundid', idNum)
    .maybeSingle();

  if (fundErr) return NextResponse.json({ error: fundErr.message }, { status: 500 });
  if (!fundRow) return NextResponse.json({ error: 'Fundraising not found' }, { status: 404 });
  // If you want to restrict donations to LIVE only:
  // if ((fundRow as any).status !== 'LIVE') {
  //   return NextResponse.json({ error: 'Donations are closed for this campaign' }, { status: 400 });
  // }

  // 2) Insert donation
  const { data: ins, error: insErr } = await supabase
    .from('donation')
    .insert({
      fundid: idNum,
      amount,
      nickname,
      isanonymous,
      slipupload,
      // submittedat can be a default NOW() at DB level; omit if so
    })
    .select('donationid, amount, nickname, isanonymous, submittedat, slipupload')
    .maybeSingle();

  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  // 3) Recompute total (robust against race conditions) and store on fundraising
  const { data: agg, error: aggErr } = await supabase
    .from('donation')
    .select('amount')
    .eq('fundid', idNum);

  if (aggErr) return NextResponse.json({ error: aggErr.message }, { status: 500 });

  const totalAmount = (agg ?? []).reduce((s, r: any) => s + Number(r.amount || 0), 0);

  const { error: updErr } = await supabase
    .from('fundraising')
    .update({ currentamount: totalAmount })
    .eq('fundid', idNum);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  const out: OutDonation = {
    id: ins!.donationid,
    name: ins!.isanonymous ? 'Anonymous' : (ins!.nickname || 'Anonymous'),
    amount: Number(ins!.amount || 0),
    at: ins!.submittedat ? new Date(ins!.submittedat).toISOString() : new Date().toISOString(),
    slip: ins!.slipupload ?? null,
  };

  return NextResponse.json(
    { created: out, totalAmount },
    { status: 201, headers: { 'Cache-Control': 'no-store' } }
  );
}

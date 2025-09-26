/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

type OutDonation = {
  id: number;
  name: string;
  amount: number;
  at: string;
  slip?: string | null;
};

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum) || idNum <= 0) return NextResponse.json({ error: 'Invalid fundraising id' }, { status: 400 });

  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from('Donation')
    .select('"DonationID","FundID","Amount","NickName","IsAnonymous","SubmittedAt","SlipUpload"')
    .eq('FundID', idNum)
    .order('SubmittedAt', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items: OutDonation[] = (data ?? []).map((r: any) => ({
    id: r.DonationID,
    name: r.IsAnonymous ? 'Anonymous' : (r.NickName || 'Anonymous'),
    amount: Number(r.Amount ?? 0),
    at: r.SubmittedAt ? new Date(r.SubmittedAt).toISOString() : new Date().toISOString(),
    slip: r.SlipUpload ?? null,
  }));

  const totalAmount = items.reduce((s, d) => s + (d.amount || 0), 0);

  return NextResponse.json({ items, total: items.length, totalAmount }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum) || idNum <= 0) return NextResponse.json({ error: 'Invalid fundraising id' }, { status: 400 });

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 });
  }

  const NickName = typeof body.name === 'string' ? body.name.trim() : '';
  const IsAnonymous = Boolean(body.anonymous);
  const SlipUpload = typeof body.slip === 'string' && body.slip.trim() ? body.slip.trim() : null;

  const supabase = await getSupabaseServer();

  // Ensure Fund exists
  const { data: fundRow, error: fundErr } = await supabase
    .from('Fundraising')
    .select('"FundID","Status"')
    .eq('FundID', idNum)
    .maybeSingle();

  if (fundErr) return NextResponse.json({ error: fundErr.message }, { status: 500 });
  if (!fundRow) return NextResponse.json({ error: 'Fundraising not found' }, { status: 404 });

  // Insert donation
  const { data: ins, error: insErr } = await supabase
    .from('Donation')
    .insert({
      FundID: idNum,
      Amount: amount,
      NickName,
      IsAnonymous,
      SlipUpload,
    })
    .select('"DonationID","Amount","NickName","IsAnonymous","SubmittedAt","SlipUpload"')
    .maybeSingle();

  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  // Recompute total & update Fundraising.CurrentAmount
  const { data: agg, error: aggErr } = await supabase
    .from('Donation')
    .select('"Amount"')
    .eq('FundID', idNum);

  if (aggErr) return NextResponse.json({ error: aggErr.message }, { status: 500 });

  const totalAmount = (agg ?? []).reduce((s, r: any) => s + Number(r.Amount || 0), 0);

  const { error: updErr } = await supabase
    .from('Fundraising')
    .update({ CurrentAmount: totalAmount })
    .eq('FundID', idNum);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  const out: OutDonation = {
    id: ins!.DonationID,
    name: ins!.IsAnonymous ? 'Anonymous' : (ins!.NickName || 'Anonymous'),
    amount: Number(ins!.Amount || 0),
    at: ins!.SubmittedAt ? new Date(ins!.SubmittedAt).toISOString() : new Date().toISOString(),
    slip: ins!.SlipUpload ?? null,
  };

  return NextResponse.json({ created: out, totalAmount }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
}

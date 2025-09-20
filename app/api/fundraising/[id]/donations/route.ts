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
  req: Request,
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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items: OutDonation[] = (data ?? []).map((r: any) => ({
    id: r.donationid,
    name: r.isanonymous ? 'Anonymous' : (r.nickname || 'Anonymous'),
    amount: Number(r.amount ?? 0),
    at: r.submittedat ? new Date(r.submittedat).toISOString() : new Date().toISOString(),
    slip: r.slipupload ?? null,
  }));

  const totalAmount = items.reduce((s, d) => s + (d.amount || 0), 0);

  return NextResponse.json({
    items,
    total: items.length,
    totalAmount,
  }, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

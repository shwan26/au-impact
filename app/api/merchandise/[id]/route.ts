// app/api/merchandise/[id]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerClientForRoute } from '@/lib/supabaseServer';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = await createServerClientForRoute();
  const { data, error } = await supabase
    .from('v_merch')
    .select('*')
    .eq('itemid', Number(params.id))
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createServerClientForRoute();
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const id = Number(params.id);
  const url = new URL(req.url);
  const statusFromQuery = url.searchParams.get('status');

  const patch: Record<string, any> = {};

  if (req.headers.get('content-type')?.includes('form-data')) {
    const form = await req.formData();

    const title  = form.get('title');
    const price  = form.get('price');
    const status = form.get('status');

    const pickuppoint  = form.get('pickupLocation');
    const pickupdate   = form.get('pickupDate');
    const pickuptime   = form.get('pickupTime');
    const pickupPhoto  = form.get('pickupPhoto') as File | null;

    if (title)       patch.title = String(title);
    if (price)       patch.price = Number(price);
    if (status)      patch.status = String(status);
    if (pickuppoint) patch.pickuppoint = String(pickuppoint);
    if (pickupdate)  patch.pickupdate  = String(pickupdate);
    if (pickuptime)  patch.pickuptime  = String(pickuptime);

    if (pickupPhoto) {
      const filePath = `${userRes.user.id}/${id}/pickup_${Date.now()}`;
      const { error: upErr } = await supabase.storage.from('merch').upload(filePath, pickupPhoto, {
        contentType: pickupPhoto.type || 'image/jpeg',
        upsert: true,
      });
      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });
      const { data: pub } = supabase.storage.from('merch').getPublicUrl(filePath);
      patch.pickupphotourl = pub.publicUrl;
    }
  }

  if (statusFromQuery) patch.status = statusFromQuery;
  if (Object.keys(patch).length === 0) return NextResponse.json({ ok: true });

  const { error } = await supabase.from('merchandise').update(patch).eq('itemid', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}

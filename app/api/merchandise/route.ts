// app/api/merchandise/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerClientForRoute } from '@/lib/supabaseServer';

// Resolve SAU_ID from the logged-in SAU account
async function getLoggedInSauId() {
  const supabase = await createServerClientForRoute();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user ?? null;

  // Table is 'sau', column is 'sau_id' (both lower-case)
  const { data: sauRow } = user
    ? await supabase.from('sau').select('sau_id').single()
    : { data: null };

  return { supabase, user, sauId: sauRow?.sau_id ?? null };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sauIdParam = url.searchParams.get('sauId');

  const { supabase, user, sauId } = await getLoggedInSauId();
  const effectiveSauId = sauIdParam ? Number(sauIdParam) : sauId;

  // View name is lower-case unless quoted; we created v_merch unquoted => 'v_merch'
  let query = supabase.from('v_merch').select('*').order('createdat', { ascending: false });
  if (effectiveSauId) query = query.eq('sau_id', effectiveSauId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({
    data,
    resolvedSauId: effectiveSauId ?? null,
    userRole: user?.app_metadata?.role ?? null,
  });
}

export async function POST(req: Request) {
  const { supabase, user, sauId } = await getLoggedInSauId();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const form = await req.formData();
  const title = String(form.get('title') ?? '');
  const price = Number(form.get('price') ?? 0);

  // allow override but default to the logged-in SAU
  const sauIdFromForm = form.get('sauId') ? Number(form.get('sauId')) : null;
  const effectiveSauId = sauIdFromForm ?? sauId;
  if (!effectiveSauId) {
    return NextResponse.json({ error: 'SAU_ID could not be determined from login.' }, { status: 400 });
  }

  const overview  = form.get('overview')  as File | null;
  const front     = form.get('front')     as File | null;
  const back      = form.get('back')      as File | null;
  const sizeChart = form.get('sizeChart') as File | null;

  const sizes = form.getAll('sizes').map(String);

  const optionEntries: { caption: string; file: File | null }[] = [];
  for (const [key, val] of form.entries()) {
    if (key.startsWith('option_') && key.endsWith('_photo')) {
      const id = key.split('_')[1];
      optionEntries.push({
        caption: String(form.get(`option_${id}_caption`) ?? ''),
        file: val as File,
      });
    }
  }

  // ⬇️ Table is 'merchandise'; columns are lower-case
  const { data: ins, error: insErr } = await supabase
    .from('merchandise')
    .insert({
      title,
      price,
      sau_id: effectiveSauId,
      status: 'PENDING',
      createdby: user.id,
    })
    .select('itemid')
    .single();

  if (insErr || !ins) {
    return NextResponse.json({ error: insErr?.message ?? 'Insert failed' }, { status: 400 });
  }

  const itemId: number = ins.itemid;
  const basePath = `${user.id}/${itemId}`;

  async function up(name: string, f: File | null): Promise<string | null> {
    if (!f) return null;
    const filePath = `${basePath}/${name}`;
    const { error: upErr } = await supabase.storage.from('merch').upload(filePath, f, {
      contentType: f.type || 'application/octet-stream',
      upsert: true,
    });
    if (upErr) throw upErr;
    const { data: pub } = supabase.storage.from('merch').getPublicUrl(filePath);
    return pub.publicUrl;
  }

  try {
    const posterurl    = await up('poster',    overview);
    const frontviewurl = await up('front',     front);
    const backviewurl  = await up('back',      back);
    const sizecharturl = await up('sizechart', sizeChart);

    // ⬇️ update with lower-case column keys
    const { error: updErr } = await supabase
      .from('merchandise')
      .update({ posterurl, frontviewurl, backviewurl, sizecharturl })
      .eq('itemid', itemId);
    if (updErr) throw updErr;

    if (sizes.length) {
      const rows = sizes.map((s) => ({ itemid: itemId, sizelabel: s }));
      const { error } = await supabase.from('merchandisesize').upsert(rows, { onConflict: 'itemid,sizelabel' });
      if (error) throw error;
    }

    if (optionEntries.length) {
      let position = 1;
      for (const opt of optionEntries) {
        const photourl = await up(`option_${position}`, opt.file);
        const { error } = await supabase.from('merchandiseoption').insert({
          itemid: itemId,
          caption: opt.caption || null,
          photourl,
          position,
        });
        if (error) throw error;
        position++;
      }
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 400 });
  }

  return NextResponse.json({ ok: true, itemId, sauId: effectiveSauId });
}

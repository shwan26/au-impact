// app/api/events/[id]/poster/upload/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'posters'; // reuse your existing public posters bucket

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;

    const ct = req.headers.get('content-type') || '';
    if (!ct.toLowerCase().includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Use multipart/form-data' }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    const safe = file.name.replace(/[^\w.\-]+/g, '_');
    const key = `events/${id}/${Date.now()}-${Math.random().toString(36).slice(2)}-${safe}`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(key, file, {
      upsert: false,
      cacheControl: '3600',
      contentType: file.type || 'application/octet-stream',
    });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(key);
    const url = pub?.publicUrl;
    if (!url) return NextResponse.json({ error: 'No public URL' }, { status: 500 });

    // Save to event.posterurl so all pages can read it
    const { error: updErr } = await supabase
      .from('event')
      .update({ posterurl: url })
      .eq('eventid', id);

    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });

    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
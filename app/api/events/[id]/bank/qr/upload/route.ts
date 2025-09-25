// app/api/events/[id]/bank/qr/upload/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'event-photos'; // or 'posters'

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const ct = req.headers.get('content-type') || '';
    if (!ct.toLowerCase().includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Use multipart/form-data' }, { status: 400 });
    }

    const form = await req.formData();
    const f = form.get('file');
    if (!(f instanceof File)) {
      return NextResponse.json({ error: 'No file' }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const safe = (f.name || 'qr.png').replace(/[^\w.\-]+/g, '_');
    const key = `events/${id}/promptpay/${Date.now()}-${Math.random().toString(36).slice(2)}-${safe}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(key, f, {
        upsert: false,
        cacheControl: '3600',
        contentType: f.type || 'image/png',
      });
    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 400 });
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(key);
    const url = pub?.publicUrl;
    if (!url) {
      return NextResponse.json({ error: 'Failed to get public URL' }, { status: 500 });
    }

    // persist to event table
    const { error: updErr } = await supabase
      .from('event')
      .update({ promptpayqr: url })
      .eq('eventid', id);
    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 400 });
    }

    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

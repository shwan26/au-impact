// app/api/events/[id]/photos/upload/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'event-photos'; // switch to 'posters' if you prefer

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const supabase = getSupabaseServer();

  const ct = req.headers.get('content-type') || '';
  if (!ct.toLowerCase().includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Use multipart/form-data' }, { status: 400 });
  }

  const form = await req.formData();
  const files = form.getAll('files').filter((f) => f instanceof File) as File[];
  if (!files.length) {
    return NextResponse.json({ error: 'No files received' }, { status: 400 });
  }

  const uploaded: string[] = [];

  for (const file of files) {
    try {
      const safe = file.name.replace(/[^\w.\-]+/g, '_');
      const key = `events/${id}/${Date.now()}-${Math.random().toString(36).slice(2)}-${safe}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(key, file, {
          upsert: false,
          cacheControl: '3600',
          contentType: file.type || 'application/octet-stream',
        });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(key);
      const url = pub?.publicUrl;
      if (!url) throw new Error('No public URL');

      const { error: insErr } = await supabase
        .from('event_photos')
        .insert({ event_id: Number(id), url });
      if (insErr) throw insErr;

      uploaded.push(url);
    } catch (e) {
      console.error('Photo upload failed:', e);
    }
  }

  if (!uploaded.length) {
    return NextResponse.json({ error: 'All uploads failed' }, { status: 500 });
  }
  return NextResponse.json({ items: uploaded });
}

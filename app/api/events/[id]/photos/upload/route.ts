// app/api/events/[id]/photos/upload/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'event-photos'; // switch to 'posters' if you reuse that bucket

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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

    // Upload everything in parallel and collect results
    const results = await Promise.allSettled(
      files.map(async (file) => {
        const safe = file.name.replace(/[^\w.\-]+/g, '_');
        const key = `events/${id}/${Date.now()}-${Math.random().toString(36).slice(2)}-${safe}`;

        const { error: upErr } = await supabase
          .storage
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

        return url;
      })
    );

    const uploaded: string[] = [];
    const errors: string[] = [];
    results.forEach((r, idx) => {
      if (r.status === 'fulfilled') uploaded.push(r.value);
      else errors.push(`${files[idx]?.name ?? 'file'}: ${r.reason?.message ?? 'failed'}`);
    });

    if (!uploaded.length) {
      return NextResponse.json({ error: 'All uploads failed', details: errors }, { status: 500 });
    }
    return NextResponse.json({ items: uploaded, errors: errors.length ? errors : undefined });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

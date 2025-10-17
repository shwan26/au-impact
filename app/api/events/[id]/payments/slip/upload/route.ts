// app/api/events/[id]/payments/slip/upload/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'event-payments';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const ct = req.headers.get('content-type') || '';
    if (!ct.toLowerCase().includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Use multipart/form-data' }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    const safe = file.name.replace(/[^\w.\-]+/g, '_');
    const key = `events/${id}/payments/${Date.now()}-${Math.random().toString(36).slice(2)}-${safe}`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(key, file, {
      contentType: file.type || 'application/octet-stream',
      cacheControl: '3600',
      upsert: false,
    });
    if (upErr) throw upErr;

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(key);
    const url = pub?.publicUrl;
    if (!url) throw new Error('No public URL');

    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 });
  }
}
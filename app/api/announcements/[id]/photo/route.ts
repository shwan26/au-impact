// app/api/announcements/[id]/photo/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';


const TABLE  = 'Announcement';
const FIELDS = '"AnnouncementID","Topic","Description","PhotoURL","DatePosted","Status","SAU_ID","AUSO_ID"';
const BUCKET = 'public';

// ---- helpers ---------------------------------------------------------------

const EXT_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  jfif: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  heic: 'image/heic',
  heif: 'image/heif',
};

function looksLikeImage(file: File) {
  if (file.type && file.type.startsWith('image/')) return true;
  const name = (file.name || '').toLowerCase();
  return /\.(jpg|jpeg|jfif|png|gif|webp|avif|bmp|ico|svg|tif|tiff|heic|heif)$/i.test(name);
}

function guessMime(name: string, fallback = 'application/octet-stream') {
  const match = (name || '').toLowerCase().match(/\.([a-z0-9]+)$/i);
  const ext = match?.[1] ?? '';
  return EXT_MIME[ext] || fallback;
}

// DB -> API (PascalCase)
function mapRow(r: any) {
  return {
    AnnouncementID: r.announcementid,
    Topic: r.topic,
    Description: r.description,
    PhotoURL: r.photourl,
    DatePosted: r.dateposted,
    Status: r.status,
    SAU_ID: r.sau_id ?? null,
    AUSO_ID: r.auso_id ?? null,
  };
}

// ---- route ----------------------------------------------------------------

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const idNum = Number(id);
    if (!Number.isFinite(idNum)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'Missing file' }, { status: 400 });

    // ✅ Accept common image types by MIME OR extension (HEIC/HEIF/SVG included)
    if (!looksLikeImage(file)) {
      return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 });
    }

    const supabase = await getSupabaseServer();

    // Convert to Buffer
    const ab = await file.arrayBuffer();
    const buf = Buffer.from(ab);

    const safeName = (file.name || 'photo').replace(/[^\w\.-]+/g, '_');
    const key = `announcements/${idNum}/${Date.now()}_${safeName}`;

    // ✅ Use provided MIME or guess from extension (fallback safe)
    const contentType = file.type || guessMime(safeName);

    // Upload to Storage
    const { data: up, error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(key, buf, { contentType, upsert: true });

    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });

    // Public URL
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(up.path);
    const publicUrl = pub?.publicUrl ?? null;
    if (!publicUrl) {
      return NextResponse.json({ error: 'Failed to get public URL' }, { status: 500 });
    }

    // Save to DB
    const { data, error } = await supabase
      .from(TABLE)
      .update({ photourl: publicUrl })
      .eq('announcementid', idNum)
      .select(FIELDS)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json(mapRow(data));
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 400 });
  }
}

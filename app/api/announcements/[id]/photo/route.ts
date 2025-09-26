export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseClient';

const TABLE = 'announcement';
const FIELDS =
  'announcementid, topic, description, photourl, dateposted, status, sau_id, auso_id';
const BUCKET = 'public';

type Status = 'DRAFT' | 'PENDING' | 'LIVE' | 'COMPLETE' | string;

interface AnnouncementDBRow {
  announcementid: number;
  topic: string;
  description: string | null;
  photourl: string | null;
  dateposted: string;
  status: Status;
  sau_id: number | null;
  auso_id: number | null;
}
interface AnnouncementAPI {
  AnnouncementID: number;
  Topic: string;
  Description: string | null;
  PhotoURL: string | null;
  DatePosted: string;
  Status: Status;
  SAU_ID: number | null;
  AUSO_ID: number | null;
}

const EXT_MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', jfif: 'image/jpeg',
  png: 'image/png', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif',
  bmp: 'image/bmp', ico: 'image/x-icon', svg: 'image/svg+xml',
  tif: 'image/tiff', tiff: 'image/tiff', heic: 'image/heic', heif: 'image/heif',
};

function looksLikeImage(file: File): boolean {
  if (file.type && file.type.startsWith('image/')) return true;
  const name = (file.name || '').toLowerCase();
  return /\.(jpg|jpeg|jfif|png|gif|webp|avif|bmp|ico|svg|tif|tiff|heic|heif)$/i.test(name);
}
function guessMime(name: string, fallback = 'application/octet-stream'): string {
  const m = (name || '').toLowerCase().match(/\.([a-z0-9]+)$/i);
  const ext = m?.[1] ?? '';
  return EXT_MIME[ext] || fallback;
}
function toApi(r: AnnouncementDBRow): AnnouncementAPI {
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
function msg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

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
    if (!looksLikeImage(file)) {
      return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    // buffer + storage key
    const ab = await file.arrayBuffer();
    const buf = Buffer.from(ab);
    const safeName = (file.name || 'photo').replace(/[^\w.-]+/g, '_');
    const key = `announcements/${idNum}/${Date.now()}_${safeName}`;
    const contentType = file.type || guessMime(safeName);

    // upload
    const { data: up, error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(key, buf, { contentType, upsert: true });

    if (upErr || !up) {
      return NextResponse.json({ error: upErr?.message || 'Upload failed' }, { status: 400 });
    }

    // public url
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(up.path);
    const publicUrl = pub?.publicUrl ?? null;
    if (!publicUrl) {
      return NextResponse.json({ error: 'Failed to get public URL' }, { status: 500 });
    }

    // persist on the row
    const { data, error } = await supabase
      .from(TABLE)
      .update({ photourl: publicUrl })
      .eq('announcementid', idNum)
      .select(FIELDS)
      .returns<AnnouncementDBRow>()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Update failed' }, { status: 400 });
    }

    return NextResponse.json(toApi(data));
  } catch (e: unknown) {
    return NextResponse.json({ error: msg(e) || 'Upload failed' }, { status: 400 });
  }
}

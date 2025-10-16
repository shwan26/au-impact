// app/api/uploads/[kind]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const POSTER_BUCKET = process.env.NEXT_PUBLIC_POSTER_BUCKET ?? 'posters';
const QR_BUCKET     = process.env.NEXT_PUBLIC_QR_BUCKET ?? 'qr';
const SLIP_BUCKET   = process.env.NEXT_PUBLIC_SLIP_BUCKET ?? 'slips';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function newAdmin() {
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
}

function bucketFor(kind: string): string | null {
  switch (kind) {
    case 'poster': return POSTER_BUCKET;
    case 'qr':     return QR_BUCKET;
    case 'slip':   return SLIP_BUCKET;
    default:       return null;
  }
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '-');
}

async function ensureBucket(supabase: ReturnType<typeof newAdmin>, name: string) {
  const { data: list, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) throw new Error(listErr.message);
  const exists = (list ?? []).some(b => b.name === name);
  if (exists) return;
  const { error: createErr } = await supabase.storage.createBucket(name, {
    public: true,
    fileSizeLimit: '20MB',
  });
  if (createErr) throw new Error(createErr.message);
}

export async function POST(req: Request, { params }: { params: { kind: string } }) {
  try {
    const bucket = bucketFor(params.kind);
    if (!bucket) return NextResponse.json({ error: 'Unknown upload kind' }, { status: 400 });

    const form = await req.formData().catch(() => null);
    if (!form) return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });

    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }

    const prefix = String(form.get('prefix') ?? '').trim();
    const origName = sanitizeFilename(file.name || 'upload.bin');
    const ts = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    const path = [prefix, `${ts}-${rand}-${origName}`].filter(Boolean).join('/');

    const admin = newAdmin();
    await ensureBucket(admin, bucket);

    const { error: upErr } = await admin.storage
      .from(bucket)
      .upload(path, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;

    return NextResponse.json({
      ok: true,
      bucket,
      path,
      publicUrl,
      size: file.size,
      mime: file.type || 'application/octet-stream',
      name: origName,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 });
  }
}

// app/api/merchandise/[id]/colors/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

const TABLE = 'MerchandiseColor';
// 👇 change this to your actual public bucket name
const BUCKET = 'merch';

type DbRow = {
  ItemID: string | number;
  ColorLabel: string | null;
  PhotoURL: string | null;
};

function sanitizeFileName(name: string) {
  return name.replace(/[^\w.\-]+/g, '_');
}

/** GET /api/merchandise/[id]/colors */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServer();

    const { data, error } = await supabase
      .from<DbRow>(TABLE)
      .select('ItemID, ColorLabel, PhotoURL')
      .eq('ItemID', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const colors = (data ?? []).map((r) => ({
      merchId: r.ItemID,
      name: r.ColorLabel ?? null,
      photoUrl: r.PhotoURL ?? null,
    }));

    return NextResponse.json(colors);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load colors' }, { status: 500 });
  }
}

/** POST /api/merchandise/[id]/colors  (multipart/form-data: name, photo) */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const form = await req.formData();
    const name = String(form.get('name') ?? '').trim();
    const photo = form.get('photo');

    if (!name) {
      return NextResponse.json({ error: 'Missing color name' }, { status: 400 });
    }
    if (!(photo instanceof File)) {
      return NextResponse.json({ error: 'Missing color photo' }, { status: 400 });
    }

    const supabase = await getSupabaseServer();

    // Upload image to storage
    const ab = await photo.arrayBuffer();
    const bytes = new Uint8Array(ab);
    const path = `colors/${params.id}/${Date.now()}-${sanitizeFileName(photo.name || 'photo')}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType: photo.type || 'image/jpeg',
        upsert: false,
      });

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const photoUrl = pub?.publicUrl || null;

    // Insert DB row
    const { error: insErr } = await supabase
      .from(TABLE)
      .insert([{ ItemID: params.id, ColorLabel: name, PhotoURL: photoUrl }]);

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ merchId: params.id, name, photoUrl }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to add color' }, { status: 500 });
  }
}

/** DELETE /api/merchandise/[id]/colors  (json: { name }) */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // ignore; will validate below
    }
    const name = String(body?.name ?? '').trim();
    if (!name) {
      return NextResponse.json({ error: 'Missing color name' }, { status: 400 });
    }

    const supabase = await getSupabaseServer();

    const { error: delErr } = await supabase
      .from(TABLE)
      .delete()
      .eq('ItemID', params.id)
      .eq('ColorLabel', name);

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete color' }, { status: 500 });
  }
}

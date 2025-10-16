// app/api/merchandise/[id]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';
import type { Merch } from '@/types/db';
import { randomUUID } from 'node:crypto';

const BUCKET = 'merch';
const TABLE  = 'Merchandise';
const FIELDS =
  '"ItemID","Title","Description","Price","PickUpDate","PickUpTime","PickUpPoint",' +
  '"ContactName","ContactLineID","PosterURL","FrontViewURL","BackViewURL","SizeChartURL",' +
  '"SAU_ID","AUSO_ID","Status"';

// Next 15 dynamic route params are async
type Ctx = { params: Promise<{ id: string }> };

const EDITABLE_FIELDS = new Set([
  'Title',
  'Description',
  'Price',
  'PickUpDate',
  'PickUpTime',
  'PickUpPoint',
  'ContactName',
  'ContactLineID',
  'PosterURL',
  'FrontViewURL',
  'BackViewURL',
  'SizeChartURL',
]);

/* -------------------- Helpers -------------------- */
function formToObject(fd: FormData) {
  const obj: Record<string, any> = {};
  fd.forEach((v, k) => (obj[k] = v));
  return obj;
}

function toDbUpdateKeys(input: Record<string, any>) {
  const out: Record<string, any> = {};
  const map: Record<string, string> = {
    title: 'Title',
    description: 'Description',
    price: 'Price',
    pickUpDate: 'PickUpDate',
    pickupDate: 'PickUpDate',
    pickUpTime: 'PickUpTime',
    pickupTime: 'PickUpTime',
    pickUpPoint: 'PickUpPoint',
    pickupPoint: 'PickUpPoint',
    contactName: 'ContactName',
    contactLineId: 'ContactLineID',
    posterUrl: 'PosterURL',
    frontUrl: 'FrontViewURL',
    backUrl: 'BackViewURL',
    sizeChartUrl: 'SizeChartURL',
  };

  for (const [k, v] of Object.entries(input)) {
    if (map[k]) out[map[k]] = v;
    else if (EDITABLE_FIELDS.has(k)) out[k] = v; // already DB-case
    else if (k === 'Status') out['Status'] = v;  // handled separately
  }
  return out;
}

async function uploadIfFile(
  supabase: any,
  fd: FormData,
  field: string,
  folder: string
) {
  const v = fd.get(field);
  if (!v || typeof v !== 'object' || !('arrayBuffer' in v)) return null;
  const file = v as File;
  if (!file.size) return null;

  const ext = file.type?.split('/')?.[1] || 'bin';
  const key = `${folder}/${randomUUID()}.${ext}`;

  const { error: upErr } = await supabase
    .storage.from(BUCKET)
    .upload(key, file, { contentType: file.type, upsert: false });
  if (upErr) throw upErr;

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return pub.publicUrl;
}

async function uploadFileObject(
  supabase: any,
  file: File,
  folder: string
) {
  if (!file || !file.size) return null;
  const ext = file.type?.split('/')?.[1] || 'bin';
  const key = `${folder}/${randomUUID()}.${ext}`;

  const { error: upErr } = await supabase
    .storage.from(BUCKET)
    .upload(key, file, { contentType: file.type, upsert: false });
  if (upErr) throw upErr;

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return pub.publicUrl;
}

function toUiMerch(
  row: any,
  sizes: string[] = [],
  colorRows: Array<{ ColorLabel: string; PhotoURL: string | null }> = []
): Merch {
  return {
    itemId: String(row.ItemID),
    slug: String(row.ItemID),
    title: row.Title,
    description: row.Description ?? undefined,
    price: Number(row.Price ?? 0),
    status: row.Status,
    availableSizes: sizes,
    availableColors: colorRows.map(r => ({ label: String(r.ColorLabel), photoUrl: r.PhotoURL })),
    pickupPoint: row.PickUpPoint ?? undefined,
    pickupDate: row.PickUpDate ?? undefined,
    pickupTime: row.PickUpTime ?? undefined,
    contactName: row.ContactName ?? undefined,
    contactLineId: row.ContactLineID ?? undefined,
    images: {
      poster: { alt: row.Title, url: row.PosterURL ?? '' },
      frontView: row.FrontViewURL ? { alt: 'Front', url: row.FrontViewURL } : undefined,
      backView: row.BackViewURL ? { alt: 'Back', url: row.BackViewURL } : undefined,
      sizeChart: row.SizeChartURL ? { alt: 'Size Chart', url: row.SizeChartURL } : undefined,
      misc: [],
    },
  };
}

async function fetchSizesColors(supabase: any, itemId: number) {
  const [{ data: sz, error: szErr }, { data: col, error: colErr }] = await Promise.all([
    supabase.from('MerchandiseSize').select('"SizeLabel"').eq('ItemID', itemId),
    supabase.from('MerchandiseColor').select('"ColorLabel","PhotoURL"').eq('ItemID', itemId),
  ]);
  if (szErr) throw szErr;
  if (colErr) throw colErr;
  return {
    sizes: (sz ?? []).map((r: any) => String(r.SizeLabel)),
    colorRows: (col ?? []) as Array<{ ColorLabel: string; PhotoURL: string | null }>,
  };
}

async function selectMerch(supabase: any, idNum: number) {
  const { data, error } = await supabase
    .from(TABLE)
    .select(FIELDS)
    .eq('ItemID', idNum)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return data;
}

async function respondWithMerch(supabase: any, idNum: number, row?: any) {
  const base = row ?? (await selectMerch(supabase, idNum));
  if (!base) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { sizes, colorRows } = await fetchSizesColors(supabase, idNum);
  return NextResponse.json(toUiMerch(base, sizes, colorRows));
}

function isTouchingPickup(updates: Record<string, any>) {
  return (
    'PickUpDate' in updates ||
    'PickUpTime' in updates ||
    'PickUpPoint' in updates
  );
}

async function ensureApprovedIfNeeded(supabase: any, idNum: number, touchingPickup: boolean) {
  if (!touchingPickup) return;
  const { data, error } = await supabase
    .from(TABLE)
    .select('"Status"')
    .eq('ItemID', idNum)
    .single();
  if (error || !data) {
    throw Object.assign(new Error('Merch not found'), { status: 404 });
  }
  if (data.Status !== 'APPROVED') {
    throw Object.assign(
      new Error('Pickup details can only be added after AUSO approval.'),
      { status: 403 }
    );
  }
}

/* -------------------- GET -------------------- */
export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const supabase = await getSupabaseServer();
  return respondWithMerch(supabase, idNum);
}

/* Read-once fix: clone before delegating so body stream is fresh */
export async function PATCH(req: Request, ctx: Ctx) {
  return PUT(req.clone(), ctx);
}

/* -------------------- PUT (edits incl. pickup) -------------------- */
export async function PUT(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const idNum = Number(id);
    if (!Number.isFinite(idNum)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const supabase = await getSupabaseServer();

    // Identify caller
    const { data: au } = await supabase.auth.getUser();
    const role = (au?.user?.app_metadata as any)?.role ?? null;

    // Read body exactly once
    const contentType = req.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');

    let body: Record<string, any> = {};
    let fd: FormData | null = null;

    if (isMultipart) {
      fd = await req.formData();
      body = formToObject(fd);
    } else {
      try { body = await req.json(); } catch { body = {}; }
    }

    /* ----- Status transitions (AUSO/SAU) ----- */
    if ('Status' in body) {
      const next = String(body.Status);

      if (role === 'auso' && (next === 'APPROVED' || next === 'PENDING')) {
        const upd = await supabase
          .from(TABLE)
          .update({ Status: next })
          .eq('ItemID', idNum)
          .select(FIELDS)
          .single();
        if (upd.error) {
          const status = upd.error.code === '42501' ? 403 : 400;
          return NextResponse.json({ error: upd.error.message }, { status });
        }
        return respondWithMerch(supabase, idNum, upd.data);
      }

      if (role === 'sau' && next === 'SOLD_OUT') {
        const upd = await supabase
          .from(TABLE)
          .update({ Status: 'SOLD_OUT' })
          .eq('ItemID', idNum)
          .select(FIELDS)
          .single();
        if (upd.error) {
          const status = upd.error.code === '42501' ? 403 : 400;
          return NextResponse.json({ error: upd.error.message }, { status });
        }
        return respondWithMerch(supabase, idNum, upd.data);
      }

      // strip unsupported attempts
      delete body.Status;
    }

    /* ----- Field edits → SAU only ----- */
    if (role !== 'sau') {
      return NextResponse.json({ error: 'Only SAU can edit merchandise details' }, { status: 403 });
    }

    // Map basic fields (pickup keys included)
    const candidate = toDbUpdateKeys(body);
    const updates: Record<string, any> = {};
    for (const [k, v] of Object.entries(candidate)) {
      if (EDITABLE_FIELDS.has(k)) updates[k] = v;
    }

    // Optional uploads for main images (not for pickup)
    if (fd) {
      const posterUrl = await uploadIfFile(supabase, fd, 'overview', 'posters');
      const frontUrl  = await uploadIfFile(supabase, fd, 'front',    'fronts');
      const backUrl   = await uploadIfFile(supabase, fd, 'back',     'backs');
      if (posterUrl) updates['PosterURL'] = posterUrl;
      if (frontUrl)  updates['FrontViewURL'] = frontUrl;
      if (backUrl)   updates['BackViewURL'] = backUrl;
    }

    // If touching pickup fields, enforce APPROVED
    await ensureApprovedIfNeeded(supabase, idNum, isTouchingPickup(updates));

    /* ----- sizes/colors (replace sets if provided) ----- */
    let sizesProvided = false;
    let colorsProvided = false;
    let nextSizes: string[] = [];
    let nextColorsRows: Array<{ ItemID: number; ColorLabel: string; PhotoURL: string | null }> = [];

    if (fd) {
      const s = fd.getAll('sizes').map((v) => String(v)).filter(Boolean);
      if (fd.has('sizes') || s.length) {
        sizesProvided = true;
        nextSizes = Array.from(new Set(s));
      }

      const nameVals = fd.getAll('color_name').map(v => String(v).trim());
      const fileVals = fd.getAll('color_photo');

      if (nameVals.length || fileVals.length) {
        colorsProvided = true;

        for (let i = 0; i < Math.max(nameVals.length, fileVals.length); i++) {
          const label = (nameVals[i] ?? '').trim();
          const fAny  = fileVals[i] as any;
          const isFile = fAny && typeof fAny === 'object' && 'arrayBuffer' in fAny && (fAny as File).size > 0;

          if (!label && !isFile) continue;

          let photoUrl: string | null = null;
          if (isFile) {
            photoUrl = await uploadFileObject(supabase, fAny as File, `colors/${idNum}`);
          }

          if (label) {
            nextColorsRows.push({ ItemID: idNum, ColorLabel: label, PhotoURL: photoUrl });
          }
        }
      }
    } else {
      if ('sizes' in body) {
        sizesProvided = true;
        nextSizes = Array.isArray(body.sizes) ? Array.from(new Set(body.sizes.map(String).filter(Boolean))) : [];
      }
      if ('colors' in body) {
        colorsProvided = true;
        const arr = Array.isArray(body.colors) ? body.colors : [];
        for (const c of arr) {
          if (typeof c === 'string') {
            nextColorsRows.push({ ItemID: idNum, ColorLabel: c, PhotoURL: null });
          } else if (c && typeof c === 'object' && c.label) {
            nextColorsRows.push({ ItemID: idNum, ColorLabel: String(c.label), PhotoURL: c.photoUrl ?? null });
          }
        }
        // de-dup by label
        const seen = new Set<string>();
        nextColorsRows = nextColorsRows.filter(r => (seen.has(r.ColorLabel) ? false : (seen.add(r.ColorLabel), true)));
      }
    }

    // Update base row first (if any changes)
    let lastRow: any = null;
    if (Object.keys(updates).length) {
      const upd = await supabase
        .from(TABLE)
        .update(updates)
        .eq('ItemID', idNum)
        .select(FIELDS)
        .single();
      if (upd.error) {
        const status = upd.error.code === '42501' ? 403 : 400;
        return NextResponse.json({ error: upd.error.message }, { status });
      }
      lastRow = upd.data;
    } else {
      lastRow = await selectMerch(supabase, idNum);
      if (!lastRow) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Replace sizes if provided
    if (sizesProvided) {
      const del = await supabase.from('MerchandiseSize').delete().eq('ItemID', idNum);
      if (del.error) return NextResponse.json({ error: `Sizes: ${del.error.message}` }, { status: 400 });

      if (nextSizes.length) {
        const rows = nextSizes.map(s => ({ ItemID: idNum, SizeLabel: s }));
        const ins = await supabase.from('MerchandiseSize').upsert(rows, { onConflict: 'ItemID,SizeLabel' });
        if (ins.error) return NextResponse.json({ error: `Sizes: ${ins.error.message}` }, { status: 400 });
      }
    }

    // Replace colors if provided
    if (colorsProvided) {
      const del = await supabase.from('MerchandiseColor').delete().eq('ItemID', idNum);
      if (del.error) return NextResponse.json({ error: `Colors: ${del.error.message}` }, { status: 400 });

      if (nextColorsRows.length) {
        const ins = await supabase
          .from('MerchandiseColor')
          .upsert(nextColorsRows, { onConflict: 'ItemID,ColorLabel' });
        if (ins.error) return NextResponse.json({ error: `Colors: ${ins.error.message}` }, { status: 400 });
      }
    }

    return respondWithMerch(supabase, idNum, lastRow);
  } catch (e: any) {
    const status = e?.status ?? 400;
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status });
  }
}

/* -------------------- DELETE -------------------- */
export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const idNum = Number(id);
    if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const supabase = await getSupabaseServer();
    const { error } = await supabase.from(TABLE).delete().eq('ItemID', idNum);

    if (error) {
      const status = error.code === '42501' ? 403 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status: 400 });
  }
}

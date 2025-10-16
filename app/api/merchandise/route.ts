// app/api/merchandise/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';
import type { Merch } from '@/types/db';
import { randomUUID } from 'node:crypto';

const TABLE = 'Merchandise';
const FIELDS =
  '"ItemID","Title","Description","Price","PickUpDate","PickUpTime","PickUpPoint",' +
  '"ContactName","ContactLineID","PosterURL","FrontViewURL","BackViewURL","SizeChartURL",' +
  '"SAU_ID","AUSO_ID","Status"';

const BUCKET = 'merch';
const ALLOWED_STATUS = new Set(['PENDING', 'APPROVED', 'SOLD_OUT']);

function toUiMerch(row: any): Merch {
  return {
    itemId: String(row.ItemID),
    slug: String(row.ItemID),
    title: row.Title,
    description: row.Description ?? undefined,
    price: Number(row.Price ?? 0),
    status: row.Status,
    availableSizes: [],
    availableColors: [],
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

function normalizeKeys(input: Record<string, any>) {
  return {
    ...input,
    title: input.title ?? input.Title,
    description: input.description ?? input.Description,
    price: input.price ?? input.Price,
    pickUpDate: input.pickUpDate ?? input.pickupdate ?? input.pick_up_date ?? input.PickUpDate,
    pickUpTime: input.pickUpTime ?? input.pickuptime ?? input.pick_up_time ?? input.PickUpTime,
    pickUpPoint: input.pickUpPoint ?? input.pickuppoint ?? input.pick_up_point ?? input.PickUpPoint,
    contactName: input.contactName ?? input.ContactName,
    contactLineId: input.contactLineId ?? input.ContactLineID,
    posterUrl: input.posterUrl ?? input.PosterURL,
    frontUrl: input.frontUrl ?? input.FrontViewURL,
    backUrl: input.backUrl ?? input.BackViewURL,
    sizeChartUrl: input.sizeChartUrl ?? input.SizeChartURL,
  };
}

async function uploadIfFile(supabase: any, fd: FormData, field: string, folder: string) {
  const v = fd.get(field);
  if (!v || typeof v !== 'object' || !('arrayBuffer' in v)) return null;
  const file = v as File;
  if (!file.size) return null;

  const ext = file.type?.split('/')?.[1] || 'bin';
  const key = `${folder}/${randomUUID()}.${ext}`;

  const { error: upErr } = await supabase
    .storage
    .from(BUCKET)
    .upload(key, file, { contentType: file.type, upsert: false });

  if (upErr) throw upErr;

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return pub.publicUrl;
}

async function uploadFileObject(supabase: any, file: File, folder: string) {
  if (!file || !file.size) return null;
  const ext = file.type?.split('/')?.[1] || 'bin';
  const key = `${folder}/${randomUUID()}.${ext}`;
  const { error: upErr } = await supabase
    .storage.from(BUCKET) // 'merch'
    .upload(key, file, { contentType: file.type, upsert: false });
  if (upErr) throw upErr;
  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return pub.publicUrl;
}


export async function GET(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { searchParams } = new URL(req.url);

    // who is calling? (null when public)
    const { data: au } = await supabase.auth.getUser();
    const role: string | null = (au?.user?.app_metadata as any)?.role ?? null;

    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const pageSize = Math.max(1, Number(searchParams.get('pageSize') || '20'));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let q = supabase
      .from(TABLE)
      .select(FIELDS, { count: 'exact' })
      .order('ItemID', { ascending: true });

    // Public should NOT see pending → force APPROVED
    const requestedStatus = searchParams.get('status') || undefined;
    const isStaff = role === 'sau' || role === 'auso';

    if (isStaff) {
      if (requestedStatus) {
        if (!ALLOWED_STATUS.has(requestedStatus)) {
          return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }
        q = q.eq('Status', requestedStatus);
      }
    } else {
      q = q.eq('Status', 'APPROVED');
    }

    const { data, error, count } = await q.range(from, to);
    if (error) {
      console.error('GET /api/merchandise error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const items: Merch[] = (data ?? []).map(toUiMerch);
    return NextResponse.json({ page, pageSize, total: count ?? 0, items });
  } catch (e: any) {
    console.error('GET /api/merchandise crash:', e);
    return NextResponse.json({ error: e?.message ?? 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();

    // must be SAU to create
    const { data: au } = await supabase.auth.getUser();
    const role = (au?.user?.app_metadata as any)?.role ?? null;
    if (role !== 'sau') {
      return NextResponse.json({ error: 'Only SAU can create merchandise' }, { status: 403 });
    }

    // resolve SAU
    const { data: sauRow, error: sauErr } = await supabase
      .from('sau')
      .select('sau_id')
      .eq('auth_uid', au?.user?.id ?? '')
      .maybeSingle();
    if (sauErr) return NextResponse.json({ error: sauErr.message }, { status: 500 });
    if (!sauRow?.sau_id) return NextResponse.json({ error: 'SAU profile not found' }, { status: 403 });

    const ct = req.headers.get('content-type') || '';
    const isJson = ct.includes('application/json');

    /* ---------- JSON ---------- */
    if (isJson) {
      const raw = await req.json();
      const b = normalizeKeys(raw);

      const title       = String(b.title ?? '').trim();
      const contactName = String(b.contactName ?? '').trim();
      const contactLine = String(b.contactLineId ?? '').trim();
      const price       = Number(b.price);

      if (!title)       return NextResponse.json({ error: 'Merchandise Name is required.' }, { status: 400 });
      if (!contactName) return NextResponse.json({ error: 'Contact Person is required.' }, { status: 400 });
      if (!contactLine) return NextResponse.json({ error: 'Contact LineID is required.' }, { status: 400 });
      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json({ error: 'Price must be greater than 0.' }, { status: 400 });
      }
      if (!b.posterUrl || !b.frontUrl || !b.backUrl) {
        return NextResponse.json({ error: 'Overview, Front, and Back images are required.' }, { status: 400 });
      }

      const insert = {
        Title:         title,
        Description:   b.description ?? null,
        Price:         price,
        PickUpDate:    b.pickUpDate ?? null,
        PickUpTime:    b.pickUpTime ?? null,
        PickUpPoint:   b.pickUpPoint ?? null,
        ContactName:   contactName,
        ContactLineID: contactLine,
        PosterURL:     b.posterUrl,
        FrontViewURL:  b.frontUrl,
        BackViewURL:   b.backUrl,
        SizeChartURL:  b.sizeChartUrl ?? null,
        SAU_ID:        sauRow.sau_id,
      };

      const { data: mer, error } = await supabase.from(TABLE).insert([insert]).select(FIELDS).single();
      if (error) return NextResponse.json({ error: error.message }, { status: error.code === '42501' ? 403 : 400 });

      // Optional arrays from JSON
      const itemId = mer.ItemID as number;
      const sizes  = Array.isArray(raw.sizes)  ? Array.from(new Set(raw.sizes.map(String).filter(Boolean))) : [];
      const colors = Array.isArray(raw.colors) ? Array.from(new Set(raw.colors.map(String).filter(Boolean))) : [];

      if (sizes.length) {
        const sizeRows = sizes.map((s: string) => ({ ItemID: itemId, SizeLabel: s }));
        const { error: szErr } = await supabase.from('MerchandiseSize').upsert(sizeRows, { onConflict: 'ItemID,SizeLabel' });
        if (szErr) return NextResponse.json({ error: `Sizes: ${szErr.message}` }, { status: 400 });
      }

      if (colors.length) {
        const colorRows = colors.map((c: string) => ({ ItemID: itemId, ColorLabel: c }));
        const { error: colErr } = await supabase.from('MerchandiseColor').upsert(colorRows, { onConflict: 'ItemID,ColorLabel' });
        if (colErr) return NextResponse.json({ error: `Colors: ${colErr.message}` }, { status: 400 });
      }

      return NextResponse.json(toUiMerch(mer));
    }

    /* ---------- FormData ---------- */
    const fd = await req.formData();

    const title         = String(fd.get('title') ?? '').trim();
    const contactName   = String(fd.get('contactName') ?? '').trim();
    const contactLineId = String(fd.get('contactLineId') ?? '').trim();
    const price         = Number(fd.get('price'));

    if (!title)         return NextResponse.json({ error: 'Merchandise Name is required.' }, { status: 400 });
    if (!contactName)   return NextResponse.json({ error: 'Contact Person is required.' }, { status: 400 });
    if (!contactLineId) return NextResponse.json({ error: 'Contact LineID is required.' }, { status: 400 });
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: 'Price must be greater than 0.' }, { status: 400 });
    }

    if (fd.getAll('sizes').length === 0) {
      return NextResponse.json({ error: 'Please select at least one size.' }, { status: 400 });
    }

    const posterUrl = await uploadIfFile(supabase, fd, 'overview', 'posters');
    const frontUrl  = await uploadIfFile(supabase, fd, 'front',    'fronts');
    const backUrl   = await uploadIfFile(supabase, fd, 'back',     'backs');
    if (!posterUrl || !frontUrl || !backUrl) {
      return NextResponse.json({ error: 'Overview, Front, and Back images are required.' }, { status: 400 });
    }

    const pickUpPoint = String(fd.get('pickUpPoint') ?? fd.get('pickupPoint') ?? '') || null;
    const pickUpDate  = String(fd.get('pickUpDate')  ?? fd.get('pickupDate')  ?? '') || null;
    const pickUpTime  = String(fd.get('pickUpTime')  ?? fd.get('pickupTime')  ?? '') || null;

    const insert = {
      Title:         title,
      Description:   (fd.get('description') as string) ?? null,
      Price:         price,
      PickUpDate:    pickUpDate,
      PickUpTime:    pickUpTime,
      PickUpPoint:   pickUpPoint,
      ContactName:   contactName,
      ContactLineID: contactLineId,
      PosterURL:     posterUrl,
      FrontViewURL:  frontUrl,
      BackViewURL:   backUrl,
      SizeChartURL:  null,
      SAU_ID:        sauRow.sau_id,
    };

    const { data: mer, error } = await supabase.from(TABLE).insert([insert]).select(FIELDS).single();
    if (error) return NextResponse.json({ error: error.message }, { status: error.code === '42501' ? 403 : 400 });

    const itemId = mer.ItemID as number;

    // sizes
    const sizes = Array.from(new Set(fd.getAll('sizes').map(v => String(v)).filter(Boolean)));
    if (sizes.length) {
      const sizeRows = sizes.map(s => ({ ItemID: itemId, SizeLabel: s }));
      const { error: szErr } = await supabase.from('MerchandiseSize').upsert(sizeRows, { onConflict: 'ItemID,SizeLabel' });
      if (szErr) return NextResponse.json({ error: `Sizes: ${szErr.message}` }, { status: 400 });
    }

    // 2a) colors: pair color_name[i] with color_photo[i]
    const colorNames = fd.getAll('color_name').map(v => String(v).trim());
    const colorFiles = fd.getAll('color_photo'); // Files

    const colorRows: Array<{ ItemID: number; ColorLabel: string; PhotoURL: string | null }> = [];

    for (let i = 0; i < Math.max(colorNames.length, colorFiles.length); i++) {
      const label = colorNames[i] ?? '';
      const fileAny = colorFiles[i] as any;
      const isFile = fileAny && typeof fileAny === 'object' && 'arrayBuffer' in fileAny;

      if (!label && !isFile) continue; // skip empty row

      let url: string | null = null;
      if (isFile && (fileAny as File).size) {
        url = await uploadFileObject(supabase, fileAny as File, `colors/${itemId}`);
      }

      if (label) colorRows.push({ ItemID: itemId, ColorLabel: label, PhotoURL: url });
    }

    if (colorRows.length) {
      const { error: colErr } = await supabase
        .from('MerchandiseColor')            // 👈 table name stays exactly this
        .upsert(colorRows, { onConflict: 'ItemID,ColorLabel' });
      if (colErr) return NextResponse.json({ error: `Colors: ${colErr.message}` }, { status: 400 });
    }


    return NextResponse.json(toUiMerch(mer));
  } catch (e: any) {
    console.error('POST /api/merchandise crash:', e);
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status: 400 });
  }
}

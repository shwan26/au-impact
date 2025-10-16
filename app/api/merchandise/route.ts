// app/api/merchandise/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

const TABLE  = 'Merchandise';
const FIELDS =
  '"ItemID","Title","Description","Price","PickUpDate","PickUpTime","PickUpPoint",' +
  '"ContactName","ContactLineID","PosterURL","FrontViewURL","BackViewURL","SizeChartURL",' +
  '"SAU_ID","AUSO_ID","Status"';

const ALLOWED_STATUS = new Set(['PENDING', 'APPROVED', 'SOLD_OUT']);

function formToObject(fd: FormData) {
  const obj: Record<string, any> = {};
  fd.forEach((v, k) => (obj[k] = v));
  return obj;
}

export async function GET(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const pageSize = Math.max(1, Number(searchParams.get('pageSize') || '20'));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let q = supabase
      .from(TABLE)
      .select(FIELDS, { count: 'exact' })
      .order('ItemID', { ascending: true });

    const status = searchParams.get('status') || undefined;
    if (status) {
      if (!ALLOWED_STATUS.has(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      q = q.eq('Status', status);
    }

    const { data, error, count } = await q.range(from, to);
    if (error) {
      console.error('GET /api/merchandise error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ page, pageSize, total: count ?? 0, items: data ?? [] });
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

    // resolve caller's SAU_ID (needed for RLS INSERT policy)
    const { data: sauRow, error: sauErr } = await supabase
      .from('SAU')
      .select('SAU_ID')
      .eq('auth_uid', au?.user?.id ?? '')
      .maybeSingle();

    if (sauErr) return NextResponse.json({ error: sauErr.message }, { status: 500 });
    if (!sauRow?.SAU_ID) {
      return NextResponse.json({ error: 'SAU profile not found' }, { status: 403 });
    }

    // accept JSON or form-data
    const ct = req.headers.get('content-type') || '';
    const body = ct.includes('application/json')
      ? await req.json()
      : formToObject(await req.formData());

    const insert = {
      Title: body.title ?? null,
      Description: body.description ?? null,
      Price: body.price != null ? Number(body.price) : 0,
      PickUpDate: body.pickUpDate ?? null,
      PickUpTime: body.pickUpTime ?? null,
      PickUpPoint: body.pickUpPoint ?? null,
      ContactName: body.contactName ?? null,
      ContactLineID: body.contactLineId ?? null,
      PosterURL: body.posterUrl ?? null,
      FrontViewURL: body.frontUrl ?? null,
      BackViewURL: body.backUrl ?? null,
      SizeChartURL: body.sizeChartUrl ?? null,
      SAU_ID: sauRow.SAU_ID, // 🔐 required for WITH CHECK
      // Status defaults to 'PENDING' by DB; AUSO can later approve
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert([insert])
      .select(FIELDS)
      .single();

    if (error) {
      const status = error.code === '42501' ? 403 : 400; // RLS -> 403
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json(data);
  } catch (e: any) {
    console.error('POST /api/merchandise crash:', e);
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status: 400 });
  }
}

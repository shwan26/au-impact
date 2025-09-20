// app/api/announcements/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseClient';

// DB -> API (PascalCase) mapper
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

const ALLOWED_STATUS = new Set(['PENDING', 'LIVE', 'COMPLETE', 'DRAFT']);

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseServer();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const pageSize = Math.max(1, Number(searchParams.get('pageSize') || '9'));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let q = supabase
      .from('announcement') // lowercase table
      .select(
        'announcementid, topic, description, photourl, dateposted, status, sau_id, auso_id',
        { count: 'exact' }
      )
      .order('dateposted', { ascending: false })
      .range(from, to);

    if (status) q = q.eq('status', status);

    const { data, error, count } = await q;
    if (error) {
      console.error('GET /api/announcements error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      items: (data ?? []).map(mapRow),
      total: count ?? 0,
    });
  } catch (e: any) {
    console.error('ENV/Client error:', e?.message);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServer();
    const body = await req.json();

    const raw = String(body.Status ?? 'PENDING').toUpperCase();
    const status = ALLOWED_STATUS.has(raw) ? raw : 'PENDING';

    const payload = {
      topic: body.Topic,
      description: body.Description ?? null,
      photourl: body.PhotoURL ?? null,
      status,
      sau_id: body.SAU_ID ?? null,
      auso_id: body.AUSO_ID ?? null,
      // dateposted: default by DB
    };

    const { data, error } = await supabase
      .from('announcement')
      .insert([payload])
      .select(
        'announcementid, topic, description, photourl, dateposted, status, sau_id, auso_id'
      )
      .single();

    if (error) {
      console.error('POST /api/announcements error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(mapRow(data));
  } catch (e: any) {
    console.error('ENV/Client error:', e?.message);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

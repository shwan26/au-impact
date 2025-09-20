import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseClient';

const TABLE = 'event'; // <-- make sure this matches your DB table name
const FIELDS =
  'eventid, title, description, photourl, location, startdate, enddate, status, sau_id, auso_id';

function mapRow(r: any) {
  return {
    EventID: r.eventid,
    Title: r.title,
    Description: r.description,
    PhotoURL: r.photourl,
    Location: r.location,
    StartDate: r.startdate,
    EndDate: r.enddate,
    Status: r.status,
    SAU_ID: r.sau_id ?? null,
    AUSO_ID: r.auso_id ?? null,
  };
}

// 🔹 GET /api/events
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
      .from(TABLE)
      .select(FIELDS, { count: 'exact' })
      .order('startdate', { ascending: true })
      .range(from, to);

    if (status) q = q.eq('status', status);

    const { data, error, count } = await q;
    if (error) {
      console.error('GET /api/events error:', error);
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

// 🔹 POST /api/events
export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServer();
    const body = await req.json();

    const payload = {
      title: body.Title,
      description: body.Description ?? null,
      photourl: body.PhotoURL ?? null,
      location: body.Location ?? null,
      startdate: body.StartDate ?? null,
      enddate: body.EndDate ?? null,
      status: body.Status ?? 'PENDING',
      sau_id: body.SAU_ID ?? null,
      auso_id: body.AUSO_ID ?? null,
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select(FIELDS)
      .single();

    if (error) {
      console.error('POST /api/events error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(mapRow(data));
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

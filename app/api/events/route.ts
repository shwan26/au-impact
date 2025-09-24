// app/api/events/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TABLE = 'event';
const FIELDS = '*';

// DB row -> API shape
function mapRow(r: any) {
  if (!r) return null;
  return {
    EventID: r.eventid ?? r.event_id ?? r.id ?? r.EventID ?? null,
    Title: r.title ?? 'Untitled Event',
    Description: r.description ?? null,
    Venue: r.venue ?? r.location ?? null,
    StartDateTime: r.startdatetime ?? r.start_date_time ?? r.startdate ?? null,
    EndDateTime: r.enddatetime ?? r.end_date_time ?? r.enddate ?? null,

    Fee: r.fee ?? null,
    OrganizerName: r.organizername ?? null,
    OrganizerLineID: r.organizerlineid ?? null,

    MaxParticipant: r.maxparticipant ?? null,
    ParticipantDeadline: r.participantdeadline ?? null,
    MaxStaff: r.maxstaff ?? null,
    MaxStaffDeadline: r.maxstaffdeadline ?? null,
    ScholarshipHours: r.scholarshiphours ?? null,

    SAU_ID: r.sau_id ?? null,
    AUSO_ID: r.auso_id ?? null,

    Status: r.status ?? null,

    // No poster field on your Event table — leave null here
    PosterURL: null,
  };
}

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseServer();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const pageSize = Math.max(1, Number(searchParams.get('pageSize') || '9'));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const status = (searchParams.get('status') || '').trim();
    const statusesCsv = (searchParams.get('statuses') || '').trim();

    const normalizeStatus = (s: string) =>
      s.toUpperCase() === 'APPROVED' ? 'LIVE' : s.toUpperCase();

    let query = (getSupabaseServer().from(TABLE).select(FIELDS, { count: 'exact' }) as any);

    if (status) {
      query = query.eq('status', normalizeStatus(status));
    } else if (statusesCsv) {
      const list = statusesCsv
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map(normalizeStatus);
      if (list.length) query = query.in('status', list);
    }

    query = query.order('startdatetime', { ascending: true, nullsFirst: true }).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('GET /api/events error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      items: (data ?? []).map(mapRow),
      total: count ?? 0,
    });
  } catch (e: any) {
    console.error('GET /api/events exception:', e?.message);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServer();
    const body = await req.json();

    const title = String(body.Title ?? '').trim();
    const start = body.StartDateTime ?? body.StartDate ?? null;
    const end = body.EndDateTime ?? body.EndDate ?? null;

    if (!title) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    }
    if (!start || !end) {
      return NextResponse.json({ error: 'StartDate and EndDate are required.' }, { status: 400 });
    }

    const startDT = new Date(start);
    const endDT = new Date(end);
    if (isNaN(startDT.getTime()) || isNaN(endDT.getTime())) {
      return NextResponse.json({ error: 'Invalid StartDate/EndDate.' }, { status: 400 });
    }
    if (endDT <= startDT) {
      return NextResponse.json({ error: 'EndDate must be after StartDate.' }, { status: 400 });
    }

    const participantDeadline = body.ParticipantDeadline ?? null;
    const staffDeadline = body.MaxStaffDeadline ?? null;

    if (participantDeadline && new Date(participantDeadline) > startDT) {
      return NextResponse.json(
        { error: 'ParticipantDeadline must be on/before StartDateTime.' },
        { status: 400 }
      );
    }
    if (staffDeadline && new Date(staffDeadline) > startDT) {
      return NextResponse.json(
        { error: 'MaxStaffDeadline must be on/before StartDateTime.' },
        { status: 400 }
      );
    }

    const rawStatus = String(body.Status ?? 'PENDING').toUpperCase();
    const status = rawStatus === 'APPROVED' ? 'LIVE' : rawStatus;

    const payload: Record<string, any> = {
      title,
      description: body.Description ?? null,
      venue: body.Venue ?? body.Location ?? null,
      startdatetime: start,
      enddatetime: end,
      fee: body.Fee ?? null,
      organizername: body.OrganizerName ?? null,
      organizerlineid: body.OrganizerLineID ?? null,
      maxparticipant: body.MaxParticipant ?? null,
      participantdeadline: participantDeadline ?? null,
      maxstaff: body.MaxStaff ?? null,
      maxstaffdeadline: staffDeadline ?? null,
      scholarshiphours: body.ScholarshipHours ?? null,
      sau_id: body.SAU_ID ?? null,
      auso_id: body.AUSO_ID ?? null,
      status,
      // DO NOT include posterurl — your table doesn’t have it
    };

    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    const { data, error } = await supabase
      .from(TABLE)
      .upsert([payload], { onConflict: 'title,sau_id,auso_id' })
      .select(FIELDS)
      .single();

    if (error) {
      console.error('POST /api/events error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(mapRow(data));
  } catch (e: any) {
    console.error('POST /api/events exception:', e?.message);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

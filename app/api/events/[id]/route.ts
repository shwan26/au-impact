// app/api/events/[id]/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TABLE = 'event';
const FIELDS = '*';

function mapRow(r: any) {
  if (!r) return null;
  return {
    EventID: r.eventid ?? r.event_id ?? r.id ?? r.EventID ?? null,
    Title: r.title ?? 'Untitled Event',
    Description: r.description ?? null,
    Venue: r.venue ?? null,
    StartDateTime: r.startdatetime ?? null,
    EndDateTime: r.enddatetime ?? null,
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
    // No poster column on Event
    PosterURL: null,
  };
}

// GET /api/events/[id]
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from(TABLE)
      .select(FIELDS)
      .eq('eventid', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 });
    }
    return NextResponse.json(mapRow(data));
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

// PUT /api/events/[id]
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();

    const updates: Record<string, any> = {};

    if (body.Title !== undefined) updates.title = String(body.Title).trim();
    if (body.Description !== undefined) updates.description = body.Description ?? null;
    if (body.Venue !== undefined || body.Location !== undefined) {
      updates.venue = (body.Venue ?? body.Location) ?? null;
    }

    const start = body.StartDateTime ?? body.StartDate ?? null;
    const end = body.EndDateTime ?? body.EndDate ?? null;
    if (start !== null) updates.startdatetime = start;
    if (end !== null) updates.enddatetime = end;

    if (body.Fee !== undefined) updates.fee = body.Fee ?? null;
    if (body.OrganizerName !== undefined) updates.organizername = body.OrganizerName ?? null;
    if (body.OrganizerLineID !== undefined) updates.organizerlineid = body.OrganizerLineID ?? null;

    if (body.MaxParticipant !== undefined) updates.maxparticipant = body.MaxParticipant ?? null;
    if (body.ParticipantDeadline !== undefined) {
      updates.participantdeadline = body.ParticipantDeadline ?? null;
    }
    if (body.MaxStaff !== undefined) updates.maxstaff = body.MaxStaff ?? null;
    if (body.MaxStaffDeadline !== undefined) {
      updates.maxstaffdeadline = body.MaxStaffDeadline ?? null;
    }
    if (body.ScholarshipHours !== undefined) {
      updates.scholarshiphours = body.ScholarshipHours ?? null;
    }

    if (body.Status !== undefined) {
      const up = String(body.Status ?? '').toUpperCase();
      updates.status = up === 'APPROVED' ? 'LIVE' : up;
    }

    // DO NOT write posterurl — your table doesn't have it

    const supabase = getSupabaseServer();

    // Validate dates/deadlines after considering current row
    const { data: current, error: curErr } = await supabase
      .from(TABLE)
      .select('startdatetime, enddatetime, participantdeadline, maxstaffdeadline')
      .eq('eventid', id)
      .single();

    if (curErr || !current) {
      return NextResponse.json({ error: curErr?.message || 'Not found' }, { status: 404 });
    }

    const effStart = updates.startdatetime ?? current.startdatetime ?? null;
    const effEnd = updates.enddatetime ?? current.enddatetime ?? null;
    const effPartDeadline =
      updates.participantdeadline ?? current.participantdeadline ?? null;
    const effStaffDeadline =
      updates.maxstaffdeadline ?? current.maxstaffdeadline ?? null;

    if (effStart && effEnd) {
      const s = new Date(effStart);
      const e = new Date(effEnd);
      if (isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s) {
        return NextResponse.json(
          { error: 'EndDate must be after StartDate.' },
          { status: 400 }
        );
      }
    }
    if (effStart && effPartDeadline && new Date(effPartDeadline) > new Date(effStart)) {
      return NextResponse.json(
        { error: 'ParticipantDeadline must be on/before StartDateTime.' },
        { status: 400 }
      );
    }
    if (effStart && effStaffDeadline && new Date(effStaffDeadline) > new Date(effStart)) {
      return NextResponse.json(
        { error: 'MaxStaffDeadline must be on/before StartDateTime.' },
        { status: 400 }
      );
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(mapRow(current));
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq('eventid', id)
      .select(FIELDS)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(mapRow(data));
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

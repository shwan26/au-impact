import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TABLE = 'event';
const FIELDS = '*';

function nilIfEmpty(x: unknown) {
  if (x === undefined || x === null) return null;
  const s = String(x).trim();
  return s === '' ? null : s;
}

function mapRow(r: any) {
  if (!r) return null;
  return {
    EventID: r.eventid ?? r.event_id ?? r.id ?? r.EventID ?? null,
    Title: r.title ?? 'Untitled Event',
    Description: r.description ?? null,
    Venue: r.venue ?? null,

    StartDateTime: r.startdatetime ?? null,
    EndDateTime: r.enddatetime ?? null,

    // Fees / Bank
    Fee: typeof r.fee === 'number' ? r.fee : (r.fee == null ? null : Number(r.fee)),
    BankName: r.bankname ?? null,
    BankAccountNo: r.bankaccountno ?? null,
    BankAccountName: r.bankaccountname ?? null,
    PromptPayQR: r.promptpayqr ?? null,

    // SAU extras
    OrganizerName: r.organizername ?? null,
    OrganizerLineID: r.organizerlineid ?? null,
    LineGpURL: r.linegpurl ?? null,
    LineGpQRCode: r.linegpqrcode ?? null,
    ScholarshipHours: r.scholarshiphours ?? null,

    MaxParticipant: r.maxparticipant ?? null,
    ParticipantDeadline: r.participantdeadline ?? null,
    MaxStaff: r.maxstaff ?? null,
    MaxStaffDeadline: r.maxstaffdeadline ?? null,

    SAU_ID: r.sau_id ?? null,
    AUSO_ID: r.auso_id ?? null,
    Status: r.status ?? null,

    // Make sure poster is exposed to clients
    PosterURL: r.posterurl ?? null,
    PhotoURL: r.photourl ?? null,
  };
}

// GET /api/events/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ await params
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
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ await params
    const body = await req.json();

    const updates: Record<string, any> = {};

    // Basic fields
    if (body.Title !== undefined) updates.title = String(body.Title).trim();
    if (body.Description !== undefined) updates.description = nilIfEmpty(body.Description);
    if (body.Venue !== undefined || body.Location !== undefined) {
      updates.venue = nilIfEmpty(body.Venue ?? body.Location);
    }

    // Datetimes
    const start = body.StartDateTime ?? body.StartDate ?? null;
    const end   = body.EndDateTime   ?? body.EndDate   ?? null;
    if (start !== null) updates.startdatetime = start;
    if (end   !== null) updates.enddatetime   = end;

    // Fee & bank
    if (body.Fee !== undefined) {
      const n = Number(body.Fee);
      updates.fee = Number.isFinite(n) ? n : null;
    }
    if (body.BankName        !== undefined) updates.bankname        = nilIfEmpty(body.BankName);
    if (body.BankAccountNo   !== undefined) updates.bankaccountno   = nilIfEmpty(body.BankAccountNo);
    if (body.BankAccountName !== undefined) updates.bankaccountname = nilIfEmpty(body.BankAccountName);
    if (body.PromptPayQR     !== undefined) updates.promptpayqr     = nilIfEmpty(body.PromptPayQR);

    // Organizer + LINE + scholarship
    if (body.OrganizerName   !== undefined) updates.organizername   = nilIfEmpty(body.OrganizerName);
    if (body.OrganizerLineID !== undefined) updates.organizerlineid = nilIfEmpty(body.OrganizerLineID);
    if (body.LineGpURL       !== undefined) updates.linegpurl       = nilIfEmpty(body.LineGpURL);
    if (body.LineGpQRCode    !== undefined) updates.linegpqrcode    = nilIfEmpty(body.LineGpQRCode);
    if (body.ScholarshipHours !== undefined) {
      const n = Number(body.ScholarshipHours);
      updates.scholarshiphours = Number.isFinite(n) ? Math.trunc(n) : null;
    }

    // Capacity + deadlines
    if (body.MaxParticipant      !== undefined) updates.maxparticipant      = body.MaxParticipant ?? null;
    if (body.ParticipantDeadline !== undefined) updates.participantdeadline = nilIfEmpty(body.ParticipantDeadline);
    if (body.MaxStaff            !== undefined) updates.maxstaff            = body.MaxStaff ?? null;
    if (body.MaxStaffDeadline    !== undefined) updates.maxstaffdeadline    = nilIfEmpty(body.MaxStaffDeadline);

    // Poster URL (keep in sync if AUSO updates)
    if (body.PosterURL !== undefined) updates.posterurl = nilIfEmpty(body.PosterURL);

    // Status mapping
    if (body.Status !== undefined) {
      const up = String(body.Status ?? '').toUpperCase();
      updates.status = up === 'APPROVED' ? 'LIVE' : up;
    }

    const supabase = getSupabaseServer();

    // Read current to validate final effective dates
    const { data: current, error: curErr } = await supabase
      .from(TABLE)
      .select('startdatetime, enddatetime, participantdeadline, maxstaffdeadline')
      .eq('eventid', id)
      .single();

    if (curErr || !current) {
      return NextResponse.json({ error: curErr?.message || 'Not found' }, { status: 404 });
    }

    const effStart = updates.startdatetime ?? current.startdatetime ?? null;
    const effEnd   = updates.enddatetime   ?? current.enddatetime   ?? null;
    const effPart  = updates.participantdeadline ?? current.participantdeadline ?? null;
    const effStaff = updates.maxstaffdeadline    ?? current.maxstaffdeadline    ?? null;

    if (effStart && effEnd) {
      const s = new Date(effStart);
      const e = new Date(effEnd);
      if (isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s) {
        return NextResponse.json({ error: 'EndDate must be after StartDate.' }, { status: 400 });
      }
    }
    if (effStart && effPart && new Date(effPart) > new Date(effStart)) {
      return NextResponse.json(
        { error: 'ParticipantDeadline must be on/before StartDateTime.' },
        { status: 400 }
      );
    }
    if (effStart && effStaff && new Date(effStaff) > new Date(effStart)) {
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

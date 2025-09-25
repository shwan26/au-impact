// app/api/events/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TABLE = 'event';
const FIELDS = '*';

function mapRow(r: any) {
  if (!r) return null;
  return {
    EventID: r.eventid ?? r.id ?? null,
    Title: r.title ?? 'Untitled Event',
    Description: r.description ?? null,
    Venue: r.venue ?? null,
    StartDateTime: r.startdatetime ?? null,
    EndDateTime: r.enddatetime ?? null,
    Fee: r.fee ?? null,
    MaxParticipant: r.maxparticipant ?? null,
    ParticipantDeadline: r.participantdeadline ?? null,
    MaxStaff: r.maxstaff ?? null,
    MaxStaffDeadline: r.maxstaffdeadline ?? null,
    ScholarshipHours: r.scholarshiphours ?? null,
    OrganizerName: r.organizername ?? null,
    OrganizerLineID: r.organizerlineid ?? null,
    LineGpURL: r.linegpurl ?? null,
    LineGpQRCode: r.linegpqrcode ?? null,
    BankName: r.bankname ?? null,
    BankAccountNo: r.bankaccountno ?? null,
    BankAccountName: r.bankaccountname ?? null,
    PromptPayQR: r.promptpayqr ?? null,
    Status: r.status ?? null,
    PosterURL: null, // placeholder if you add poster storage
  };
}

// GET /api/events → return list
export async function GET() {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from(TABLE)
      .select(FIELDS)
      .order('startdatetime', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const items = (data ?? []).map(mapRow).filter(Boolean);
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

// POST /api/events → create new
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const row: Record<string, any> = {
      title: body.Title ?? null,
      description: body.Description ?? null,
      venue: body.Location ?? body.Venue ?? null,
      startdatetime: body.StartDateTime ?? body.StartDate ?? null,
      enddatetime: body.EndDateTime ?? body.EndDate ?? null,
      fee: body.Fee ?? null,
      maxparticipant: body.MaxParticipant ?? null,
      participantdeadline: body.ParticipantDeadline ?? null,
      maxstaff: body.MaxStaff ?? null,
      maxstaffdeadline: body.MaxStaffDeadline ?? null,
      scholarshiphours: body.ScholarshipHours ?? null,
      organizername: body.OrganizerName ?? null,
      organizerlineid: body.OrganizerLineID ?? null,
      linegpurl: body.LineGpURL ?? null,
      linegpqrcode: body.LineGpQRCode ?? null,
      bankname: body.BankName ?? null,
      bankaccountno: body.BankAccountNo ?? null,
      bankaccountname: body.BankAccountName ?? null,
      promptpayqr: body.PromptPayQR ?? null,
      status: body.Status ?? 'PENDING',
    };

    const supabase = getSupabaseServer();
    const { data, error } = await supabase.from(TABLE).insert(row).select(FIELDS).single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Insert failed' }, { status: 400 });
    }
    return NextResponse.json(mapRow(data));
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

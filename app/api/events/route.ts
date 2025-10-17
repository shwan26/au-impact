// app/api/events/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

const EVENT_TABLE = 'Event'; // exact case
const POSTER_TABLE = 'EventPostURL'; // exact case
const FIELDS = '*';

// ---------- helpers ----------
function nilIfEmpty(x: unknown) {
  if (x === undefined || x === null) return null;
  const s = String(x).trim();
  return s === '' ? null : s;
}

function getEventId(row: any) {
  return row?.EventID ?? row?.eventid ?? row?.id ?? null;
}

function mapRow(r: any) {
  return {
    EventID: r.EventID ?? r.eventid ?? r.id ?? null,
    Title: r.Title ?? r.title ?? 'Untitled Event',
    Description: r.Description ?? r.description ?? null,
    Venue: r.Venue ?? r.venue ?? null,
    StartDateTime: r.StartDateTime ?? r.startdatetime ?? null,
    EndDateTime: r.EndDateTime ?? r.enddatetime ?? null,
    Fee:
      r.Fee ??
      (typeof r.fee === 'number'
        ? r.fee
        : r.fee == null
        ? null
        : Number(r.fee)),
    BankName: r.BankName ?? r.bankname ?? null,
    BankAccountNo: r.BankAccountNo ?? r.bankaccountno ?? null,
    BankAccountName: r.BankAccountName ?? r.bankaccountname ?? null,
    PromptPayQR: r.PromptPayQR ?? r.promptpayqr ?? null,
    OrganizerName: r.OrganizerName ?? r.organizername ?? null,
    OrganizerLineID: r.OrganizerLineID ?? r.organizerlineid ?? null,
    LineGpURL: r.LineGpURL ?? r.linegpurl ?? null,
    LineGpQRCode: r.LineGpQRCode ?? r.linegpqrcode ?? null,
    ScholarshipHours: r.ScholarshipHours ?? r.scholarshiphours ?? null,
    MaxParticipant: r.MaxParticipant ?? r.maxparticipant ?? null,
    ParticipantDeadline: r.ParticipantDeadline ?? r.participantdeadline ?? null,
    MaxStaff: r.MaxStaff ?? r.maxstaff ?? null,
    MaxStaffDeadline: r.MaxStaffDeadline ?? r.maxstaffdeadline ?? null,
    SAU_ID: r.SAU_ID ?? r.sau_id ?? null,
    AUSO_ID: r.AUSO_ID ?? r.auso_id ?? null,
    Status: r.Status ?? r.status ?? null,
  };
}

// ---------- POST /api/events (create) ----------
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const lineGpURL =
      body.LineGpURL ??
      body.LineGpURL_Staff ??
      body.LineGpURL_Participant ??
      null;

    const lineGpQRCode =
      body.LineGpQRCode ??
      body.LineGpQRCode_Staff ??
      body.LineGpQRCode_Participant ??
      null;

    const posterUrl = nilIfEmpty(body.PosterURL ?? body.PhotoURL);

    const insert: Record<string, any> = {
      Title: nilIfEmpty(body.Title) ?? 'Untitled Event',
      Description: nilIfEmpty(body.Description),
      Venue: nilIfEmpty(body.Venue ?? body.Location),
      StartDateTime: body.StartDateTime ?? body.StartDate ?? null,
      EndDateTime: body.EndDateTime ?? body.EndDate ?? null,
      Fee: body.Fee == null ? null : Number(body.Fee),
      BankName: nilIfEmpty(body.BankName),
      BankAccountNo: nilIfEmpty(body.BankAccountNo),
      BankAccountName: nilIfEmpty(body.BankAccountName),
      PromptPayQR: nilIfEmpty(body.PromptPayQR),
      OrganizerName: nilIfEmpty(body.OrganizerName),
      OrganizerLineID: nilIfEmpty(body.OrganizerLineID),
      LineGpURL: nilIfEmpty(lineGpURL),
      LineGpQRCode: nilIfEmpty(lineGpQRCode),
      ScholarshipHours:
        body.ScholarshipHours == null
          ? null
          : Math.trunc(Number(body.ScholarshipHours)),
      MaxParticipant: body.MaxParticipant ?? null,
      ParticipantDeadline: nilIfEmpty(body.ParticipantDeadline),
      MaxStaff: body.MaxStaff ?? null,
      MaxStaffDeadline: nilIfEmpty(body.MaxStaffDeadline),
      Status: (() => {
        const up = String(body.Status ?? 'PENDING').toUpperCase();
        return up === 'APPROVED' ? 'LIVE' : up;
      })(),
      SAU_ID: body.SAU_ID ?? null,
      AUSO_ID: body.AUSO_ID ?? null,
    };

    const supabase = await getSupabaseServer();

    // 1) Insert Event
    const { data: created, error } = await supabase
      .from(EVENT_TABLE)
      .insert(insert)
      .select(FIELDS)
      .single();

    if (error || !created) {
      return NextResponse.json(
        { error: error?.message || 'Insert failed' },
        { status: 400 }
      );
    }

    // 2) Insert poster if provided
    if (posterUrl) {
      const eventId = getEventId(created);
      if (eventId != null) {
        const { error: posterErr } = await supabase
          .from(POSTER_TABLE)
          .insert({
            EventID: eventId,
            PostURL: posterUrl,
            AddedAt: new Date().toISOString(),
          });

        if (posterErr)
          console.warn('Poster insert failed:', posterErr.message);
      }
    }

    const response = { ...mapRow(created), PosterURL: posterUrl ?? null };
    return NextResponse.json({ ok: true, event: response }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}

// ---------- GET /api/events (list) ----------
export async function GET(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');

    const getEventId = (r: any) =>
      r?.EventID ?? r?.eventid ?? r?.id ?? null;

    // 1) Fetch events
    let query = supabase
      .from(EVENT_TABLE)
      .select(FIELDS)
      .order('StartDateTime', { ascending: false })
      .order('EventID', { ascending: false });

    if (statusParam && statusParam.trim()) {
      query = query.eq('Status', statusParam.trim());
    }

    const { data, error } = await query;

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    const events = Array.isArray(data) ? data : [];
    const ids = events.map(getEventId).filter((x) => x != null);

    // 2) Fetch latest posters
    const posterMap = new Map<any, string>();
    if (ids.length) {
      const { data: posters, error: pErr } = await supabase
        .from(POSTER_TABLE)
        .select('EventID, PostURL, AddedAt')
        .in('EventID', ids as any[])
        .order('AddedAt', { ascending: false });

      if (!pErr && Array.isArray(posters)) {
        for (const p of posters) {
          if (!posterMap.has(p.EventID)) {
            posterMap.set(p.EventID, p.PostURL);
          }
        }
      }
    }

    // 3) Map to output format
    const items = events.map((r: any) => ({
      EventID: getEventId(r),
      Title: r.Title ?? r.title ?? 'Untitled Event',
      Description: r.Description ?? r.description ?? null,
      Status: r.Status ?? r.status ?? null,
      StartDate: r.StartDate ?? r.StartDateTime ?? r.startdatetime ?? null,
      EndDate: r.EndDate ?? r.EndDateTime ?? r.enddatetime ?? null,
      Location: r.Location ?? r.Venue ?? r.venue ?? null,
      PhotoURL: posterMap.get(getEventId(r)) ?? null,
    }));

    return NextResponse.json({ items, total: items.length });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}

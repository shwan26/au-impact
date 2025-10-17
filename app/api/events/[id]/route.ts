// app/api/events/[id]/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

const EVENT_TABLE = 'Event';
const POSTER_TABLE = 'eventposturl';

function nilIfEmpty(x: unknown) {
  if (x == null) return null;
  const s = String(x).trim();
  return s === '' ? null : s;
}
const getEventId = (r: any) => r?.EventID ?? r?.eventid ?? r?.id ?? null;

function toApiEvent(row: any, posterUrl: string | null) {
  return {
    EventID: row.EventID ?? row.eventid ?? row.id ?? null,
    Title: row.Title ?? row.title ?? 'Untitled Event',
    Description: row.Description ?? row.description ?? null,
    Venue: row.Venue ?? row.venue ?? null,
    StartDateTime: row.StartDateTime ?? row.startdatetime ?? null,
    EndDateTime: row.EndDateTime ?? row.enddatetime ?? null,
    StartDate: row.StartDate ?? row.StartDateTime ?? row.startdatetime ?? null,
    EndDate: row.EndDate ?? row.EndDateTime ?? row.enddatetime ?? null,
    Status: row.Status ?? row.status ?? null,
    ScholarshipHours: row.ScholarshipHours ?? row.scholarshiphours ?? null,
    OrganizerLineID: row.OrganizerLineID ?? row.organizerlineid ?? null,
    LineGpURL: row.LineGpURL ?? row.linegpurl ?? null,
    LineGpQRCode: row.LineGpQRCode ?? row.linegpqrcode ?? null,
    Fee: row.Fee ?? row.fee ?? null,
    BankName: row.BankName ?? row.bankname ?? null,
    BankAccountNo: row.BankAccountNo ?? row.bankaccountno ?? null,
    BankAccountName: row.BankAccountName ?? row.bankaccountname ?? null,
    PromptPayQR: row.PromptPayQR ?? row.promptpayqr ?? null,
    PhotoURL: posterUrl,
    PosterURL: posterUrl,
    Location: row.Location ?? row.Venue ?? row.venue ?? null,
  };
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await getSupabaseServer();
    const id = params.id;

    const { data: row, error } = await supabase
      .from(EVENT_TABLE)
      .select('*')
      .eq('EventID', id)
      .single();

    if (error || !row) {
      return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 });
    }

    let posterUrl: string | null = null;
    const { data: posters } = await supabase
      .from(POSTER_TABLE)
      .select('PostURL, AddedAt')
      .eq('EventID', getEventId(row))
      .order('AddedAt', { ascending: false })
      .limit(1);

    if (Array.isArray(posters) && posters[0]?.PostURL) posterUrl = posters[0].PostURL;

    return NextResponse.json(toApiEvent(row, posterUrl));
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await getSupabaseServer();
    const id = params.id;
    const body = await req.json();

    const update: Record<string, any> = {
      Title: nilIfEmpty(body.Title),
      Description: nilIfEmpty(body.Description),
      Venue: nilIfEmpty(body.Location ?? body.Venue),
      StartDateTime: body.StartDateTime ?? body.StartDate ?? null,
      EndDateTime: body.EndDateTime ?? body.EndDate ?? null,
      Status: body.Status ? String(body.Status).toUpperCase() : undefined,
      ScholarshipHours: body.ScholarshipHours == null ? null : Math.trunc(Number(body.ScholarshipHours)),
      OrganizerLineID: nilIfEmpty(body.OrganizerLineID),
      LineGpURL: nilIfEmpty(body.LineGpURL),
      LineGpQRCode: nilIfEmpty(body.LineGpQRCode),
      Fee: body.Fee == null ? null : Number(body.Fee),
      BankName: nilIfEmpty(body.BankName),
      BankAccountNo: nilIfEmpty(body.BankAccountNo),
      BankAccountName: nilIfEmpty(body.BankAccountName),
      PromptPayQR: nilIfEmpty(body.PromptPayQR),
    };
    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

    const { data: updated, error } = await supabase
      .from(EVENT_TABLE)
      .update(update)
      .eq('EventID', id)
      .select('*')
      .single();

    if (error || !updated) {
      return NextResponse.json({ error: error?.message || 'Update failed' }, { status: 400 });
    }

    if (body.PhotoURL) {
      await supabase.from(POSTER_TABLE).insert({
        EventID: getEventId(updated),
        PostURL: String(body.PhotoURL),
        AddedAt: new Date().toISOString(),
      });
    }

    let posterUrl: string | null = body.PhotoURL ?? null;
    if (!posterUrl) {
      const { data: posters } = await supabase
        .from(POSTER_TABLE)
        .select('PostURL, AddedAt')
        .eq('EventID', getEventId(updated))
        .order('AddedAt', { ascending: false })
        .limit(1);
      posterUrl = posters?.[0]?.PostURL ?? null;
    }

    return NextResponse.json(toApiEvent(updated, posterUrl));
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

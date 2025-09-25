// app/api/events/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TABLE = 'event';
const FIELDS = '*';

function mapRow(r: any) {
  return {
    EventID: r.eventid ?? r.id ?? null,
    Title: r.title ?? 'Untitled Event',
    Description: r.description ?? null,
    Venue: r.venue ?? null,

    StartDateTime: r.startdatetime ?? null,
    EndDateTime: r.enddatetime ?? null,

    Fee: typeof r.fee === 'number' ? r.fee : (r.fee == null ? null : Number(r.fee)),

    // status + owners
    Status: (r.status ?? 'PENDING').toString().toUpperCase(),
    SAU_ID: r.sau_id ?? null,
    AUSO_ID: r.auso_id ?? null,

    // poster for list card
    PosterURL: r.posterurl ?? null,

    // capacities
    MaxParticipant: r.maxparticipant ?? null,
    MaxStaff: r.maxstaff ?? null,

    CreatedAt: r.created_at ?? r.createdAt ?? null,
  };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const status = (url.searchParams.get('status') || '').trim().toUpperCase();

    const supabase = getSupabaseServer();
    let q = supabase.from(TABLE).select(FIELDS).order('startdatetime', { ascending: true });

    if (status) q = q.eq('status', status);

    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const items = (data ?? []).map(mapRow);
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

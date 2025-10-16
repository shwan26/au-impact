export const runtime = 'nodejs';

import { NextResponse, NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

const TABLE  = 'Announcement';
const FIELDS = '"AnnouncementID","Topic","Description","PhotoURL","DatePosted","Status","SAU_ID","AUSO_ID"';

type IdParams = { params: { id: string } };

export async function GET(_req: Request, { params }: IdParams) {
  const { id } = params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum))
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from(TABLE)
    .select(FIELDS)
    .eq('AnnouncementID', idNum)
    .maybeSingle();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // 🔸 Use SAU_ID to look up the name from the sau table
  let SAU_Name: string | null = null;
  // GET
  if (data.SAU_ID != null) {
    const { data: sauRow, error: sauError } = await supabase
      .from('sau')
      .select('name')        // <-- quoted
      .eq('sau_id', data.SAU_ID) // <-- quoted
      .maybeSingle();

    if (!sauError && sauRow) SAU_Name = sauRow.name ?? null;
  }

  // Return both announcement data and SAU_Name
  return NextResponse.json({ ...data, SAU_Name });
}


export async function PUT(req: Request, { params }: IdParams) {
  try {
    const { id } = params;
    const idNum = Number(id);
    if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const supabase = await getSupabaseServer();
    const body = await req.json();

    type AnnouncementUpdate = {
      Topic?: string | null;
      Description?: string | null;
      PhotoURL?: string | null;
      Status?: 'PENDING' | 'LIVE' | 'COMPLETE' | null;
      SAU_ID?: number | null;
      AUSO_ID?: number | null;
    };

    const payload: AnnouncementUpdate = {};
    if ('Topic' in body)       payload.Topic       = body.Topic ?? null;
    if ('Description' in body) payload.Description = body.Description ?? null;
    if ('PhotoURL' in body)    payload.PhotoURL    = body.PhotoURL ?? null;
    if ('Status' in body)      payload.Status      = body.Status ?? null;
    if ('SAU_ID' in body)      payload.SAU_ID      = body.SAU_ID ?? null;
    if ('AUSO_ID' in body)     payload.AUSO_ID     = body.AUSO_ID ?? null;

    if (!Object.keys(payload).length)
      return NextResponse.json({ error: 'No updatable fields' }, { status: 400 });

    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('AnnouncementID', idNum)
      .select(FIELDS)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    let SAU_Name: string | null = null;
    if (data.SAU_ID != null) {
      const { data: sauRow } = await supabase
        .from('sau')
        .select('name')
        .eq('sau_id', data.SAU_ID)
        .maybeSingle();
      SAU_Name = sauRow?.name ?? null;
    }

    return NextResponse.json({ ...data, SAU_Name });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Bad request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

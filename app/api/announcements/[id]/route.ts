export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

const TABLE  = 'Announcement';
const FIELDS = '"AnnouncementID","Topic","Description","PhotoURL","DatePosted","Status","SAU_ID","AUSO_ID"';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const idNum = Number(params.id);
    if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from(TABLE)
      .select(FIELDS)
      .eq('AnnouncementID', idNum)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data)  return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const idNum = Number(params.id);
    if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const supabase = await getSupabaseServer();
    const body = await req.json();

    // Only set provided fields (PascalCase keys)
    const payload: Record<string, any> = {};
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
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const idNum = Number(params.id);
    if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const supabase = await getSupabaseServer();
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('AnnouncementID', idNum);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status: 400 });
  }
}

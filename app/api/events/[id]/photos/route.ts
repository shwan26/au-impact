// app/api/events/[id]/photos/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('event_photos')
      .select('url')
      .eq('event_id', Number(params.id))
      .order('added_at', { ascending: true }); // return EVERY photo in order

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const items = (data ?? []).map((r) => r.url).filter(Boolean);
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

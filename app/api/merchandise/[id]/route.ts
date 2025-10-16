import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from('merchandise')
    .select('*')
    .eq('ItemID', params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();

  const { data, error } = await supabase
    .from('merchandise')
    .update(body)
    .eq('ItemID', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { error } = await supabase
    .from('merchandise')
    .delete()
    .eq('ItemID', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

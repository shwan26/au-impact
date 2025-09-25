// app/api/merchandise/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  const { data, error } = await supabase
    .from('Merchandise')
    .select('*')
    .order('ItemID', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(req: Request) {
  const body = await req.json();

  const { data, error } = await supabase
    .from('Merchandise')
    .insert([
      {
        Title: body.title,
        Description: body.description,
        Price: body.price,
        ContactName: body.contactName,
        ContactLineID: body.contactLineId,
        PosterURL: body.posterUrl,
        FrontViewURL: body.frontUrl,
        BackViewURL: body.backUrl,
        SizeChartURL: body.sizeChartUrl,
        Status: body.status ?? 'PENDING',
      },
    ])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

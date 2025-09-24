// app/api/merchandise/route.ts
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseClient";

export async function GET() {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("Merchandise")
    .select("*")
    .order("ItemID", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
  return NextResponse.json(
    { items: data ?? [] },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: Request) {
  const supabase = getSupabaseServer();
  const body = await req.json().catch(() => null);

  if (!body || typeof body?.Title !== "string" || typeof body?.Price !== "number") {
    return NextResponse.json(
      { error: "Invalid payload. Require Title (string) and Price (number)" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const payload: Record<string, any> = {
    Title: body.Title,
    Price: body.Price,
    Description: body.Description ?? null,
    ContactName: body.ContactName ?? null,
    ContactLineID: body.ContactLineID ?? null,
    PosterURL: body.PosterURL ?? null,
    FrontViewURL: body.FrontViewURL ?? null,
    BackViewURL: body.BackViewURL ?? null,
    SizeChartURL: body.SizeChartURL ?? null,
    PickUpDate: body.PickUpDate ?? null,
    PickUpTime: body.PickUpTime ?? null,
    PickUpPoint: body.PickUpPoint ?? null,
    SAU_ID: body.SAU_ID ?? null,
    AUSO_ID: body.AUSO_ID ?? null,
    Status: "PENDING",
  };

  const { data, error } = await supabase
    .from("Merchandise")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
  return NextResponse.json(data, {
    status: 201,
    headers: { "Cache-Control": "no-store" },
  });
}

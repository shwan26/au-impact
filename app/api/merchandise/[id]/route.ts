// app/api/merchandise/[id]/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseClient";

type Params = { params: { id: string } };

export async function GET(_: Request, { params }: Params) {
  const supabase = getSupabaseServer();
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("Merchandise")
    .select("*")
    .eq("ItemID", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json(data);
}

export async function PATCH(req: Request, { params }: Params) {
  const supabase = getSupabaseServer();
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({} as any));
  const update: Record<string, any> = {};

  // Allow status & a few editable fields
  if (typeof body.Status === "string") update.Status = body.Status; // 'PENDING'|'APPROVED'|'REJECTED'|'SOLD_OUT'
  if (typeof body.Title === "string") update.Title = body.Title;
  if (typeof body.Price === "number") update.Price = body.Price;
  if ("PickUpPoint" in body) update.PickUpPoint = body.PickUpPoint ?? null;
  if ("PickUpDate" in body) update.PickUpDate = body.PickUpDate ?? null;
  if ("PickUpTime" in body) update.PickUpTime = body.PickUpTime ?? null;

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("Merchandise")
    .update(update)
    .eq("ItemID", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET all clients
export async function GET() {
  const { data, error } = await supabase
    .from("jcoach_clients")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST create/update client
export async function POST(request: Request) {
  const body = await request.json();
  const { id, name, notes } = body;

  const { data, error } = await supabase
    .from("jcoach_clients")
    .upsert({
      id,
      name,
      notes: notes || "",
      created_at: body.createdAt || new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE client
export async function DELETE(request: Request) {
  const { id } = await request.json();
  const { error } = await supabase.from("jcoach_clients").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

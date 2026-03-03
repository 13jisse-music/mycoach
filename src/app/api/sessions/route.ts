import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET all sessions (optional ?clientId= filter)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  let query = supabase
    .from("jcoach_sessions")
    .select("*")
    .order("date", { ascending: false });

  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Map DB columns to frontend format
  const sessions = (data || []).map((s) => ({
    id: s.id,
    clientId: s.client_id,
    mode: s.mode,
    date: s.date,
    duration: s.duration,
    transcript: s.transcript,
    summary: s.summary,
    suggestions: s.suggestions || [],
  }));

  return NextResponse.json(sessions);
}

// POST create session
export async function POST(request: Request) {
  const body = await request.json();

  const { data, error } = await supabase
    .from("jcoach_sessions")
    .upsert({
      id: body.id,
      client_id: body.clientId || null,
      mode: body.mode,
      date: body.date,
      duration: body.duration,
      transcript: body.transcript || "",
      summary: body.summary || null,
      suggestions: body.suggestions || [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE session
export async function DELETE(request: Request) {
  const { id } = await request.json();
  const { error } = await supabase.from("jcoach_sessions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

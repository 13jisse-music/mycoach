import { NextResponse } from "next/server";
import { aiCascade } from "@/lib/ai-cascade";
import {
  buildMusicPrompt,
  buildPNLPrompt,
  buildSessionSummaryPrompt,
} from "@/lib/prompts";

export async function POST(request: Request) {
  const { transcript, mode, action } = await request.json();

  if (!transcript) {
    return NextResponse.json({ error: "Pas de transcription" }, { status: 400 });
  }

  let prompt: string;

  if (action === "summary") {
    prompt = buildSessionSummaryPrompt(mode || "music", transcript);
  } else if (mode === "pnl") {
    prompt = buildPNLPrompt(transcript);
  } else {
    prompt = buildMusicPrompt(transcript);
  }

  const result = await aiCascade(
    prompt,
    process.env.GEMINI_API_KEY,
    process.env.GROQ_API_KEY
  );

  return NextResponse.json(result);
}

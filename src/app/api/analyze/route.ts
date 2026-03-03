import { NextResponse } from "next/server";
import { aiCascade } from "@/lib/ai-cascade";
import {
  buildMusicPrompt,
  buildPNLPrompt,
  buildSessionSummaryPrompt,
  buildCrossSessionPrompt,
} from "@/lib/prompts";

export async function POST(request: Request) {
  const { transcript, mode, action, clientName, summaries } = await request.json();

  let prompt: string;

  if (action === "bilan" && clientName && summaries) {
    prompt = buildCrossSessionPrompt(clientName, mode || "pnl", summaries);
  } else if (action === "summary") {
    if (!transcript) {
      return NextResponse.json({ error: "Pas de transcription" }, { status: 400 });
    }
    prompt = buildSessionSummaryPrompt(mode || "pnl", transcript);
  } else {
    if (!transcript) {
      return NextResponse.json({ error: "Pas de transcription" }, { status: 400 });
    }
    // Default: PNL / Rapport de rencontre prompt
    prompt = buildPNLPrompt(transcript);
  }

  const result = await aiCascade(
    prompt,
    process.env.GEMINI_API_KEY,
    process.env.GROQ_API_KEY
  );

  return NextResponse.json(result);
}

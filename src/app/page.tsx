"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { saveSession, getSessions, generateId, type Session } from "@/lib/sessions";

type Mode = "music" | "pnl";

// ─── Speech Recognition type ────────────────────────────────
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

// ─── Speak function (plays through Bluetooth = glasses speakers) ─
function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  utterance.rate = 1.05;
  utterance.pitch = 1;
  utterance.volume = 0.7;
  // Prefer a French voice
  const voices = window.speechSynthesis.getVoices();
  const frVoice = voices.find(
    (v) => v.lang.startsWith("fr") && v.name.includes("Google")
  ) || voices.find((v) => v.lang.startsWith("fr"));
  if (frVoice) utterance.voice = frVoice;
  window.speechSynthesis.speak(utterance);
}

export default function SessionPage() {
  const [mode, setMode] = useState<Mode>("music");
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastSuggestion, setLastSuggestion] = useState("");
  const [sessionTime, setSessionTime] = useState(0);
  const [consentGiven, setConsentGiven] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [recentCount, setRecentCount] = useState(0);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const transcriptRef = useRef("");
  const suggestionsRef = useRef<string[]>([]);
  const sessionIdRef = useRef(generateId());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shouldRestartRef = useRef(false);

  // Load recent session count
  useEffect(() => {
    setRecentCount(getSessions().length);
  }, []);

  // ─── Timer ─────────────────────────────────────────────────
  useEffect(() => {
    if (isListening) {
      timerRef.current = setInterval(
        () => setSessionTime((t) => t + 1),
        1000
      );
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isListening]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // ─── Start listening ───────────────────────────────────────
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Ce navigateur ne supporte pas la reconnaissance vocale. Utilise Chrome.");
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "fr-FR";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript + " ";
        }
      }
      if (finalText) {
        transcriptRef.current += finalText;
        setTranscript(transcriptRef.current);
      }
    };

    recognition.onend = () => {
      // Auto-restart if still in session
      if (shouldRestartRef.current) {
        try {
          recognition.start();
        } catch {
          // ignore
        }
      }
    };

    recognition.onerror = (event: { error: string }) => {
      if (event.error === "not-allowed") {
        alert("Autorise le microphone pour utiliser l'assistant.");
        setIsListening(false);
        shouldRestartRef.current = false;
      }
    };

    recognitionRef.current = recognition;
    shouldRestartRef.current = true;
    recognition.start();
    setIsListening(true);
  }, []);

  // ─── Stop listening ────────────────────────────────────────
  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // ─── Ask AI (1 tap = suggestion dans l'oreille) ───────────
  const askAI = useCallback(async () => {
    if (!transcriptRef.current.trim()) return;
    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcriptRef.current.slice(-2000), // Dernier contexte
          mode,
        }),
      });
      const data = await res.json();
      setLastSuggestion(data.text);
      if (data.text) suggestionsRef.current.push(data.text);

      // Chuchote la réponse dans les lunettes (via Bluetooth)
      if (speakEnabled && data.text) {
        speak(data.text);
      }
    } catch {
      setLastSuggestion("Erreur de connexion IA");
    } finally {
      setIsAnalyzing(false);
    }
  }, [mode, speakEnabled]);

  // ─── End session (résumé + sauvegarde) ─────────────────────
  const endSession = useCallback(async () => {
    stopListening();
    if (!transcriptRef.current.trim()) return;

    setIsAnalyzing(true);
    let summary = "";
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcriptRef.current,
          mode,
          action: "summary",
        }),
      });
      const data = await res.json();
      summary = data.text;
      setLastSuggestion(data.text);
    } catch {
      setLastSuggestion("Erreur lors de la génération du résumé");
    } finally {
      setIsAnalyzing(false);
    }

    // Sauvegarde automatique
    const session: Session = {
      id: sessionIdRef.current,
      mode,
      date: new Date().toISOString(),
      duration: sessionTime,
      transcript: transcriptRef.current,
      summary,
      suggestions: suggestionsRef.current,
    };
    saveSession(session);
    setSessionSaved(true);
    setRecentCount((c) => c + 1);
  }, [mode, stopListening, sessionTime]);

  // ─── Reset ─────────────────────────────────────────────────
  const resetSession = () => {
    stopListening();
    setTranscript("");
    transcriptRef.current = "";
    suggestionsRef.current = [];
    sessionIdRef.current = generateId();
    setLastSuggestion("");
    setSessionTime(0);
    setSessionSaved(false);
    setConsentGiven(false);
  };

  // ─── Consent screen ───────────────────────────────────────
  if (!consentGiven) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 gap-8">
        <div className="text-4xl">🎓</div>
        <h1 className="text-2xl font-bold text-center">Assistant Coach</h1>
        <p className="text-[#6B7280] text-center max-w-sm text-sm">
          JC Martinez — Coaching vocal & Développement personnel
        </p>

        {/* Mode selector */}
        <div className="flex gap-3">
          <button
            onClick={() => setMode("music")}
            className={`px-5 py-3 rounded-xl font-medium transition-all ${
              mode === "music"
                ? "bg-[#C9A84C] text-black"
                : "bg-white/10 text-[#6B7280]"
            }`}
          >
            🎵 Musique
          </button>
          <button
            onClick={() => setMode("pnl")}
            className={`px-5 py-3 rounded-xl font-medium transition-all ${
              mode === "pnl"
                ? "bg-[#8B5CF6] text-white"
                : "bg-white/10 text-[#6B7280]"
            }`}
          >
            🧠 Dev. personnel
          </button>
        </div>

        {/* Audio toggle */}
        <label className="flex items-center gap-3 text-sm text-[#6B7280]">
          <input
            type="checkbox"
            checked={speakEnabled}
            onChange={(e) => setSpeakEnabled(e.target.checked)}
            className="w-5 h-5 accent-[#C9A84C]"
          />
          Réponse audio (lunettes)
        </label>

        {/* Start button */}
        <button
          onClick={() => setConsentGiven(true)}
          className="w-full max-w-xs py-4 bg-[#22C55E] text-black font-bold text-lg rounded-2xl active:scale-95 transition-transform"
        >
          Démarrer la séance
        </button>

        <p className="text-[#6B7280] text-xs text-center max-w-xs">
          En démarrant, vous confirmez le consentement du client pour la prise
          de notes assistée par IA.
        </p>

        {/* Historique link */}
        {recentCount > 0 && (
          <a
            href="/historique"
            className="text-sm text-[#6B7280] underline underline-offset-4"
          >
            📋 {recentCount} séance{recentCount > 1 ? "s" : ""} enregistrée{recentCount > 1 ? "s" : ""}
          </a>
        )}
      </div>
    );
  }

  // ─── Session screen ────────────────────────────────────────
  const accentColor = mode === "music" ? "#C9A84C" : "#8B5CF6";

  return (
    <div className="flex min-h-screen flex-col p-4 gap-4 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: isListening ? "#22C55E" : "#6B7280",
              boxShadow: isListening ? "0 0 12px #22C55E" : "none",
            }}
          />
          <span className="text-sm font-medium" style={{ color: accentColor }}>
            {mode === "music" ? "🎵 Musique" : "🧠 Dev. perso"}
          </span>
        </div>
        <span className="font-mono text-lg text-[#6B7280]">
          {formatTime(sessionTime)}
        </span>
      </div>

      {/* Transcript area */}
      <div className="flex-1 bg-white/5 rounded-2xl p-4 overflow-y-auto max-h-[30vh] text-sm leading-relaxed text-[#FAFAFA]/70">
        {transcript || (
          <span className="text-[#6B7280] italic">
            {isListening
              ? "En écoute... parlez normalement"
              : "Appuyez sur Écouter pour commencer"}
          </span>
        )}
      </div>

      {/* AI Suggestion */}
      {lastSuggestion && (
        <div
          className="rounded-2xl p-4 text-sm leading-relaxed border"
          style={{
            borderColor: accentColor + "40",
            backgroundColor: accentColor + "10",
          }}
        >
          <div
            className="text-xs font-bold uppercase mb-2"
            style={{ color: accentColor }}
          >
            💡 Suggestion IA
          </div>
          <div className="whitespace-pre-wrap">{lastSuggestion}</div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent p-4 pt-8">
        <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
          {/* Listen toggle */}
          <button
            onClick={isListening ? stopListening : startListening}
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all active:scale-90 relative"
            style={{
              backgroundColor: isListening ? "#EF4444" : "#22C55E",
            }}
          >
            {isListening && (
              <span
                className="absolute inset-0 rounded-full animate-pulse-ring"
                style={{ border: "3px solid #EF4444" }}
              />
            )}
            {isListening ? "⏸" : "🎙"}
          </button>

          {/* ASK AI — Le bouton magique (1 tap = suggestion dans l'oreille) */}
          <button
            onClick={askAI}
            disabled={isAnalyzing || !transcript}
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all active:scale-90 disabled:opacity-30 relative"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 30px ${accentColor}40`,
            }}
          >
            {isAnalyzing ? (
              <span className="animate-spin text-2xl">⏳</span>
            ) : (
              "💡"
            )}
          </button>

          {/* End session */}
          <button
            onClick={endSession}
            className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl transition-all active:scale-90"
          >
            ⏹
          </button>
        </div>

        {/* Quick actions */}
        <div className="flex justify-center gap-3 mt-3">
          {sessionSaved ? (
            <a
              href="/historique"
              className="text-xs text-[#22C55E] px-3 py-1.5 rounded-lg bg-[#22C55E]/10"
            >
              ✓ Sauvegardée — Voir l&apos;historique
            </a>
          ) : (
            <button
              onClick={resetSession}
              className="text-xs text-[#6B7280] px-3 py-1.5 rounded-lg bg-white/5"
            >
              Nouvelle séance
            </button>
          )}
          <button
            onClick={() => setSpeakEnabled(!speakEnabled)}
            className="text-xs px-3 py-1.5 rounded-lg bg-white/5"
            style={{ color: speakEnabled ? "#22C55E" : "#6B7280" }}
          >
            {speakEnabled ? "🔊 Audio ON" : "🔇 Audio OFF"}
          </button>
        </div>
      </div>
    </div>
  );
}

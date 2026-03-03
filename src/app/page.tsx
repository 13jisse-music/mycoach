"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { saveSession, getSessions, syncSessions, generateId, type Session } from "@/lib/sessions";
import { getClients, saveClient, syncClients, type Client } from "@/lib/clients";

type Mode = "pnl";

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

// ─── Speak function with echo prevention ─────────────────────
// Pauses speech recognition while speaking, then resumes after
let pauseRecognitionFn: (() => void) | null = null;
let resumeRecognitionFn: (() => void) | null = null;

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  // Pause mic to prevent echo
  pauseRecognitionFn?.();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  utterance.rate = 1.05;
  utterance.pitch = 1;
  utterance.volume = 0.7;
  const voices = window.speechSynthesis.getVoices();
  const frVoice = voices.find(
    (v) => v.lang.startsWith("fr") && v.name.includes("Google")
  ) || voices.find((v) => v.lang.startsWith("fr"));
  if (frVoice) utterance.voice = frVoice;

  // Resume mic after speech ends + small delay
  utterance.onend = () => {
    setTimeout(() => resumeRecognitionFn?.(), 300);
  };
  utterance.onerror = () => {
    setTimeout(() => resumeRecognitionFn?.(), 300);
  };

  window.speechSynthesis.speak(utterance);
}

export default function SessionPage() {
  const [mode] = useState<Mode>("pnl");
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastSuggestion, setLastSuggestion] = useState("");
  const [sessionTime, setSessionTime] = useState(0);
  const [consentGiven, setConsentGiven] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [recentCount, setRecentCount] = useState(0);

  // Client management
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [showQR, setShowQR] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const transcriptRef = useRef("");
  const suggestionsRef = useRef<string[]>([]);
  const sessionIdRef = useRef(generateId());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shouldRestartRef = useRef(false);
  const isSpeakingRef = useRef(false); // true = TTS en cours, ignorer le mic

  // Load clients and session count (local first, then sync from Supabase)
  useEffect(() => {
    setRecentCount(getSessions().length);
    setClients(getClients());
    // Sync in background
    syncClients().then((c) => setClients(c));
    syncSessions().then((s) => setRecentCount(s.length));
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

  // ─── Add client ──────────────────────────────────────────
  const addClient = () => {
    if (!newClientName.trim()) return;
    const client: Client = {
      id: generateId(),
      name: newClientName.trim(),
      notes: "",
      createdAt: new Date().toISOString(),
    };
    saveClient(client);
    setClients(getClients());
    setSelectedClientId(client.id);
    setNewClientName("");
    setShowAddClient(false);
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
    recognition.interimResults = false; // IMPORTANT: false = only complete sentences, no word-by-word duplication
    recognition.lang = "fr-FR";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Ignore audio captured while TTS is speaking (prevents echo)
      if (isSpeakingRef.current) return;

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
      // Auto-restart silently (continuous mode drops after ~60s of silence)
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

    // Connect pause/resume for echo prevention
    pauseRecognitionFn = () => {
      isSpeakingRef.current = true;
    };
    resumeRecognitionFn = () => {
      isSpeakingRef.current = false;
    };
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
          transcript: transcriptRef.current.slice(-2000),
          mode,
        }),
      });
      const data = await res.json();
      setLastSuggestion(data.text);
      if (data.text) suggestionsRef.current.push(data.text);

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

    const session: Session = {
      id: sessionIdRef.current,
      clientId: selectedClientId,
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
  }, [mode, stopListening, sessionTime, selectedClientId]);

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

  // ─── Manual sync ──────────────────────────────────────────
  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus("");
    try {
      const c = await syncClients();
      const s = await syncSessions();
      setClients(c);
      setRecentCount(s.length);
      setSyncStatus(`${c.length} client${c.length > 1 ? "s" : ""}, ${s.length} séance${s.length > 1 ? "s" : ""}`);
    } catch {
      setSyncStatus("Erreur de sync");
    } finally {
      setIsSyncing(false);
    }
  };

  // ─── Auto-start mic when session begins ─────────────────
  useEffect(() => {
    if (consentGiven && !isListening && !sessionSaved) {
      startListening();
    }
  }, [consentGiven]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Detect if PC (for QR code button) ──────────────────
  const isPC = typeof window !== "undefined" && !("ontouchstart" in window);

  // ─── Selected client name ────────────────────────────────
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  // ─── Consent screen ───────────────────────────────────────
  if (!consentGiven) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 gap-6">
        <img src="/icon.png" alt="JCoach" className="w-32 h-32 rounded-3xl" />

        {/* Client selector */}
        <div className="w-full max-w-xs">
          <label className="text-xs text-[#6B7280] uppercase tracking-wide mb-2 block">
            Client
          </label>
          {!showAddClient ? (
            <div className="flex flex-col gap-2">
              <select
                value={selectedClientId || ""}
                onChange={(e) => setSelectedClientId(e.target.value || null)}
                className="w-full bg-white/10 text-[#FAFAFA] rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-[#C9A84C]/50"
              >
                <option value="">— Sans client —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowAddClient(true)}
                className="text-xs text-[#C9A84C] py-1"
              >
                + Nouveau client
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addClient()}
                placeholder="Nom du client"
                autoFocus
                className="flex-1 bg-white/10 text-[#FAFAFA] rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-[#C9A84C]/50"
              />
              <button
                onClick={addClient}
                className="px-4 py-3 bg-[#C9A84C] text-black rounded-xl text-sm font-medium"
              >
                OK
              </button>
              <button
                onClick={() => { setShowAddClient(false); setNewClientName(""); }}
                className="px-3 py-3 bg-white/10 rounded-xl text-sm text-[#6B7280]"
              >
                ✕
              </button>
            </div>
          )}
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

        {/* Start button — lance le micro immédiatement */}
        <button
          onClick={() => {
            setConsentGiven(true);
            // Le micro démarre automatiquement via useEffect ci-dessous
          }}
          className="w-full max-w-xs py-4 bg-[#22C55E] text-black font-bold text-lg rounded-2xl active:scale-95 transition-transform"
        >
          Démarrer la séance
        </button>

        <p className="text-[#6B7280] text-xs text-center max-w-xs">
          En démarrant, vous confirmez le consentement du client pour la prise
          de notes assistée par IA.
        </p>

        {/* Sync + QR */}
        <div className="w-full max-w-xs flex flex-col gap-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full text-sm py-2.5 rounded-xl bg-white/5 text-[#C9A84C] active:bg-white/10 transition-colors disabled:opacity-50"
          >
            {isSyncing ? "⏳ Synchronisation..." : "🔄 Synchroniser"}
          </button>
          {syncStatus && (
            <p className="text-xs text-center text-[#22C55E]">✓ {syncStatus}</p>
          )}
          {isPC && (
            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full text-sm py-2.5 rounded-xl bg-white/5 text-[#6B7280] active:bg-white/10"
            >
              📱 {showQR ? "Masquer" : "QR Code mobile"}
            </button>
          )}
          {showQR && (
            <div className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://jcoach.netlify.app&color=C9A84C&bgcolor=0A0A0A"
                alt="QR Code"
                className="w-48 h-48 rounded-lg"
              />
              <p className="text-xs text-[#6B7280]">Scanne pour ouvrir sur le téléphone</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Session screen ────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col p-4 gap-4 pb-40">
      {/* Header — client + timer + status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: isListening ? "#22C55E" : "#EF4444",
              boxShadow: isListening ? "0 0 12px #22C55E" : "none",
            }}
          />
          <span className="text-sm font-medium text-[#FAFAFA]">
            {selectedClient ? selectedClient.name : "Séance en cours"}
          </span>
          <span className="text-xs text-[#6B7280]">
            {isListening ? "En écoute" : "Pause"}
          </span>
        </div>
        <span className="font-mono text-lg text-[#6B7280]">
          {formatTime(sessionTime)}
        </span>
      </div>

      {/* Transcript area */}
      <div className="flex-1 bg-white/5 rounded-2xl p-4 overflow-y-auto max-h-[40vh] text-sm leading-relaxed text-[#FAFAFA]/70">
        {transcript || (
          <span className="text-[#6B7280] italic">
            En écoute... parlez normalement
          </span>
        )}
      </div>

      {/* AI Suggestion */}
      {lastSuggestion && (
        <div className="rounded-2xl p-4 text-sm leading-relaxed border border-[#8B5CF6]/30 bg-[#8B5CF6]/10">
          <div className="text-xs font-bold uppercase mb-2 text-[#8B5CF6]">
            💡 Suggestion IA
          </div>
          <div className="whitespace-pre-wrap">{lastSuggestion}</div>
        </div>
      )}

      {/* Bottom controls — 3 boutons : Pause/Play, Aide IA, Fin */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent p-4 pt-8">
        <div className="flex items-center justify-center gap-5 max-w-md mx-auto">
          {/* PAUSE / REPRENDRE */}
          <button
            onClick={isListening ? stopListening : startListening}
            className="w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all active:scale-90 relative"
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
            <span className="text-2xl">{isListening ? "⏸" : "▶"}</span>
          </button>

          {/* AIDE IA — Le bouton central */}
          <button
            onClick={askAI}
            disabled={isAnalyzing || !transcript}
            className="w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all active:scale-90 disabled:opacity-30 relative bg-[#8B5CF6]"
            style={{
              boxShadow: "0 0 30px rgba(139, 92, 246, 0.25)",
            }}
          >
            {isAnalyzing ? (
              <span className="animate-spin text-2xl">⏳</span>
            ) : (
              <span className="text-3xl">💡</span>
            )}
          </button>

          {/* FIN DE SÉANCE */}
          <button
            onClick={() => {
              if (sessionSaved) {
                resetSession();
              } else if (transcript.trim()) {
                endSession();
              }
            }}
            className="w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all active:scale-90"
            style={{
              backgroundColor: sessionSaved ? "#22C55E" : "rgba(255,255,255,0.1)",
            }}
          >
            <span className="text-2xl">{sessionSaved ? "✓" : "⏹"}</span>
          </button>
        </div>

        {/* Labels sous les boutons */}
        <div className="flex items-center justify-center gap-5 max-w-md mx-auto mt-1">
          <span className="w-16 text-center text-[10px] text-[#6B7280]">
            {isListening ? "Pause" : "Reprendre"}
          </span>
          <span className="w-20 text-center text-[10px] text-[#8B5CF6]">
            {isAnalyzing ? "Analyse..." : "Aide"}
          </span>
          <span className="w-16 text-center text-[10px] text-[#6B7280]">
            {sessionSaved ? "Nouvelle" : "Terminer"}
          </span>
        </div>

        {/* Post-session link */}
        {sessionSaved && (
          <div className="flex justify-center mt-3">
            <a
              href={selectedClientId ? `/clients/${selectedClientId}` : "/historique"}
              className="text-xs text-[#22C55E] px-4 py-2 rounded-lg bg-[#22C55E]/10"
            >
              ✓ Sauvegardée — Voir {selectedClient ? selectedClient.name : "l'historique"}
            </a>
          </div>
        )}

        {/* Audio toggle discret */}
        <div className="flex justify-center mt-2">
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

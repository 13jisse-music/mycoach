"use client";

import { useState, useEffect } from "react";
import { getClient, saveClient, type Client } from "@/lib/clients";
import { getSessionsByClient, deleteSession, type Session } from "@/lib/sessions";
import { useParams } from "next/navigation";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h}h${(m % 60).toString().padStart(2, "0")}`;
}

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [bilan, setBilan] = useState("");
  const [isBilanLoading, setIsBilanLoading] = useState(false);
  const [hypnoScript, setHypnoScript] = useState("");
  const [isHypnoLoading, setIsHypnoLoading] = useState(false);
  const [showHypnoForm, setShowHypnoForm] = useState(false);
  const [hypnoTheme, setHypnoTheme] = useState("");

  useEffect(() => {
    const c = getClient(clientId);
    setClient(c);
    if (c) {
      setNotes(c.notes);
      setSessions(getSessionsByClient(clientId));
    }
  }, [clientId]);

  const saveNotes = () => {
    if (!client) return;
    const updated = { ...client, notes };
    saveClient(updated);
    setClient(updated);
    setEditingNotes(false);
  };

  const handleDeleteSession = (id: string) => {
    if (!confirm("Supprimer cette séance ?")) return;
    deleteSession(id);
    setSessions(getSessionsByClient(clientId));
  };

  // ─── Bilan IA croisé ─────────────────────────────────────
  const generateBilan = async () => {
    if (!client || sessions.length === 0) return;
    setIsBilanLoading(true);
    setBilan("");

    const summaries = sessions
      .filter((s) => s.summary)
      .map((s) => ({
        date: formatDate(s.date),
        summary: s.summary!,
      }));

    if (summaries.length === 0) {
      setBilan("Aucune séance avec résumé disponible. Terminez des séances pour obtenir un bilan.");
      setIsBilanLoading(false);
      return;
    }

    // Determine predominant mode
    const pnlCount = sessions.filter((s) => s.mode === "pnl").length;
    const mode = pnlCount > sessions.length / 2 ? "pnl" : "music";

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bilan",
          clientName: client.name,
          mode,
          summaries,
        }),
      });
      const data = await res.json();
      setBilan(data.text || "Erreur lors de la génération du bilan.");
    } catch {
      setBilan("Erreur de connexion.");
    } finally {
      setIsBilanLoading(false);
    }
  };

  const modeLabel = (m: string) =>
    m === "music" ? "🎵 Musique" : "📋 Rapport";
  const modeColor = () => "#8B5CF6";

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#6B7280]">
        Client introuvable
      </div>
    );
  }

  const totalDuration = sessions.reduce((acc, s) => acc + s.duration, 0);
  const totalMinutes = Math.floor(totalDuration / 60);

  return (
    <div className="min-h-screen p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <a href="/clients" className="text-[#6B7280] text-sm">← Clients</a>
        <h1 className="text-lg font-bold">{client.name}</h1>
        <span className="text-[#6B7280] text-sm">
          {sessions.length} séance{sessions.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-[#C9A84C]">{sessions.length}</div>
          <div className="text-[10px] text-[#6B7280] uppercase">Séances</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-[#C9A84C]">{totalMinutes}</div>
          <div className="text-[10px] text-[#6B7280] uppercase">Minutes</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-[#8B5CF6]">
            {sessions.filter((s) => s.mode === "pnl").length}
          </div>
          <div className="text-[10px] text-[#6B7280] uppercase">Rapports</div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white/5 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#6B7280] uppercase font-bold">Notes</span>
          {editingNotes ? (
            <button onClick={saveNotes} className="text-xs text-[#22C55E]">Sauver</button>
          ) : (
            <button onClick={() => setEditingNotes(true)} className="text-xs text-[#C9A84C]">Modifier</button>
          )}
        </div>
        {editingNotes ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-white/5 text-sm text-[#FAFAFA]/80 rounded-lg p-2 border border-white/10 focus:outline-none focus:border-[#C9A84C]/50 resize-none"
            placeholder="Notes sur le client..."
          />
        ) : (
          <p className="text-sm text-[#FAFAFA]/60">
            {client.notes || "Aucune note"}
          </p>
        )}
      </div>

      {/* Bilan IA */}
      <div className="mb-6">
        <button
          onClick={generateBilan}
          disabled={isBilanLoading || sessions.length === 0}
          className="w-full py-3 bg-gradient-to-r from-[#C9A84C]/20 to-[#8B5CF6]/20 border border-[#C9A84C]/30 rounded-2xl text-sm font-medium text-[#C9A84C] disabled:opacity-30 active:scale-[0.98] transition-transform"
        >
          {isBilanLoading ? "⏳ Analyse en cours..." : "🔍 Générer un bilan IA global"}
        </button>

        {bilan && (
          <div className="mt-3 bg-white/5 rounded-2xl p-4 border border-[#C9A84C]/20">
            <div className="text-xs font-bold uppercase mb-2 text-[#C9A84C]">
              🔍 Bilan global — {client.name}
            </div>
            <div className="text-sm text-[#FAFAFA]/80 whitespace-pre-wrap leading-relaxed">
              {bilan}
            </div>
          </div>
        )}
      </div>

      {/* Script d'hypnose personnalisé */}
      <div className="mb-6">
        {!showHypnoForm ? (
          <button
            onClick={() => setShowHypnoForm(true)}
            disabled={sessions.length === 0}
            className="w-full py-3 bg-gradient-to-r from-[#8B5CF6]/20 to-[#C9A84C]/20 border border-[#8B5CF6]/30 rounded-2xl text-sm font-medium text-[#8B5CF6] disabled:opacity-30 active:scale-[0.98] transition-transform"
          >
            🎭 Créer un script d&apos;hypnose personnalisé
          </button>
        ) : (
          <div className="bg-white/5 rounded-2xl p-4 border border-[#8B5CF6]/20">
            <div className="text-xs font-bold uppercase mb-3 text-[#8B5CF6]">
              🎭 Script d&apos;hypnose — {client.name}
            </div>
            <label className="text-[10px] text-[#6B7280] uppercase block mb-1">
              Thème / Objectif de la séance
            </label>
            <input
              type="text"
              value={hypnoTheme}
              onChange={(e) => setHypnoTheme(e.target.value)}
              placeholder="Ex: confiance en soi, gestion du stress, lâcher prise..."
              className="w-full bg-white/5 text-sm text-[#FAFAFA]/80 rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:border-[#8B5CF6]/50 mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowHypnoForm(false); setHypnoTheme(""); }}
                className="flex-1 py-2.5 rounded-xl bg-white/5 text-[#6B7280] text-sm"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  if (!hypnoTheme.trim()) return;
                  setIsHypnoLoading(true);
                  setHypnoScript("");

                  // Extract keywords from transcripts
                  const allTranscripts = sessions
                    .map((s) => s.transcript)
                    .filter(Boolean)
                    .join(" ");
                  // Simple keyword extraction: frequent meaningful words
                  const words = allTranscripts.toLowerCase().split(/\s+/);
                  const stopWords = new Set(["je", "tu", "il", "elle", "on", "nous", "vous", "ils", "de", "la", "le", "les", "un", "une", "des", "et", "ou", "mais", "que", "qui", "ce", "ça", "est", "a", "ai", "as", "en", "dans", "sur", "pour", "par", "avec", "pas", "ne", "plus", "très", "bien", "fait", "être", "avoir", "faire", "dire", "cette", "son", "sa", "ses", "mon", "ma", "mes", "ton", "ta", "tes", "du", "au", "aux", "se", "si", "tout", "comme", "quand", "aussi", "même"]);
                  const freq: Record<string, number> = {};
                  words.forEach((w) => {
                    if (w.length > 3 && !stopWords.has(w)) {
                      freq[w] = (freq[w] || 0) + 1;
                    }
                  });
                  const keywords = Object.entries(freq)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 20)
                    .map(([w]) => w);

                  const transcriptExcerpts = sessions
                    .filter((s) => s.transcript)
                    .slice(0, 3)
                    .map((s) => s.transcript.slice(0, 500))
                    .join("\n---\n");

                  try {
                    const res = await fetch("/api/analyze", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "hypno-script",
                        clientName: client.name,
                        keywords,
                        theme: hypnoTheme,
                        transcripts: transcriptExcerpts,
                      }),
                    });
                    const data = await res.json();
                    setHypnoScript(data.text || "Erreur lors de la génération.");
                  } catch {
                    setHypnoScript("Erreur de connexion.");
                  } finally {
                    setIsHypnoLoading(false);
                  }
                }}
                disabled={isHypnoLoading || !hypnoTheme.trim()}
                className="flex-1 py-2.5 rounded-xl bg-[#8B5CF6] text-white text-sm font-medium disabled:opacity-30"
              >
                {isHypnoLoading ? "⏳ Génération..." : "Générer le script"}
              </button>
            </div>
          </div>
        )}

        {hypnoScript && (
          <div className="mt-3 bg-white/5 rounded-2xl p-4 border border-[#8B5CF6]/20">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold uppercase text-[#8B5CF6]">
                🎭 Script — {hypnoTheme}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(hypnoScript);
                }}
                className="text-[10px] text-[#6B7280] px-2 py-1 rounded bg-white/5"
              >
                Copier
              </button>
            </div>
            <div className="text-sm text-[#FAFAFA]/80 whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto">
              {hypnoScript}
            </div>
          </div>
        )}
      </div>

      {/* Sessions list */}
      <div className="mb-4">
        <span className="text-xs text-[#6B7280] uppercase font-bold">
          Historique des séances
        </span>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center text-[#6B7280] mt-8">
          <p>Aucune séance enregistrée</p>
          <a href="/" className="text-sm text-[#C9A84C] underline mt-2 inline-block">
            Démarrer une séance
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((s) => (
            <div key={s.id} className="bg-white/5 rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                className="w-full p-4 flex items-center gap-3 text-left"
              >
                <div
                  className="w-2 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: modeColor() }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{modeLabel(s.mode)}</span>
                    <span className="text-xs text-[#6B7280]">{formatDuration(s.duration)}</span>
                  </div>
                  <div className="text-xs text-[#6B7280] mt-0.5">{formatDate(s.date)}</div>
                  {s.summary && (
                    <p className="text-xs text-[#FAFAFA]/60 mt-1 line-clamp-2">
                      {s.summary.slice(0, 120)}...
                    </p>
                  )}
                </div>
                <span className="text-[#6B7280] text-lg">
                  {expandedId === s.id ? "▲" : "▼"}
                </span>
              </button>

              {expandedId === s.id && (
                <div className="px-4 pb-4 border-t border-white/5">
                  {s.summary && (
                    <div className="mt-3">
                      <div className="text-xs font-bold uppercase mb-1.5" style={{ color: modeColor() }}>
                        📝 Résumé
                      </div>
                      <div className="text-sm text-[#FAFAFA]/80 whitespace-pre-wrap leading-relaxed">
                        {s.summary}
                      </div>
                    </div>
                  )}

                  {s.suggestions.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs font-bold uppercase mb-1.5" style={{ color: modeColor() }}>
                        💡 Suggestions ({s.suggestions.length})
                      </div>
                      <div className="flex flex-col gap-2">
                        {s.suggestions.map((sg, i) => (
                          <div key={i} className="text-xs text-[#FAFAFA]/60 bg-white/5 rounded-lg p-2">
                            {sg}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {s.transcript && (
                    <details className="mt-4">
                      <summary className="text-xs text-[#6B7280] cursor-pointer">
                        Transcription ({s.transcript.split(" ").length} mots)
                      </summary>
                      <div className="mt-2 text-xs text-[#FAFAFA]/40 max-h-40 overflow-y-auto leading-relaxed">
                        {s.transcript}
                      </div>
                    </details>
                  )}

                  <button
                    onClick={() => handleDeleteSession(s.id)}
                    className="mt-4 text-xs text-red-400/60 hover:text-red-400"
                  >
                    Supprimer cette séance
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

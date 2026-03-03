"use client";

import { useState, useEffect } from "react";
import { getSessions, deleteSession, type Session } from "@/lib/sessions";

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

export default function HistoriquePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer cette séance ?")) return;
    deleteSession(id);
    setSessions(getSessions());
  };

  const modeLabel = (m: string) =>
    m === "pnl" ? "🧠 Dev. perso" : "🎵 Musique";
  const modeColor = (m: string) =>
    m === "pnl" ? "#8B5CF6" : "#C9A84C";

  return (
    <div className="min-h-screen p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <a href="/" className="text-[#6B7280] text-sm">← Retour</a>
        <h1 className="text-lg font-bold">Historique</h1>
        <span className="text-[#6B7280] text-sm">
          {sessions.length} séance{sessions.length > 1 ? "s" : ""}
        </span>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 gap-4 text-[#6B7280]">
          <div className="text-5xl">📋</div>
          <p>Aucune séance enregistrée</p>
          <a
            href="/"
            className="px-6 py-3 bg-[#C9A84C] text-black font-medium rounded-xl"
          >
            Démarrer une séance
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((s) => (
            <div key={s.id} className="bg-white/5 rounded-2xl overflow-hidden">
              {/* Card header */}
              <button
                onClick={() =>
                  setExpandedId(expandedId === s.id ? null : s.id)
                }
                className="w-full p-4 flex items-center gap-3 text-left"
              >
                <div
                  className="w-2 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: modeColor(s.mode) }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {modeLabel(s.mode)}
                    </span>
                    <span className="text-xs text-[#6B7280]">
                      {formatDuration(s.duration)}
                    </span>
                  </div>
                  <div className="text-xs text-[#6B7280] mt-0.5">
                    {formatDate(s.date)}
                  </div>
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

              {/* Expanded detail */}
              {expandedId === s.id && (
                <div className="px-4 pb-4 border-t border-white/5">
                  {/* Summary */}
                  {s.summary && (
                    <div className="mt-3">
                      <div
                        className="text-xs font-bold uppercase mb-1.5"
                        style={{ color: modeColor(s.mode) }}
                      >
                        📝 Résumé
                      </div>
                      <div className="text-sm text-[#FAFAFA]/80 whitespace-pre-wrap leading-relaxed">
                        {s.summary}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {s.suggestions.length > 0 && (
                    <div className="mt-4">
                      <div
                        className="text-xs font-bold uppercase mb-1.5"
                        style={{ color: modeColor(s.mode) }}
                      >
                        💡 Suggestions ({s.suggestions.length})
                      </div>
                      <div className="flex flex-col gap-2">
                        {s.suggestions.map((sg, i) => (
                          <div
                            key={i}
                            className="text-xs text-[#FAFAFA]/60 bg-white/5 rounded-lg p-2"
                          >
                            {sg}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Transcript (collapsible) */}
                  {s.transcript && (
                    <details className="mt-4">
                      <summary className="text-xs text-[#6B7280] cursor-pointer">
                        Transcription complète (
                        {s.transcript.split(" ").length} mots)
                      </summary>
                      <div className="mt-2 text-xs text-[#FAFAFA]/40 max-h-40 overflow-y-auto leading-relaxed">
                        {s.transcript}
                      </div>
                    </details>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(s.id)}
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

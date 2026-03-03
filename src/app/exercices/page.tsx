"use client";

import { useState } from "react";
import {
  EXERCISES,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type ExerciseCategory,
} from "@/lib/exercises";

const DIFFICULTY_LABELS = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};

export default function ExercicesPage() {
  const [filter, setFilter] = useState<ExerciseCategory | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = EXERCISES.filter((ex) => {
    if (filter !== "all" && ex.category !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        ex.title.toLowerCase().includes(q) ||
        ex.summary.toLowerCase().includes(q) ||
        ex.keywords?.some((k) => k.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const categories: (ExerciseCategory | "all")[] = ["all", "pnl", "hypnose", "dev"];

  return (
    <div className="min-h-screen p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <a href="/" className="text-[#6B7280] text-sm">← Accueil</a>
        <h1 className="text-lg font-bold">Exercices</h1>
        <span className="text-[#6B7280] text-sm">{filtered.length}</span>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un exercice..."
        className="w-full bg-white/5 text-[#FAFAFA] rounded-xl px-4 py-2.5 text-sm border border-white/10 mb-3 focus:outline-none focus:border-[#C9A84C]/50"
      />

      {/* Category filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
            style={{
              backgroundColor:
                filter === cat
                  ? cat === "all"
                    ? "rgba(255,255,255,0.15)"
                    : CATEGORY_COLORS[cat] + "30"
                  : "rgba(255,255,255,0.05)",
              color:
                filter === cat
                  ? cat === "all"
                    ? "#FAFAFA"
                    : CATEGORY_COLORS[cat]
                  : "#6B7280",
            }}
          >
            {cat === "all" ? "Tous" : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Exercise list */}
      {filtered.length === 0 ? (
        <div className="text-center text-[#6B7280] mt-12">
          <div className="text-4xl mb-3">🔍</div>
          <p>Aucun exercice trouvé</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((ex) => {
            const isExpanded = expandedId === ex.id;
            const showDetail = detailId === ex.id;
            const color = CATEGORY_COLORS[ex.category];

            return (
              <div
                key={ex.id}
                className="bg-white/5 rounded-2xl overflow-hidden border border-white/5"
              >
                {/* Card header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : ex.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-1.5 h-12 rounded-full flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium text-[#FAFAFA]">
                          {ex.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                          style={{
                            backgroundColor: color + "20",
                            color: color,
                          }}
                        >
                          {CATEGORY_LABELS[ex.category]}
                        </span>
                        <span className="text-[10px] text-[#6B7280]">
                          {ex.duration}
                        </span>
                        <span className="text-[10px] text-[#6B7280]">
                          {DIFFICULTY_LABELS[ex.difficulty]}
                        </span>
                      </div>
                      <p className="text-xs text-[#FAFAFA]/60 line-clamp-2">
                        {ex.summary}
                      </p>
                    </div>
                    <span className="text-[#6B7280] text-sm mt-1">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </button>

                {/* Steps (expanded) */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-white/5">
                    <div className="mt-3 mb-2">
                      <div
                        className="text-xs font-bold uppercase mb-2"
                        style={{ color }}
                      >
                        Étapes
                      </div>
                      <ol className="flex flex-col gap-2">
                        {ex.steps.map((step, i) => (
                          <li key={i} className="flex gap-2.5 text-sm">
                            <span
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                              style={{
                                backgroundColor: color + "20",
                                color: color,
                              }}
                            >
                              {i + 1}
                            </span>
                            <span className="text-[#FAFAFA]/80 leading-relaxed">
                              {step}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Pour aller plus loin */}
                    <button
                      onClick={() => setDetailId(showDetail ? null : ex.id)}
                      className="mt-3 w-full text-left text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: showDetail ? color + "15" : "rgba(255,255,255,0.05)",
                        color: showDetail ? color : "#6B7280",
                      }}
                    >
                      {showDetail ? "▲ Masquer les détails" : "📚 Pour aller plus loin →"}
                    </button>

                    {showDetail && (
                      <div className="mt-3 text-sm text-[#FAFAFA]/70 leading-relaxed whitespace-pre-wrap bg-white/[0.03] rounded-xl p-4 border border-white/5">
                        {ex.detail}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";

const MENU_ITEMS = [
  { href: "/", icon: "🏠", label: "Accueil" },
  { href: "/clients", icon: "👥", label: "Mes clients" },
  { href: "/historique", icon: "📋", label: "Rapports" },
  { href: "/exercices", icon: "📚", label: "Exercices" },
  { href: "/agenda", icon: "📅", label: "Agenda" },
];

export default function AppMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 z-40 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg active:bg-white/20 transition-colors backdrop-blur-sm"
        aria-label="Menu"
      >
        ☰
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          {/* Drawer */}
          <div
            className="absolute right-0 top-0 h-full w-72 bg-[#111] border-l border-white/10 p-6 flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-[#6B7280]">Menu</span>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm text-[#6B7280]"
              >
                ✕
              </button>
            </div>

            {/* Items */}
            {MENU_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-[#FAFAFA] hover:bg-white/5 active:bg-white/10 transition-colors"
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}

            {/* Footer */}
            <div className="mt-auto pt-4 border-t border-white/10">
              <p className="text-[10px] text-[#6B7280] text-center">
                JCoach — JC Martinez
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

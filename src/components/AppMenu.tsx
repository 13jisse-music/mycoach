"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const MENU_ITEMS = [
  { href: "/", icon: "🏠", label: "Accueil" },
  { href: "/clients", icon: "👥", label: "Mes clients" },
  { href: "/historique", icon: "📋", label: "Rapports" },
  { href: "/exercices", icon: "📚", label: "Exercices" },
  { href: "/agenda", icon: "📅", label: "Agenda" },
];

export default function AppMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop: permanent left sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-56 bg-[#111] border-r border-white/10 flex-col p-4 z-30">
        <div className="flex items-center gap-2 mb-6 px-2">
          <img src="/icon.png" alt="JCoach" className="w-8 h-8 rounded-lg" />
          <span className="text-sm font-bold text-[#FAFAFA]">JCoach</span>
        </div>

        {MENU_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors mb-1 ${
                active
                  ? "bg-[#C9A84C]/20 text-[#C9A84C]"
                  : "text-[#FAFAFA]/70 hover:bg-white/5"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          );
        })}

        <div className="mt-auto pt-4 border-t border-white/10">
          <p className="text-[10px] text-[#6B7280] text-center">
            JCoach — JC Martinez
          </p>
        </div>
      </aside>

      {/* Mobile: hamburger button (top-left, no overlap) */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-base active:bg-white/20 transition-colors backdrop-blur-sm"
        aria-label="Menu"
      >
        ☰
      </button>

      {/* Mobile: drawer from left */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-64 bg-[#111] border-r border-white/10 p-6 flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <img src="/icon.png" alt="JCoach" className="w-7 h-7 rounded-lg" />
                <span className="text-sm font-bold">JCoach</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm text-[#6B7280]"
              >
                ✕
              </button>
            </div>

            {MENU_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors ${
                    active
                      ? "bg-[#C9A84C]/20 text-[#C9A84C]"
                      : "text-[#FAFAFA] hover:bg-white/5 active:bg-white/10"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              );
            })}

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

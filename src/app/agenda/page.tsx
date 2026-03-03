"use client";

import { useState, useEffect } from "react";
import { getClients, type Client } from "@/lib/clients";

interface Appointment {
  id: string;
  clientId: string | null;
  clientName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  notes: string;
}

const STORAGE_KEY = "coach_appointments";

function getAppointments(): Appointment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAppointments(appts: Appointment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appts));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.getTime() === today.getTime()) return "Aujourd'hui";
  if (d.getTime() === tomorrow.getTime()) return "Demain";

  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function getWeekDates(offset: number): string[] {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1 + offset * 7);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formClientId, setFormClientId] = useState<string>("");
  const [formDate, setFormDate] = useState(selectedDate);
  const [formTime, setFormTime] = useState("10:00");
  const [formDuration, setFormDuration] = useState(60);
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    setAppointments(getAppointments());
    setClients(getClients());
  }, []);

  const weekDates = getWeekDates(weekOffset);
  const today = new Date().toISOString().split("T")[0];

  const dayAppointments = appointments
    .filter((a) => a.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const resetForm = () => {
    setFormClientId("");
    setFormDate(selectedDate);
    setFormTime("10:00");
    setFormDuration(60);
    setFormNotes("");
    setEditingId(null);
  };

  const openNewForm = () => {
    resetForm();
    setFormDate(selectedDate);
    setShowForm(true);
  };

  const openEditForm = (appt: Appointment) => {
    setFormClientId(appt.clientId || "");
    setFormDate(appt.date);
    setFormTime(appt.time);
    setFormDuration(appt.duration);
    setFormNotes(appt.notes);
    setEditingId(appt.id);
    setShowForm(true);
  };

  const saveAppointment = () => {
    const client = clients.find((c) => c.id === formClientId);
    const appt: Appointment = {
      id: editingId || generateId(),
      clientId: formClientId || null,
      clientName: client?.name || formNotes.split("\n")[0] || "RDV",
      date: formDate,
      time: formTime,
      duration: formDuration,
      notes: formNotes,
    };

    let updated: Appointment[];
    if (editingId) {
      updated = appointments.map((a) => (a.id === editingId ? appt : a));
    } else {
      updated = [...appointments, appt];
    }
    updated.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    saveAppointments(updated);
    setAppointments(updated);
    setShowForm(false);
    resetForm();
  };

  const deleteAppointment = (id: string) => {
    if (!confirm("Supprimer ce rendez-vous ?")) return;
    const updated = appointments.filter((a) => a.id !== id);
    saveAppointments(updated);
    setAppointments(updated);
  };

  // Count appointments per day for the week view dots
  const countForDate = (date: string) =>
    appointments.filter((a) => a.date === date).length;

  return (
    <div className="min-h-screen p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <a href="/" className="text-[#6B7280] text-sm">← Accueil</a>
        <h1 className="text-lg font-bold">Agenda</h1>
        <button
          onClick={openNewForm}
          className="text-sm px-3 py-1.5 rounded-lg bg-[#C9A84C] text-black font-medium"
        >
          + RDV
        </button>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setWeekOffset((w) => w - 1)}
          className="text-[#6B7280] px-2 py-1 text-sm"
        >
          ← Sem. préc.
        </button>
        <button
          onClick={() => setWeekOffset(0)}
          className="text-xs text-[#C9A84C] px-2 py-1"
        >
          Aujourd&apos;hui
        </button>
        <button
          onClick={() => setWeekOffset((w) => w + 1)}
          className="text-[#6B7280] px-2 py-1 text-sm"
        >
          Sem. suiv. →
        </button>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDates.map((date, i) => {
          const count = countForDate(date);
          const isToday = date === today;
          const isSelected = date === selectedDate;
          const dayNum = new Date(date + "T00:00:00").getDate();

          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className="flex flex-col items-center py-2 rounded-xl transition-all"
              style={{
                backgroundColor: isSelected
                  ? "#C9A84C"
                  : isToday
                    ? "rgba(201, 168, 76, 0.15)"
                    : "rgba(255,255,255,0.03)",
                color: isSelected ? "#000" : "#FAFAFA",
              }}
            >
              <span className="text-[10px] text-[#6B7280]" style={{ color: isSelected ? "#000" : undefined }}>
                {DAY_NAMES[i]}
              </span>
              <span className="text-sm font-medium">{dayNum}</span>
              {count > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                    <div
                      key={j}
                      className="w-1 h-1 rounded-full"
                      style={{
                        backgroundColor: isSelected ? "#000" : "#C9A84C",
                      }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Day label */}
      <div className="text-sm font-medium text-[#FAFAFA] mb-3 capitalize">
        {formatDateLabel(selectedDate)}
      </div>

      {/* Day appointments */}
      {dayAppointments.length === 0 ? (
        <div className="text-center text-[#6B7280] mt-8">
          <div className="text-3xl mb-2">📅</div>
          <p className="text-sm">Aucun rendez-vous</p>
          <button
            onClick={openNewForm}
            className="mt-3 text-sm text-[#C9A84C] underline"
          >
            Ajouter un RDV
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {dayAppointments.map((appt) => (
            <div
              key={appt.id}
              className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5"
            >
              <div className="text-center">
                <div className="text-sm font-mono font-medium text-[#C9A84C]">
                  {appt.time}
                </div>
                <div className="text-[10px] text-[#6B7280]">
                  {appt.duration} min
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#FAFAFA] truncate">
                  {appt.clientName}
                </div>
                {appt.notes && (
                  <p className="text-xs text-[#6B7280] truncate">{appt.notes}</p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEditForm(appt)}
                  className="text-xs text-[#6B7280] px-2 py-1 rounded bg-white/5"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteAppointment(appt.id)}
                  className="text-xs text-red-400/60 px-2 py-1 rounded bg-white/5"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming this week */}
      {(() => {
        const upcoming = appointments
          .filter((a) => a.date >= today && a.date !== selectedDate)
          .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
          .slice(0, 5);
        if (upcoming.length === 0) return null;
        return (
          <div className="mt-6">
            <div className="text-xs text-[#6B7280] uppercase font-bold mb-2">
              Prochains RDV
            </div>
            <div className="flex flex-col gap-1.5">
              {upcoming.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center gap-2 text-xs text-[#FAFAFA]/60 bg-white/[0.03] rounded-lg px-3 py-2"
                >
                  <span className="text-[#C9A84C] font-mono">
                    {new Date(appt.date + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })}
                  </span>
                  <span className="text-[#6B7280]">{appt.time}</span>
                  <span className="truncate">{appt.clientName}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Form modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center"
          onClick={() => { setShowForm(false); resetForm(); }}
        >
          <div
            className="w-full max-w-md bg-[#111] rounded-t-3xl p-6 border-t border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-bold mb-4">
              {editingId ? "Modifier le RDV" : "Nouveau RDV"}
            </h2>

            {/* Client */}
            <label className="text-[10px] text-[#6B7280] uppercase block mb-1">Client</label>
            <select
              value={formClientId}
              onChange={(e) => setFormClientId(e.target.value)}
              className="w-full bg-white/5 text-[#FAFAFA] rounded-xl px-3 py-2.5 text-sm border border-white/10 mb-3 focus:outline-none"
            >
              <option value="">— Autre —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Date + Time */}
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <label className="text-[10px] text-[#6B7280] uppercase block mb-1">Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full bg-white/5 text-[#FAFAFA] rounded-xl px-3 py-2.5 text-sm border border-white/10 focus:outline-none"
                />
              </div>
              <div className="w-24">
                <label className="text-[10px] text-[#6B7280] uppercase block mb-1">Heure</label>
                <input
                  type="time"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="w-full bg-white/5 text-[#FAFAFA] rounded-xl px-3 py-2.5 text-sm border border-white/10 focus:outline-none"
                />
              </div>
              <div className="w-20">
                <label className="text-[10px] text-[#6B7280] uppercase block mb-1">Durée</label>
                <select
                  value={formDuration}
                  onChange={(e) => setFormDuration(Number(e.target.value))}
                  className="w-full bg-white/5 text-[#FAFAFA] rounded-xl px-2 py-2.5 text-sm border border-white/10 focus:outline-none"
                >
                  <option value={30}>30m</option>
                  <option value={45}>45m</option>
                  <option value={60}>1h</option>
                  <option value={90}>1h30</option>
                  <option value={120}>2h</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <label className="text-[10px] text-[#6B7280] uppercase block mb-1">Notes</label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              rows={2}
              placeholder="Objectif de la séance..."
              className="w-full bg-white/5 text-[#FAFAFA] rounded-xl px-3 py-2.5 text-sm border border-white/10 mb-4 resize-none focus:outline-none"
            />

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                className="flex-1 py-3 rounded-xl bg-white/5 text-[#6B7280] text-sm"
              >
                Annuler
              </button>
              <button
                onClick={saveAppointment}
                className="flex-1 py-3 rounded-xl bg-[#C9A84C] text-black text-sm font-medium"
              >
                {editingId ? "Modifier" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

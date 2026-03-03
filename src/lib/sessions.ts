// Gestion des séances en localStorage (migration Supabase plus tard)

export interface Session {
  id: string;
  mode: "music" | "pnl";
  date: string; // ISO
  duration: number; // seconds
  transcript: string;
  summary: string | null;
  suggestions: string[]; // toutes les suggestions IA de la séance
}

const STORAGE_KEY = "coach_sessions";

export function getSessions(): Session[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSession(session: Session): void {
  const sessions = getSessions();
  sessions.unshift(session); // Plus récent en premier
  // Garder max 100 séances
  if (sessions.length > 100) sessions.length = 100;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function getSession(id: string): Session | null {
  return getSessions().find((s) => s.id === id) || null;
}

export function deleteSession(id: string): void {
  const sessions = getSessions().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

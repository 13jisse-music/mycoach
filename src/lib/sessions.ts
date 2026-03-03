// Gestion des séances — localStorage (offline) + Supabase (sync)

export interface Session {
  id: string;
  clientId: string | null;
  mode: "music" | "pnl";
  date: string; // ISO
  duration: number; // seconds
  transcript: string;
  summary: string | null;
  suggestions: string[];
}

const STORAGE_KEY = "coach_sessions";

// ─── localStorage (lecture instantanée) ────────────────────
export function getSessions(): Session[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getSessionsByClient(clientId: string): Session[] {
  return getSessions().filter((s) => s.clientId === clientId);
}

export function getSession(id: string): Session | null {
  return getSessions().find((s) => s.id === id) || null;
}

// ─── Save (localStorage + Supabase) ───────────────────────
export function saveSession(session: Session): void {
  const sessions = getSessions();
  sessions.unshift(session);
  if (sessions.length > 100) sessions.length = 100;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));

  // Sync to Supabase (fire & forget)
  fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session),
  }).catch(() => {});
}

export function deleteSession(id: string): void {
  const sessions = getSessions().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));

  fetch("/api/sessions", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  }).catch(() => {});
}

// ─── Sync from Supabase (pull remote data to localStorage) ─
export async function syncSessions(): Promise<Session[]> {
  try {
    const res = await fetch("/api/sessions");
    if (!res.ok) return getSessions();
    const remote: Session[] = await res.json();

    // Merge: remote wins for existing, add local-only ones
    const local = getSessions();
    const remoteIds = new Set(remote.map((s) => s.id));
    const localOnly = local.filter((s) => !remoteIds.has(s.id));

    // Push local-only to Supabase
    for (const s of localOnly) {
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      }).catch(() => {});
    }

    const merged = [...remote, ...localOnly].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    if (merged.length > 100) merged.length = 100;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return getSessions();
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

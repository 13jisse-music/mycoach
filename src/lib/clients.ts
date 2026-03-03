// Gestion des clients — localStorage (offline) + Supabase (sync)

export interface Client {
  id: string;
  name: string;
  notes: string;
  createdAt: string; // ISO
}

const STORAGE_KEY = "coach_clients";

// ─── localStorage (lecture instantanée) ────────────────────
export function getClients(): Client[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getClient(id: string): Client | null {
  return getClients().find((c) => c.id === id) || null;
}

// ─── Save (localStorage + Supabase) ───────────────────────
export function saveClient(client: Client): void {
  const clients = getClients();
  const idx = clients.findIndex((c) => c.id === client.id);
  if (idx >= 0) {
    clients[idx] = client;
  } else {
    clients.push(client);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));

  // Sync to Supabase (fire & forget)
  fetch("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(client),
  }).catch(() => {});
}

export function deleteClient(id: string): void {
  const clients = getClients().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));

  fetch("/api/clients", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  }).catch(() => {});
}

// ─── Sync from Supabase (pull remote data to localStorage) ─
export async function syncClients(): Promise<Client[]> {
  try {
    const res = await fetch("/api/clients");
    if (!res.ok) return getClients();
    const remote: Array<{
      id: string;
      name: string;
      notes: string;
      created_at: string;
    }> = await res.json();
    const clients: Client[] = remote.map((r) => ({
      id: r.id,
      name: r.name,
      notes: r.notes || "",
      createdAt: r.created_at,
    }));

    // Merge: remote wins for existing, add local-only ones
    const local = getClients();
    const remoteIds = new Set(clients.map((c) => c.id));
    const localOnly = local.filter((c) => !remoteIds.has(c.id));

    // Push local-only to Supabase
    for (const c of localOnly) {
      fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c),
      }).catch(() => {});
    }

    const merged = [...clients, ...localOnly];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return getClients();
  }
}

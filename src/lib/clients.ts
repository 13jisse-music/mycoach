// Gestion des clients en localStorage (migration Supabase plus tard)

export interface Client {
  id: string;
  name: string;
  notes: string; // notes libres sur le client
  createdAt: string; // ISO
}

const STORAGE_KEY = "coach_clients";

export function getClients(): Client[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveClient(client: Client): void {
  const clients = getClients();
  const idx = clients.findIndex((c) => c.id === client.id);
  if (idx >= 0) {
    clients[idx] = client;
  } else {
    clients.push(client);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

export function getClient(id: string): Client | null {
  return getClients().find((c) => c.id === id) || null;
}

export function deleteClient(id: string): void {
  const clients = getClients().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

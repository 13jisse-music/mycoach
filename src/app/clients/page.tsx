"use client";

import { useState, useEffect } from "react";
import { getClients, saveClient, deleteClient, type Client } from "@/lib/clients";
import { getSessionsByClient } from "@/lib/sessions";
import { generateId } from "@/lib/sessions";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [sessionCounts, setSessionCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const c = getClients();
    setClients(c);
    const counts: Record<string, number> = {};
    c.forEach((client) => {
      counts[client.id] = getSessionsByClient(client.id).length;
    });
    setSessionCounts(counts);
  }, []);

  const addClient = () => {
    if (!newName.trim()) return;
    const client: Client = {
      id: generateId(),
      name: newName.trim(),
      notes: "",
      createdAt: new Date().toISOString(),
    };
    saveClient(client);
    setClients(getClients());
    setSessionCounts((prev) => ({ ...prev, [client.id]: 0 }));
    setNewName("");
    setShowAdd(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Supprimer le client "${name}" ? Les séances seront conservées.`)) return;
    deleteClient(id);
    setClients(getClients());
  };

  return (
    <div className="min-h-screen p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <a href="/" className="text-[#6B7280] text-sm">← Retour</a>
        <h1 className="text-lg font-bold">Clients</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="text-sm text-[#C9A84C] font-medium"
        >
          + Nouveau
        </button>
      </div>

      {/* Add client form */}
      {showAdd && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addClient()}
            placeholder="Nom du client"
            autoFocus
            className="flex-1 bg-white/10 text-[#FAFAFA] rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:border-[#C9A84C]/50"
          />
          <button
            onClick={addClient}
            className="px-4 py-3 bg-[#C9A84C] text-black rounded-xl text-sm font-medium"
          >
            OK
          </button>
          <button
            onClick={() => { setShowAdd(false); setNewName(""); }}
            className="px-3 py-3 bg-white/10 rounded-xl text-sm text-[#6B7280]"
          >
            ✕
          </button>
        </div>
      )}

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 gap-4 text-[#6B7280]">
          <div className="text-5xl">👥</div>
          <p>Aucun client enregistré</p>
          <button
            onClick={() => setShowAdd(true)}
            className="px-6 py-3 bg-[#C9A84C] text-black font-medium rounded-xl"
          >
            Ajouter un client
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {clients.map((c) => (
            <a
              key={c.id}
              href={`/clients/${c.id}`}
              className="bg-white/5 rounded-2xl p-4 flex items-center gap-3 active:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-lg font-bold text-[#C9A84C]">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{c.name}</div>
                <div className="text-xs text-[#6B7280]">
                  {sessionCounts[c.id] || 0} séance{(sessionCounts[c.id] || 0) > 1 ? "s" : ""}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete(c.id, c.name);
                }}
                className="text-xs text-red-400/40 hover:text-red-400 px-2 py-1"
              >
                ✕
              </button>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

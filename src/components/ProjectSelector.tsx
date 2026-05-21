"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";

type ProjectSelectorProps = {
  projects: Project[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
  disabled?: boolean;
  onQuickCreate?: (name: string, clientName: string) => Promise<Project | null>;
};

export default function ProjectSelector({
  projects,
  selectedId,
  onChange,
  disabled,
  onQuickCreate,
}: ProjectSelectorProps) {
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newClient, setNewClient] = useState("");
  const [creating, setCreating] = useState(false);

  const selected = projects.find((p) => p.id === selectedId);

  const handleQuickCreate = async () => {
    if (!newName.trim() || !onQuickCreate) return;
    setCreating(true);
    const project = await onQuickCreate(newName.trim(), newClient.trim());
    if (project) {
      onChange(project.id);
      setNewName("");
      setNewClient("");
      setShowQuickCreate(false);
    }
    setCreating(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <label className="block text-[10px] font-medium text-[var(--muted)] uppercase tracking-wider mb-1">
            Project / Client
          </label>
          <select
            value={selectedId || ""}
            onChange={(e) => {
              if (e.target.value === "__new__") {
                setShowQuickCreate(true);
                return;
              }
              onChange(e.target.value || null);
            }}
            disabled={disabled}
            className="input-premium w-full px-3 py-2.5 rounded-xl text-[var(--foreground)] disabled:opacity-40 text-sm cursor-pointer"
          >
            <option value="">Select a project...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.client_name ? ` — ${p.client_name}` : ""}
              </option>
            ))}
            {onQuickCreate && <option value="__new__">+ New Project</option>}
          </select>
        </div>
      </div>

      {/* Selected project info */}
      {selected && (
        <div className="flex items-center gap-2 px-1">
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: selected.color }}
          />
          <span className="text-xs text-[var(--foreground)] font-medium">
            {selected.name}
          </span>
          {selected.client_name && (
            <span className="text-xs text-[var(--muted)]">
              for {selected.client_name}
            </span>
          )}
          {selected.hourly_rate && (
            <span className="text-xs text-[var(--success)]">
              ${selected.hourly_rate}/hr
            </span>
          )}
          <button
            onClick={() => onChange(null)}
            disabled={disabled}
            className="text-[10px] text-[var(--muted)] hover:text-[var(--danger)] cursor-pointer disabled:opacity-40 ml-auto"
          >
            Clear
          </button>
        </div>
      )}

      {/* Quick create inline form */}
      {showQuickCreate && (
        <div className="glass-card rounded-xl p-3 space-y-2 animate-fade-in">
          <div className="text-xs font-medium text-[var(--foreground)]">
            Quick Create Project
          </div>
          <input
            type="text"
            placeholder="Project name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="input-premium w-full px-3 py-2 rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--muted)]"
            autoFocus
          />
          <input
            type="text"
            placeholder="Client name"
            value={newClient}
            onChange={(e) => setNewClient(e.target.value)}
            className="input-premium w-full px-3 py-2 rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--muted)]"
          />
          <div className="flex gap-2">
            <button
              onClick={handleQuickCreate}
              disabled={!newName.trim() || creating}
              className="btn-premium px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {creating ? "Creating..." : "Create"}
            </button>
            <button
              onClick={() => {
                setShowQuickCreate(false);
                setNewName("");
                setNewClient("");
              }}
              className="btn-premium px-3 py-1.5 rounded-lg glass-card text-[var(--muted)] text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import Modal from "./ui/Modal";

const PROJECT_COLORS = ["#0d9488", "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#f97316"];

type ProjectManagerProps = {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  onCreateProject: (project: { name: string; client_name?: string; hourly_rate?: number; color?: string; budget_hours?: number; notes?: string }) => Promise<Project | null>;
  onUpdateProject: (id: string, updates: Partial<Omit<Project, "id" | "created_at">>) => Promise<boolean>;
  onDeleteProject: (id: string) => Promise<boolean>;
};

export default function ProjectManager({ open, onClose, projects, onCreateProject, onUpdateProject, onDeleteProject }: ProjectManagerProps) {
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [budgetHours, setBudgetHours] = useState("");
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => { setName(""); setClientName(""); setHourlyRate(""); setBudgetHours(""); setNotes(""); setColor(PROJECT_COLORS[0]); setEditingId(null); };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const data = { name: name.trim(), client_name: clientName.trim() || null, hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null, budget_hours: budgetHours ? parseFloat(budgetHours) : null, notes: notes.trim() || null, color };
    if (editingId) { await onUpdateProject(editingId, data); }
    else { await onCreateProject({ ...data, client_name: data.client_name || undefined, hourly_rate: data.hourly_rate || undefined, budget_hours: data.budget_hours || undefined, notes: data.notes || undefined }); }
    resetForm();
  };

  const startEdit = (p: Project) => { setEditingId(p.id); setName(p.name); setClientName(p.client_name || ""); setHourlyRate(p.hourly_rate ? String(p.hourly_rate) : ""); setBudgetHours(p.budget_hours ? String(p.budget_hours) : ""); setNotes(p.notes || ""); setColor(p.color); };

  return (
    <Modal open={open} onClose={() => { resetForm(); onClose(); }} title="Manage Projects">
      <div className="space-y-4">
        <div className="space-y-2.5">
          <input type="text" placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} className="input-premium w-full px-3 py-2.5 rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--muted)] min-h-[44px]" />
          <input type="text" placeholder="Client name (optional)" value={clientName} onChange={(e) => setClientName(e.target.value)} className="input-premium w-full px-3 py-2.5 rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--muted)] min-h-[44px]" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input type="number" placeholder="Hourly rate" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} min="0" step="0.01" className="input-premium w-full px-3 py-2.5 rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--muted)] min-h-[44px]" />
            <input type="number" placeholder="Budget hours" value={budgetHours} onChange={(e) => setBudgetHours(e.target.value)} min="0" step="1" className="input-premium w-full px-3 py-2.5 rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--muted)] min-h-[44px]" />
          </div>
          <textarea placeholder="Notes (deadlines, scope, contact info...)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="input-premium w-full px-3 py-2.5 rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--muted)] resize-none" />
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs text-[var(--muted)] mr-1">Color:</span>
            {PROJECT_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full cursor-pointer transition active:scale-90 ${color === c ? "ring-2 ring-offset-2 ring-[var(--accent)] ring-offset-[var(--card)]" : ""}`} style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleSubmit} disabled={!name.trim()} className="btn-premium px-4 py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] active:scale-95">{editingId ? "Update" : "Add Project"}</button>
            {editingId && <button onClick={resetForm} className="btn-premium px-4 py-2.5 rounded-lg glass-card text-[var(--muted)] text-sm font-medium cursor-pointer min-h-[44px] active:scale-95">Cancel</button>}
          </div>
        </div>

        {projects.length > 0 && (
          <div className="border-t border-[var(--card-border)] pt-3 space-y-1">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[var(--surface-hover)] active:bg-[var(--card-border)] transition">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-medium text-[var(--foreground)]">{project.name}</span>
                      {project.client_name && <span className="text-xs text-[var(--muted)]">({project.client_name})</span>}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--muted)]">
                      {project.hourly_rate && <span className="text-[var(--success)]">${project.hourly_rate}/hr</span>}
                      {project.budget_hours && <span>{project.budget_hours}h budget</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                  <button onClick={() => startEdit(project)} className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--accent)] active:bg-[var(--accent-soft)] transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>
                  </button>
                  <button onClick={() => onDeleteProject(project.id)} className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--danger)] active:bg-[var(--danger-soft)] transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

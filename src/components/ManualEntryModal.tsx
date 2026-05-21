"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import Modal from "./ui/Modal";

type ManualEntryModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (data: { task_name: string; started_at: string; ended_at: string; project_id?: string | null }) => Promise<unknown>;
  projects: Project[];
};

function toLocalDatetime(date: Date): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function ManualEntryModal({ open, onClose, onSave, projects }: ManualEntryModalProps) {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 3600000);

  const [taskName, setTaskName] = useState("");
  const [startedAt, setStartedAt] = useState(toLocalDatetime(oneHourAgo));
  const [endedAt, setEndedAt] = useState(toLocalDatetime(now));
  const [projectId, setProjectId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!taskName.trim() || !startedAt || !endedAt) return;
    setSaving(true);
    await onSave({ task_name: taskName.trim(), started_at: new Date(startedAt).toISOString(), ended_at: new Date(endedAt).toISOString(), project_id: projectId || null });
    setTaskName("");
    setSaving(false);
    onClose();
  };

  let previewDuration = "";
  if (startedAt && endedAt) {
    const diff = new Date(endedAt).getTime() - new Date(startedAt).getTime();
    if (diff > 0) { const h = Math.floor(diff / 3600000); const m = Math.floor((diff % 3600000) / 60000); previewDuration = `${h}h ${m}m`; }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Manual Entry">
      <div className="space-y-4">
        <div>
          <label className="section-label mb-1 block">Task Name</label>
          <input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="What did you work on?" className="input-premium w-full px-3 py-2.5 rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--muted)] min-h-[44px]" autoFocus />
        </div>
        <div>
          <label className="section-label mb-1 block">Project</label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="input-premium w-full px-3 py-2.5 rounded-lg text-sm text-[var(--foreground)] cursor-pointer min-h-[44px]">
            <option value="">No project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}{p.client_name ? ` — ${p.client_name}` : ""}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="section-label mb-1 block">Start Time</label>
            <input type="datetime-local" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} className="input-premium w-full px-3 py-2.5 rounded-lg text-sm text-[var(--foreground)] min-h-[44px]" />
          </div>
          <div>
            <label className="section-label mb-1 block">End Time</label>
            <input type="datetime-local" value={endedAt} onChange={(e) => setEndedAt(e.target.value)} className="input-premium w-full px-3 py-2.5 rounded-lg text-sm text-[var(--foreground)] min-h-[44px]" />
          </div>
        </div>
        {previewDuration && <div className="text-center text-sm font-mono font-semibold text-[var(--accent)]">Duration: {previewDuration}</div>}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-premium px-4 py-2.5 rounded-lg glass-card text-[var(--muted)] text-sm font-medium cursor-pointer min-h-[44px] active:scale-95">Cancel</button>
          <button onClick={handleSave} disabled={saving || !taskName.trim() || !startedAt || !endedAt} className="btn-premium px-4 py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] active:scale-95">{saving ? "Saving..." : "Add Entry"}</button>
        </div>
      </div>
    </Modal>
  );
}

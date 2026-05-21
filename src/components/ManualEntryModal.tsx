"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import Modal from "./ui/Modal";

type ManualEntryModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    task_name: string;
    started_at: string;
    ended_at: string;
    project_id?: string | null;
  }) => Promise<unknown>;
  projects: Project[];
};

function toLocalDatetime(date: Date): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function ManualEntryModal({
  open,
  onClose,
  onSave,
  projects,
}: ManualEntryModalProps) {
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
    await onSave({
      task_name: taskName.trim(),
      started_at: new Date(startedAt).toISOString(),
      ended_at: new Date(endedAt).toISOString(),
      project_id: projectId || null,
    });
    setTaskName("");
    setSaving(false);
    onClose();
  };

  // Calculate preview duration
  let previewDuration = "";
  if (startedAt && endedAt) {
    const diff = new Date(endedAt).getTime() - new Date(startedAt).getTime();
    if (diff > 0) {
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      previewDuration = `${h}h ${m}m`;
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Manual Entry">
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-medium text-[var(--muted)] uppercase tracking-wider mb-1">
            Task Name
          </label>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="What did you work on?"
            className="input-premium w-full px-3 py-2 rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--muted)]"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-[10px] font-medium text-[var(--muted)] uppercase tracking-wider mb-1">
            Project
          </label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="input-premium w-full px-3 py-2 rounded-lg text-sm text-[var(--foreground)] cursor-pointer"
          >
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.client_name ? ` — ${p.client_name}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-medium text-[var(--muted)] uppercase tracking-wider mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              className="input-premium w-full px-3 py-2 rounded-lg text-sm text-[var(--foreground)]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[var(--muted)] uppercase tracking-wider mb-1">
              End Time
            </label>
            <input
              type="datetime-local"
              value={endedAt}
              onChange={(e) => setEndedAt(e.target.value)}
              className="input-premium w-full px-3 py-2 rounded-lg text-sm text-[var(--foreground)]"
            />
          </div>
        </div>

        {previewDuration && (
          <div className="text-center text-sm font-mono font-semibold text-[var(--accent)]">
            Duration: {previewDuration}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="btn-premium px-4 py-2 rounded-lg glass-card text-[var(--muted)] text-sm font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !taskName.trim() || !startedAt || !endedAt}
            className="btn-premium px-4 py-2 rounded-lg bg-[var(--accent)] hover:bg-blue-600 text-white text-sm font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Add Entry"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

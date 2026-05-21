"use client";

import { useState, useEffect } from "react";
import type { TimeEntry, Project, Tag } from "@/lib/types";
import Modal from "./ui/Modal";
import TagSelector from "./TagSelector";

type EntryEditModalProps = {
  entry: TimeEntry | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, updates: { task_name?: string; started_at?: string; ended_at?: string; project_id?: string | null }) => Promise<boolean>;
  projects: Project[];
  tags: Tag[];
  entryTagIds: string[];
  onSaveTags: (entryId: string, tagIds: string[]) => Promise<boolean>;
};

function toLocalDatetime(isoStr: string): string {
  const d = new Date(isoStr);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function EntryEditModal({ entry, open, onClose, onSave, projects, tags, entryTagIds, onSaveTags }: EntryEditModalProps) {
  const [taskName, setTaskName] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [endedAt, setEndedAt] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (entry) {
      setTaskName(entry.task_name);
      setStartedAt(toLocalDatetime(entry.started_at));
      setEndedAt(entry.ended_at ? toLocalDatetime(entry.ended_at) : "");
      setProjectId(entry.project_id || null);
      setSelectedTagIds(entryTagIds);
    }
  }, [entry, entryTagIds]);

  const handleSave = async () => {
    if (!entry || !taskName.trim()) return;
    setSaving(true);
    const updates: { task_name?: string; started_at?: string; ended_at?: string; project_id?: string | null } = { task_name: taskName.trim(), project_id: projectId };
    if (startedAt) updates.started_at = new Date(startedAt).toISOString();
    if (endedAt) updates.ended_at = new Date(endedAt).toISOString();
    const success = await onSave(entry.id, updates);
    if (success) { await onSaveTags(entry.id, selectedTagIds); onClose(); }
    setSaving(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Entry">
      <div className="space-y-4">
        <div>
          <label className="section-label mb-1 block">Task Name</label>
          <input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} className="input-premium w-full px-3 py-2.5 rounded-lg text-sm text-[var(--foreground)] min-h-[44px]" />
        </div>
        <div>
          <label className="section-label mb-1 block">Project</label>
          <select value={projectId || ""} onChange={(e) => setProjectId(e.target.value || null)} className="input-premium w-full px-3 py-2.5 rounded-lg text-sm text-[var(--foreground)] cursor-pointer min-h-[44px]">
            <option value="">No project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
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
        {tags.length > 0 && (
          <div>
            <label className="section-label mb-1 block">Tags</label>
            <TagSelector tags={tags} selectedIds={selectedTagIds} onChange={setSelectedTagIds} />
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-premium px-4 py-2.5 rounded-lg glass-card text-[var(--muted)] text-sm font-medium cursor-pointer min-h-[44px] active:scale-95">Cancel</button>
          <button onClick={handleSave} disabled={saving || !taskName.trim()} className="btn-premium px-4 py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] active:scale-95">{saving ? "Saving..." : "Save"}</button>
        </div>
      </div>
    </Modal>
  );
}

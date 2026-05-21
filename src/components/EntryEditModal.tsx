"use client";

import { useState, useEffect } from "react";
import type { TimeEntry, Project, Tag } from "@/lib/types";
import Modal from "./ui/Modal";
import TagSelector from "./TagSelector";

type EntryEditModalProps = {
  entry: TimeEntry | null;
  open: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    updates: {
      task_name?: string;
      started_at?: string;
      ended_at?: string;
      project_id?: string | null;
    }
  ) => Promise<boolean>;
  projects: Project[];
  tags: Tag[];
  entryTagIds: string[];
  onSaveTags: (entryId: string, tagIds: string[]) => Promise<boolean>;
};

function toLocalDatetime(isoStr: string): string {
  const d = new Date(isoStr);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function fromLocalDatetime(localStr: string): string {
  return new Date(localStr).toISOString();
}

export default function EntryEditModal({
  entry,
  open,
  onClose,
  onSave,
  projects,
  tags,
  entryTagIds,
  onSaveTags,
}: EntryEditModalProps) {
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

    const updates: {
      task_name?: string;
      started_at?: string;
      ended_at?: string;
      project_id?: string | null;
    } = {
      task_name: taskName.trim(),
      project_id: projectId,
    };

    if (startedAt) updates.started_at = fromLocalDatetime(startedAt);
    if (endedAt) updates.ended_at = fromLocalDatetime(endedAt);

    const success = await onSave(entry.id, updates);
    if (success) {
      await onSaveTags(entry.id, selectedTagIds);
      onClose();
    }
    setSaving(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Entry">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Task Name
          </label>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Project
          </label>
          <select
            value={projectId || ""}
            onChange={(e) => setProjectId(e.target.value || null)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              End Time
            </label>
            <input
              type="datetime-local"
              value={endedAt}
              onChange={(e) => setEndedAt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Tags
            </label>
            <TagSelector
              tags={tags}
              selectedIds={selectedTagIds}
              onChange={setSelectedTagIds}
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-medium transition cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !taskName.trim()}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-300 text-white text-sm font-medium transition cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

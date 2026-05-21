"use client";

import type { TimeEntry } from "@/lib/types";
import EntryRow from "./EntryRow";

type EntryListProps = {
  entries: TimeEntry[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (id: string) => void;
  onDuplicate: (entry: TimeEntry) => void;
};

export default function EntryList({ entries, onEdit, onDelete, onDuplicate }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <p className="text-sm font-medium text-[var(--foreground)]">No time entries yet</p>
        <p className="text-xs text-[var(--muted)] mt-1 max-w-[240px] text-center">
          Type a task name above and press <kbd className="px-1 py-0.5 rounded bg-[var(--card-border)] font-mono text-[9px]">Start</kbd> or <kbd className="px-1 py-0.5 rounded bg-[var(--card-border)] font-mono text-[9px]">S</kbd> to begin
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 stagger-children">
      <div className="flex items-center justify-between">
        <span className="section-label">Time Entries</span>
        <span className="text-[10px] text-[var(--muted-light)]">{entries.length} entries</span>
      </div>
      <div className="space-y-1.5">
        {entries.map((entry) => (
          <EntryRow key={entry.id} entry={entry} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} />
        ))}
      </div>
    </div>
  );
}

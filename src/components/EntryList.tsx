"use client";

import type { TimeEntry } from "@/lib/types";
import EntryRow from "./EntryRow";

type EntryListProps = {
  entries: TimeEntry[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (id: string) => void;
  onDuplicate: (entry: TimeEntry) => void;
};

export default function EntryList({
  entries,
  onEdit,
  onDelete,
  onDuplicate,
}: EntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">
        <p className="text-sm">No time entries yet</p>
        <p className="text-xs mt-1">
          Enter a task name and hit Start to begin tracking
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 stagger-children">
      <h2 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider">
        Time Entries
      </h2>
      <div className="space-y-2">
        {entries.map((entry) => (
          <EntryRow
            key={entry.id}
            entry={entry}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
          />
        ))}
      </div>
    </div>
  );
}

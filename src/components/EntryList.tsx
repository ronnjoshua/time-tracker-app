"use client";

import type { TimeEntry } from "@/lib/types";
import EntryRow from "./EntryRow";

type EntryListProps = {
  entries: TimeEntry[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (id: string) => void;
};

export default function EntryList({
  entries,
  onEdit,
  onDelete,
}: EntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <p className="text-lg">No time entries yet</p>
        <p className="text-sm mt-1">
          Enter a task name and hit Start to begin tracking
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Time Entries
      </h2>
      <div className="space-y-2">
        {entries.map((entry) => (
          <EntryRow
            key={entry.id}
            entry={entry}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

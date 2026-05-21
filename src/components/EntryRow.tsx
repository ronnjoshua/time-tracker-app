"use client";

import { formatDuration, formatHours, formatDate, formatTime } from "@/lib/format";
import type { TimeEntry } from "@/lib/types";

type EntryRowProps = {
  entry: TimeEntry;
  onEdit: (entry: TimeEntry) => void;
  onDelete: (id: string) => void;
};

export default function EntryRow({ entry, onEdit, onDelete }: EntryRowProps) {
  return (
    <div className="group glass-card rounded-xl p-4 flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--foreground)] truncate">
            {entry.task_name}
          </span>
          {entry.project && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-white shrink-0 uppercase tracking-wide"
              style={{ backgroundColor: entry.project.color }}
            >
              {entry.project.name}
            </span>
          )}
        </div>
        <div className="text-xs text-[var(--muted)] mt-1">
          {formatDate(entry.started_at)} &middot;{" "}
          {formatTime(entry.started_at)} &ndash;{" "}
          {entry.ended_at ? formatTime(entry.ended_at) : "ongoing"}
          {entry.project?.client_name && (
            <span className="ml-2 opacity-60">
              &middot; {entry.project.client_name}
            </span>
          )}
        </div>
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex gap-1 mt-1.5">
            {entry.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
                style={{
                  backgroundColor: tag.color + "15",
                  color: tag.color,
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 ml-4">
        <div className="text-right">
          <div className="font-mono text-sm font-semibold text-[var(--foreground)] timer-display">
            {formatDuration(entry.duration_seconds || 0)}
          </div>
          <div className="text-[10px] text-[var(--muted)]">
            {formatHours(entry.duration_seconds || 0)} hrs
            {entry.project?.hourly_rate && entry.duration_seconds && (
              <span className="ml-1 text-[var(--success)]">
                ${((entry.duration_seconds / 3600) * entry.project.hourly_rate).toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(entry)}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition cursor-pointer"
            title="Edit entry"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] transition cursor-pointer"
            title="Delete entry"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

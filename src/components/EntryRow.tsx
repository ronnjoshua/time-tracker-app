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
    <div className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between transition hover:border-zinc-300 dark:hover:border-zinc-700">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {entry.task_name}
          </span>
          {entry.project && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white shrink-0"
              style={{ backgroundColor: entry.project.color }}
            >
              {entry.project.name}
            </span>
          )}
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          {formatDate(entry.started_at)} &middot;{" "}
          {formatTime(entry.started_at)} &ndash;{" "}
          {entry.ended_at ? formatTime(entry.ended_at) : "ongoing"}
          {entry.project?.client_name && (
            <span className="ml-2 text-zinc-400 dark:text-zinc-500">
              &middot; {entry.project.client_name}
            </span>
          )}
        </div>
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex gap-1 mt-1.5">
            {entry.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: tag.color + "20",
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
          <div className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
            {formatDuration(entry.duration_seconds || 0)}
          </div>
          <div className="text-xs text-zinc-400">
            {formatHours(entry.duration_seconds || 0)} hrs
            {entry.project?.hourly_rate && entry.duration_seconds && (
              <span className="ml-1 text-emerald-500">
                ${((entry.duration_seconds / 3600) * entry.project.hourly_rate).toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => onEdit(entry)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition cursor-pointer"
            title="Edit entry"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition cursor-pointer"
            title="Delete entry"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

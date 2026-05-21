"use client";

import { downloadCSV } from "@/lib/csv";
import type { TimeEntry } from "@/lib/types";

type ExportCSVProps = {
  entries: TimeEntry[];
};

export default function ExportCSV({ entries }: ExportCSVProps) {
  if (entries.length === 0) return null;

  return (
    <button
      onClick={() => downloadCSV(entries)}
      className="btn-premium inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card text-[var(--muted)] hover:text-[var(--foreground)] text-xs font-medium cursor-pointer"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      CSV
    </button>
  );
}

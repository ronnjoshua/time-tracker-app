"use client";

import { formatDuration, formatHours } from "@/lib/format";
import type { TimeEntry } from "@/lib/types";

type SummaryBarProps = { entries: TimeEntry[] };

export default function SummaryBar({ entries }: SummaryBarProps) {
  const totalSeconds = entries.reduce((s, e) => s + (e.duration_seconds || 0), 0);
  const totalBillable = entries.reduce((s, e) => {
    if (e.project?.hourly_rate && e.duration_seconds)
      return s + (e.duration_seconds / 3600) * e.project.hourly_rate;
    return s;
  }, 0);

  if (entries.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 border-[var(--accent-medium)]" style={{ borderColor: "var(--accent-medium)" }}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-0">
        <div>
          <div className="section-label">Total Tracked</div>
          <div className="text-lg sm:text-xl font-bold text-[var(--foreground)] mt-0.5 timer-display">
            {formatDuration(totalSeconds)}
          </div>
        </div>
        <div className="text-right sm:text-center">
          <div className="section-label">Hours</div>
          <div className="text-lg sm:text-xl font-bold text-[var(--foreground)] mt-0.5">
            {formatHours(totalSeconds)}
          </div>
        </div>
        {totalBillable > 0 && (
          <div className="col-span-2 sm:col-span-1 text-center sm:text-right pt-2 sm:pt-0 border-t sm:border-0 border-[var(--card-border)]">
            <div className="section-label">Billable</div>
            <div className="text-lg sm:text-xl font-bold text-[var(--success)] mt-0.5">
              ${totalBillable.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

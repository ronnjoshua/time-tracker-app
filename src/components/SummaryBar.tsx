"use client";

import { formatDuration, formatHours } from "@/lib/format";
import type { TimeEntry } from "@/lib/types";

type SummaryBarProps = {
  entries: TimeEntry[];
};

export default function SummaryBar({ entries }: SummaryBarProps) {
  const totalSeconds = entries.reduce(
    (sum, e) => sum + (e.duration_seconds || 0),
    0
  );

  const totalBillable = entries.reduce((sum, e) => {
    if (e.project?.hourly_rate && e.duration_seconds) {
      return sum + (e.duration_seconds / 3600) * e.project.hourly_rate;
    }
    return sum;
  }, 0);

  if (entries.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-5 bg-[var(--accent-soft)] border-[color:var(--accent)]!important border-opacity-20">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider">
            Total Tracked
          </div>
          <div className="text-xl font-bold text-[var(--foreground)] mt-0.5 timer-display">
            {formatDuration(totalSeconds)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider">
            Hours
          </div>
          <div className="text-xl font-bold text-[var(--foreground)] mt-0.5">
            {formatHours(totalSeconds)}
          </div>
        </div>
        {totalBillable > 0 && (
          <div className="text-right">
            <div className="text-xs font-medium text-[var(--success)] uppercase tracking-wider">
              Billable
            </div>
            <div className="text-xl font-bold text-[var(--success)] mt-0.5">
              ${totalBillable.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

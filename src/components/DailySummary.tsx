"use client";

import { format, startOfDay } from "date-fns";
import { formatDuration, formatHours } from "@/lib/format";
import type { TimeEntry } from "@/lib/types";

type DailySummaryProps = {
  entries: TimeEntry[];
};

export default function DailySummary({ entries }: DailySummaryProps) {
  const grouped = entries.reduce<Record<string, TimeEntry[]>>((acc, entry) => {
    const day = format(startOfDay(new Date(entry.started_at)), "yyyy-MM-dd");
    if (!acc[day]) acc[day] = [];
    acc[day].push(entry);
    return acc;
  }, {});

  const days = Object.keys(grouped).sort().reverse();

  if (days.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--muted)] text-sm">
        No entries for the selected period
      </div>
    );
  }

  return (
    <div className="space-y-3 stagger-children">
      <h2 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider">
        Daily Summary
      </h2>
      {days.map((day) => {
        const dayEntries = grouped[day];
        const totalSeconds = dayEntries.reduce(
          (sum, e) => sum + (e.duration_seconds || 0),
          0
        );
        const totalBillable = dayEntries.reduce((sum, e) => {
          if (e.project?.hourly_rate && e.duration_seconds) {
            return sum + (e.duration_seconds / 3600) * e.project.hourly_rate;
          }
          return sum;
        }, 0);

        return (
          <div key={day} className="glass-card rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm font-medium text-[var(--foreground)]">
                {format(new Date(day), "EEEE, MMM d")}
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="font-mono font-semibold text-[var(--foreground)] timer-display">
                  {formatDuration(totalSeconds)}
                </span>
                <span className="text-[var(--muted)]">
                  {formatHours(totalSeconds)} hrs
                </span>
                {totalBillable > 0 && (
                  <span className="text-[var(--success)] font-medium">
                    ${totalBillable.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-1">
              {dayEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between text-xs py-1.5 border-t border-[var(--card-border)] first:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--foreground)]">
                      {entry.task_name}
                    </span>
                    {entry.project && (
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] text-white font-semibold uppercase"
                        style={{ backgroundColor: entry.project.color }}
                      >
                        {entry.project.name}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[var(--muted)] timer-display">
                    {formatDuration(entry.duration_seconds || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { format, startOfWeek } from "date-fns";
import { formatDuration, formatHours } from "@/lib/format";
import type { TimeEntry } from "@/lib/types";

type WeeklySummaryProps = {
  entries: TimeEntry[];
};

export default function WeeklySummary({ entries }: WeeklySummaryProps) {
  const grouped = entries.reduce<Record<string, TimeEntry[]>>((acc, entry) => {
    const weekStart = format(
      startOfWeek(new Date(entry.started_at), { weekStartsOn: 1 }),
      "yyyy-MM-dd"
    );
    if (!acc[weekStart]) acc[weekStart] = [];
    acc[weekStart].push(entry);
    return acc;
  }, {});

  const weeks = Object.keys(grouped).sort().reverse();

  if (weeks.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--muted)] text-sm">
        No entries for the selected period
      </div>
    );
  }

  return (
    <div className="space-y-3 stagger-children">
      <h2 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider">
        Weekly Summary
      </h2>
      {weeks.map((weekStart) => {
        const weekEntries = grouped[weekStart];
        const totalSeconds = weekEntries.reduce(
          (sum, e) => sum + (e.duration_seconds || 0),
          0
        );
        const totalBillable = weekEntries.reduce((sum, e) => {
          if (e.project?.hourly_rate && e.duration_seconds) {
            return sum + (e.duration_seconds / 3600) * e.project.hourly_rate;
          }
          return sum;
        }, 0);

        const byProject = weekEntries.reduce<
          Record<string, { name: string; color: string; seconds: number; amount: number }>
        >((acc, entry) => {
          const key = entry.project?.name || "No Project";
          if (!acc[key]) {
            acc[key] = { name: key, color: entry.project?.color || "#6b7280", seconds: 0, amount: 0 };
          }
          acc[key].seconds += entry.duration_seconds || 0;
          if (entry.project?.hourly_rate && entry.duration_seconds) {
            acc[key].amount += (entry.duration_seconds / 3600) * entry.project.hourly_rate;
          }
          return acc;
        }, {});

        return (
          <div key={weekStart} className="glass-card rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm font-medium text-[var(--foreground)]">
                Week of {format(new Date(weekStart), "MMM d, yyyy")}
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
              {Object.values(byProject).map((proj) => (
                <div
                  key={proj.name}
                  className="flex items-center justify-between text-xs py-1.5 border-t border-[var(--card-border)] first:border-0"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: proj.color }}
                    />
                    <span className="text-[var(--foreground)]">{proj.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[var(--muted)] timer-display">
                      {formatHours(proj.seconds)} hrs
                    </span>
                    {proj.amount > 0 && (
                      <span className="text-[var(--success)] text-[10px]">
                        ${proj.amount.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

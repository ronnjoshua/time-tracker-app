"use client";

import { format, startOfWeek } from "date-fns";
import { formatDuration, formatHours } from "@/lib/format";
import type { TimeEntry } from "@/lib/types";

type WeeklySummaryProps = {
  entries: TimeEntry[];
};

export default function WeeklySummary({ entries }: WeeklySummaryProps) {
  // Group entries by week (Monday start)
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
      <div className="text-center py-8 text-zinc-400">
        No entries for the selected period
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
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

        // Group by project within the week
        const byProject = weekEntries.reduce<
          Record<string, { name: string; color: string; seconds: number; amount: number }>
        >((acc, entry) => {
          const key = entry.project?.name || "No Project";
          if (!acc[key]) {
            acc[key] = {
              name: key,
              color: entry.project?.color || "#6b7280",
              seconds: 0,
              amount: 0,
            };
          }
          acc[key].seconds += entry.duration_seconds || 0;
          if (entry.project?.hourly_rate && entry.duration_seconds) {
            acc[key].amount +=
              (entry.duration_seconds / 3600) * entry.project.hourly_rate;
          }
          return acc;
        }, {});

        return (
          <div
            key={weekStart}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="font-medium text-zinc-900 dark:text-zinc-100">
                Week of {format(new Date(weekStart), "MMM d, yyyy")}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                  {formatDuration(totalSeconds)}
                </span>
                <span className="text-zinc-400">
                  ({formatHours(totalSeconds)} hrs)
                </span>
                {totalBillable > 0 && (
                  <span className="text-emerald-500 font-medium">
                    ${totalBillable.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              {Object.values(byProject).map((proj) => (
                <div
                  key={proj.name}
                  className="flex items-center justify-between text-sm py-1"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: proj.color }}
                    />
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {proj.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-zinc-500">
                      {formatHours(proj.seconds)} hrs
                    </span>
                    {proj.amount > 0 && (
                      <span className="text-emerald-500 text-xs">
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

"use client";

import { format, startOfDay } from "date-fns";
import { formatDuration, formatHours } from "@/lib/format";
import type { TimeEntry } from "@/lib/types";

type DailySummaryProps = {
  entries: TimeEntry[];
};

export default function DailySummary({ entries }: DailySummaryProps) {
  // Group entries by day
  const grouped = entries.reduce<Record<string, TimeEntry[]>>((acc, entry) => {
    const day = format(startOfDay(new Date(entry.started_at)), "yyyy-MM-dd");
    if (!acc[day]) acc[day] = [];
    acc[day].push(entry);
    return acc;
  }, {});

  const days = Object.keys(grouped).sort().reverse();

  if (days.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-400">
        No entries for the selected period
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
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
          <div
            key={day}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="font-medium text-zinc-900 dark:text-zinc-100">
                {format(new Date(day), "EEEE, MMM d, yyyy")}
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
              {dayEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between text-sm py-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {entry.task_name}
                    </span>
                    {entry.project && (
                      <span
                        className="px-1.5 py-0.5 rounded text-xs text-white"
                        style={{ backgroundColor: entry.project.color }}
                      >
                        {entry.project.name}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-zinc-500">
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

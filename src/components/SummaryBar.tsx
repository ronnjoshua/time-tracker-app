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

  // Calculate billable amount from entries that have projects with hourly rates
  const totalBillable = entries.reduce((sum, e) => {
    if (e.project?.hourly_rate && e.duration_seconds) {
      return sum + (e.duration_seconds / 3600) * e.project.hourly_rate;
    }
    return sum;
  }, 0);

  if (entries.length === 0) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900 p-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Total Time Tracked
          </div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {formatDuration(totalSeconds)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Hours
          </div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {formatHours(totalSeconds)} hrs
          </div>
        </div>
        {totalBillable > 0 && (
          <div className="text-right">
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Billable Amount
            </div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              ${totalBillable.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

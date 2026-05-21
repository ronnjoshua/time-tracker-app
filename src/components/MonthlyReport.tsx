"use client";

import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths } from "date-fns";
import { formatDuration, formatHours } from "@/lib/format";
import type { TimeEntry, Project } from "@/lib/types";
import { useState } from "react";

type MonthlyReportProps = {
  entries: TimeEntry[];
  projects: Project[];
};

export default function MonthlyReport({ entries, projects }: MonthlyReportProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Filter entries for the current month
  const monthEntries = entries.filter((e) => {
    const d = new Date(e.started_at);
    return d >= monthStart && d <= monthEnd;
  });

  const totalSeconds = monthEntries.reduce(
    (sum, e) => sum + (e.duration_seconds || 0),
    0
  );
  const totalBillable = monthEntries.reduce((sum, e) => {
    if (e.project?.hourly_rate && e.duration_seconds) {
      return sum + (e.duration_seconds / 3600) * e.project.hourly_rate;
    }
    return sum;
  }, 0);

  // By project breakdown
  const byProject = monthEntries.reduce<
    Record<string, { name: string; color: string; seconds: number; amount: number; entries: number }>
  >((acc, entry) => {
    const key = entry.project_id || "__none__";
    if (!acc[key]) {
      acc[key] = {
        name: entry.project?.name || "Unassigned",
        color: entry.project?.color || "#6b7280",
        seconds: 0,
        amount: 0,
        entries: 0,
      };
    }
    acc[key].seconds += entry.duration_seconds || 0;
    acc[key].entries += 1;
    if (entry.project?.hourly_rate && entry.duration_seconds) {
      acc[key].amount += (entry.duration_seconds / 3600) * entry.project.hourly_rate;
    }
    return acc;
  }, {});

  // Daily hours for the mini heatmap
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const dailyHours = days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayEntries = monthEntries.filter(
      (e) => format(new Date(e.started_at), "yyyy-MM-dd") === dayStr
    );
    const seconds = dayEntries.reduce((s, e) => s + (e.duration_seconds || 0), 0);
    return { date: day, hours: seconds / 3600 };
  });

  const maxDailyHours = Math.max(...dailyHours.map((d) => d.hours), 1);
  const workingDays = dailyHours.filter((d) => d.hours > 0).length;

  return (
    <div className="space-y-4 stagger-children">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider">
          Monthly Report
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="btn-premium p-1.5 rounded-lg glass-card text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <span className="text-sm font-medium text-[var(--foreground)] min-w-[140px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="btn-premium p-1.5 rounded-lg glass-card text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="glass-card rounded-xl p-3">
          <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-medium">Hours</div>
          <div className="text-xl font-bold text-[var(--foreground)] mt-0.5 timer-display">{formatHours(totalSeconds)}</div>
        </div>
        <div className="glass-card rounded-xl p-3">
          <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-medium">Entries</div>
          <div className="text-xl font-bold text-[var(--foreground)] mt-0.5">{monthEntries.length}</div>
        </div>
        <div className="glass-card rounded-xl p-3">
          <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-medium">Work Days</div>
          <div className="text-xl font-bold text-[var(--foreground)] mt-0.5">{workingDays}</div>
        </div>
        <div className="glass-card rounded-xl p-3">
          <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-medium">Billable</div>
          <div className="text-xl font-bold text-[var(--success)] mt-0.5">${totalBillable.toFixed(2)}</div>
        </div>
      </div>

      {/* Daily activity heatmap */}
      <div className="glass-card rounded-xl p-4">
        <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-medium mb-3">Daily Activity</div>
        <div className="grid grid-cols-7 gap-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div key={i} className="text-center text-[9px] text-[var(--muted)] font-medium pb-1">{d}</div>
          ))}
          {/* Pad start of month */}
          {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {dailyHours.map(({ date, hours }) => {
            const intensity = hours > 0 ? Math.max(0.15, hours / maxDailyHours) : 0;
            return (
              <div
                key={date.toISOString()}
                className="aspect-square rounded-sm relative group cursor-default"
                style={{
                  backgroundColor: hours > 0
                    ? `rgba(37, 99, 235, ${intensity})`
                    : "var(--card-border)",
                }}
                title={`${format(date, "MMM d")}: ${hours.toFixed(1)}h`}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 rounded text-[9px] bg-[var(--foreground)] text-[var(--background)] opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                  {format(date, "MMM d")}: {hours.toFixed(1)}h
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-project breakdown */}
      {Object.keys(byProject).length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-medium mb-3">By Project</div>
          <div className="space-y-3">
            {Object.values(byProject)
              .sort((a, b) => b.seconds - a.seconds)
              .map((proj) => {
                const percentage = totalSeconds > 0 ? (proj.seconds / totalSeconds) * 100 : 0;
                const projectObj = projects.find((p) => p.name === proj.name);
                const budgetHours = projectObj?.budget_hours;

                return (
                  <div key={proj.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: proj.color }} />
                        <span className="text-xs font-medium text-[var(--foreground)]">{proj.name}</span>
                        <span className="text-[10px] text-[var(--muted)]">{proj.entries} entries</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono text-[var(--foreground)] timer-display">{formatHours(proj.seconds)} hrs</span>
                        {budgetHours && (
                          <span className="text-[var(--muted)]">/ {budgetHours}h</span>
                        )}
                        {proj.amount > 0 && (
                          <span className="text-[var(--success)]">${proj.amount.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[var(--card-border)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: proj.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {monthEntries.length === 0 && (
        <div className="text-center py-8 text-[var(--muted)] text-sm">
          No entries for {format(currentMonth, "MMMM yyyy")}
        </div>
      )}
    </div>
  );
}

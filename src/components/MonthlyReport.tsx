"use client";

import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths } from "date-fns";
import { formatDuration, formatHours } from "@/lib/format";
import type { TimeEntry, Project } from "@/lib/types";
import { useState } from "react";

type MonthlyReportProps = { entries: TimeEntry[]; projects: Project[] };

export default function MonthlyReport({ entries, projects }: MonthlyReportProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const monthEntries = entries.filter((e) => {
    const d = new Date(e.started_at);
    return d >= monthStart && d <= monthEnd;
  });

  const totalSeconds = monthEntries.reduce((s, e) => s + (e.duration_seconds || 0), 0);
  const totalBillable = monthEntries.reduce((s, e) => {
    if (e.project?.hourly_rate && e.duration_seconds)
      return s + (e.duration_seconds / 3600) * e.project.hourly_rate;
    return s;
  }, 0);

  const byProject = monthEntries.reduce<Record<string, { name: string; color: string; seconds: number; amount: number; entries: number }>>((acc, entry) => {
    const key = entry.project_id || "__none__";
    if (!acc[key]) acc[key] = { name: entry.project?.name || "Unassigned", color: entry.project?.color || "#a8a29e", seconds: 0, amount: 0, entries: 0 };
    acc[key].seconds += entry.duration_seconds || 0;
    acc[key].entries += 1;
    if (entry.project?.hourly_rate && entry.duration_seconds)
      acc[key].amount += (entry.duration_seconds / 3600) * entry.project.hourly_rate;
    return acc;
  }, {});

  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const dailyHours = days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const seconds = monthEntries.filter((e) => format(new Date(e.started_at), "yyyy-MM-dd") === dayStr).reduce((s, e) => s + (e.duration_seconds || 0), 0);
    return { date: day, hours: seconds / 3600 };
  });
  const maxDailyHours = Math.max(...dailyHours.map((d) => d.hours), 1);
  const workingDays = dailyHours.filter((d) => d.hours > 0).length;

  return (
    <div className="space-y-4 stagger-children">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <span className="section-label">Monthly Report</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="btn-premium p-2.5 rounded-xl glass-card text-[var(--muted)] hover:text-[var(--foreground)] active:bg-[var(--surface-hover)] cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <span className="text-sm font-medium text-[var(--foreground)] min-w-[120px] text-center">{format(currentMonth, "MMM yyyy")}</span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="btn-premium p-2.5 rounded-xl glass-card text-[var(--muted)] hover:text-[var(--foreground)] active:bg-[var(--surface-hover)] cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {/* Summary cards - 2 cols on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="glass-card rounded-xl p-3"><div className="section-label">Hours</div><div className="text-lg sm:text-xl font-bold text-[var(--foreground)] mt-0.5 timer-display">{formatHours(totalSeconds)}</div></div>
        <div className="glass-card rounded-xl p-3"><div className="section-label">Entries</div><div className="text-lg sm:text-xl font-bold text-[var(--foreground)] mt-0.5">{monthEntries.length}</div></div>
        <div className="glass-card rounded-xl p-3"><div className="section-label">Work Days</div><div className="text-lg sm:text-xl font-bold text-[var(--foreground)] mt-0.5">{workingDays}</div></div>
        <div className="glass-card rounded-xl p-3"><div className="section-label">Billable</div><div className="text-lg sm:text-xl font-bold text-[var(--success)] mt-0.5">${totalBillable.toFixed(0)}</div></div>
      </div>

      {/* Daily heatmap */}
      <div className="glass-card rounded-xl p-3 sm:p-4">
        <div className="section-label mb-2.5">Daily Activity</div>
        <div className="grid grid-cols-7 gap-[3px] sm:gap-1">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div key={i} className="text-center text-[9px] text-[var(--muted-light)] font-medium pb-0.5">{d}</div>
          ))}
          {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => <div key={`pad-${i}`} />)}
          {dailyHours.map(({ date, hours }) => {
            const intensity = hours > 0 ? Math.max(0.15, hours / maxDailyHours) : 0;
            return (
              <div
                key={date.toISOString()}
                className="aspect-square rounded-sm"
                style={{ backgroundColor: hours > 0 ? `rgba(13, 148, 136, ${intensity})` : "var(--card-border)" }}
                title={`${format(date, "MMM d")}: ${hours.toFixed(1)}h`}
              />
            );
          })}
        </div>
      </div>

      {/* Per-project breakdown */}
      {Object.keys(byProject).length > 0 && (
        <div className="glass-card rounded-xl p-3 sm:p-4">
          <div className="section-label mb-2.5">By Project</div>
          <div className="space-y-3">
            {Object.values(byProject).sort((a, b) => b.seconds - a.seconds).map((proj) => {
              const pct = totalSeconds > 0 ? (proj.seconds / totalSeconds) * 100 : 0;
              const projectObj = projects.find((p) => p.name === proj.name);
              return (
                <div key={proj.name}>
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: proj.color }} />
                      <span className="text-xs font-medium text-[var(--foreground)] truncate">{proj.name}</span>
                      <span className="text-[10px] text-[var(--muted)] shrink-0">{proj.entries}x</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs shrink-0">
                      <span className="font-mono text-[var(--foreground)] timer-display">{formatHours(proj.seconds)}h</span>
                      {projectObj?.budget_hours && <span className="text-[var(--muted)]">/{projectObj.budget_hours}h</span>}
                      {proj.amount > 0 && <span className="text-[var(--success)]">${proj.amount.toFixed(0)}</span>}
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[var(--card-border)] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: proj.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {monthEntries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
          </div>
          <p className="text-sm font-medium text-[var(--foreground)]">No entries</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">{format(currentMonth, "MMMM yyyy")}</p>
        </div>
      )}
    </div>
  );
}

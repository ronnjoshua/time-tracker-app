"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { format, startOfDay } from "date-fns";
import { formatHours } from "@/lib/format";
import type { TimeEntry } from "@/lib/types";

type DashboardProps = { entries: TimeEntry[] };

// Custom tooltip
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-lg px-3 py-2 shadow-lg text-xs">
      <div className="font-medium text-[var(--foreground)]">{label}</div>
      <div className="text-[var(--accent)] font-mono mt-0.5">{payload[0].value} hrs</div>
    </div>
  );
}

export default function Dashboard({ entries }: DashboardProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 4-8"/>
          </svg>
        </div>
        <p className="text-sm font-medium text-[var(--foreground)]">No data to visualize</p>
        <p className="text-xs text-[var(--muted)] mt-1">Start tracking time to see charts and insights</p>
      </div>
    );
  }

  const totalSeconds = entries.reduce((s, e) => s + (e.duration_seconds || 0), 0);
  const totalBillable = entries.reduce((s, e) => {
    if (e.project?.hourly_rate && e.duration_seconds)
      return s + (e.duration_seconds / 3600) * e.project.hourly_rate;
    return s;
  }, 0);
  const avgPerDay = entries.length > 0 ? totalSeconds / new Set(entries.map(e => format(new Date(e.started_at), "yyyy-MM-dd"))).size : 0;

  const byDay = entries.reduce<Record<string, number>>((acc, e) => {
    const day = format(startOfDay(new Date(e.started_at)), "MMM dd");
    acc[day] = (acc[day] || 0) + (e.duration_seconds || 0) / 3600;
    return acc;
  }, {});
  const dailyData = Object.entries(byDay).map(([day, hours]) => ({ day, hours: parseFloat(hours.toFixed(2)) })).reverse();

  const byProject = entries.reduce<Record<string, { name: string; color: string; hours: number }>>((acc, e) => {
    const key = e.project?.name || "Unassigned";
    if (!acc[key]) acc[key] = { name: key, color: e.project?.color || "#a8a29e", hours: 0 };
    acc[key].hours += (e.duration_seconds || 0) / 3600;
    return acc;
  }, {});
  const projectData = Object.values(byProject).map(p => ({ ...p, hours: parseFloat(p.hours.toFixed(2)) }));

  return (
    <div className="space-y-4 stagger-children">
      <span className="section-label">Dashboard</span>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { label: "Total Hours", value: formatHours(totalSeconds), color: "var(--foreground)" },
          { label: "Avg / Day", value: formatHours(avgPerDay), color: "var(--foreground)" },
          { label: "Entries", value: String(entries.length), color: "var(--foreground)" },
          { label: "Billable", value: `$${totalBillable.toFixed(0)}`, color: "var(--success)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card rounded-xl p-3 sm:p-4">
            <div className="section-label">{label}</div>
            <div className="text-xl sm:text-2xl font-bold mt-1 timer-display" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="glass-card rounded-xl p-4">
          <span className="section-label">Hours per Day</span>
          <div className="mt-3">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dailyData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                <XAxis dataKey="day" fontSize={10} tick={{ fill: "var(--muted-light)" }} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} tick={{ fill: "var(--muted-light)" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--surface-hover)" }} />
                <Bar dataKey="hours" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4">
          <span className="section-label">Time by Project</span>
          <div className="mt-3">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={projectData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={72}
                  dataKey="hours"
                  nameKey="name"
                  paddingAngle={2}
                  stroke="none"
                >
                  {projectData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="glass-card rounded-lg px-3 py-2 shadow-lg text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="font-medium text-[var(--foreground)]">{d.name}</span>
                        </div>
                        <div className="text-[var(--accent)] font-mono mt-0.5">{d.hours} hrs</div>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
              {projectData.map((p) => (
                <div key={p.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-[10px] text-[var(--muted)]">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

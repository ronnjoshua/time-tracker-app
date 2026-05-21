"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, startOfDay } from "date-fns";
import { formatHours } from "@/lib/format";
import type { TimeEntry } from "@/lib/types";

type DashboardProps = {
  entries: TimeEntry[];
};

export default function Dashboard({ entries }: DashboardProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--muted)] text-sm">
        No data to display yet. Start tracking time to see your dashboard.
      </div>
    );
  }

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

  const byDay = entries.reduce<Record<string, number>>((acc, entry) => {
    const day = format(startOfDay(new Date(entry.started_at)), "MMM dd");
    acc[day] = (acc[day] || 0) + (entry.duration_seconds || 0) / 3600;
    return acc;
  }, {});

  const dailyData = Object.entries(byDay)
    .map(([day, hours]) => ({ day, hours: parseFloat(hours.toFixed(2)) }))
    .reverse();

  const byProject = entries.reduce<
    Record<string, { name: string; color: string; hours: number }>
  >((acc, entry) => {
    const key = entry.project?.name || "No Project";
    if (!acc[key]) {
      acc[key] = { name: key, color: entry.project?.color || "#94a3b8", hours: 0 };
    }
    acc[key].hours += (entry.duration_seconds || 0) / 3600;
    return acc;
  }, {});

  const projectData = Object.values(byProject).map((p) => ({
    ...p,
    hours: parseFloat(p.hours.toFixed(2)),
  }));

  return (
    <div className="space-y-4 stagger-children">
      <h2 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider">
        Dashboard
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-4">
          <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-medium">
            Total Hours
          </div>
          <div className="text-2xl font-bold text-[var(--foreground)] mt-1 timer-display">
            {formatHours(totalSeconds)}
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-medium">
            Entries
          </div>
          <div className="text-2xl font-bold text-[var(--foreground)] mt-1">
            {entries.length}
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-medium">
            Billable
          </div>
          <div className="text-2xl font-bold text-[var(--success)] mt-1">
            ${totalBillable.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-medium mb-4">
            Hours per Day
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
              <XAxis dataKey="day" fontSize={10} tick={{ fill: "var(--muted)" }} />
              <YAxis fontSize={10} tick={{ fill: "var(--muted)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "12px",
                  color: "var(--foreground)",
                  fontSize: "12px",
                  boxShadow: "var(--card-shadow)",
                }}
              />
              <Bar dataKey="hours" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-4">
          <h3 className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-medium mb-4">
            Time by Project
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={projectData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="hours"
                nameKey="name"
                label={(props) => `${props.name || ""} (${props.value}h)`}
                labelLine={false}
                fontSize={10}
              >
                {projectData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "12px",
                  color: "var(--foreground)",
                  fontSize: "12px",
                  boxShadow: "var(--card-shadow)",
                }}
                formatter={(value) => [`${value} hrs`, "Hours"]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

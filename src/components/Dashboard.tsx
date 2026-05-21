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
      <div className="text-center py-8 text-zinc-400">
        No data to display yet. Start tracking time to see your dashboard.
      </div>
    );
  }

  // Summary stats
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

  // Hours per day (bar chart)
  const byDay = entries.reduce<Record<string, number>>((acc, entry) => {
    const day = format(startOfDay(new Date(entry.started_at)), "MMM dd");
    acc[day] = (acc[day] || 0) + (entry.duration_seconds || 0) / 3600;
    return acc;
  }, {});

  const dailyData = Object.entries(byDay)
    .map(([day, hours]) => ({ day, hours: parseFloat(hours.toFixed(2)) }))
    .reverse();

  // Time per project (pie chart)
  const byProject = entries.reduce<
    Record<string, { name: string; color: string; hours: number }>
  >((acc, entry) => {
    const key = entry.project?.name || "No Project";
    if (!acc[key]) {
      acc[key] = {
        name: key,
        color: entry.project?.color || "#94a3b8",
        hours: 0,
      };
    }
    acc[key].hours += (entry.duration_seconds || 0) / 3600;
    return acc;
  }, {});

  const projectData = Object.values(byProject).map((p) => ({
    ...p,
    hours: parseFloat(p.hours.toFixed(2)),
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Dashboard
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Total Hours
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            {formatHours(totalSeconds)}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Entries
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            {entries.length}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Billable
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            ${totalBillable.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hours per day */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">
            Hours per Day
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="day" fontSize={12} tick={{ fill: "#a1a1aa" }} />
              <YAxis fontSize={12} tick={{ fill: "#a1a1aa" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                  color: "#fafafa",
                }}
              />
              <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Time per project */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">
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
                fontSize={11}
              >
                {projectData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                  color: "#fafafa",
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

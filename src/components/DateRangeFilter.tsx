"use client";

import { useState } from "react";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
} from "date-fns";

type DateRangeFilterProps = {
  onFilter: (from: string | undefined, to: string | undefined) => void;
};

type Preset = "all" | "today" | "this_week" | "this_month" | "last_month" | "custom";

export default function DateRangeFilter({ onFilter }: DateRangeFilterProps) {
  const [preset, setPreset] = useState<Preset>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const applyPreset = (p: Preset) => {
    setPreset(p);
    const now = new Date();

    switch (p) {
      case "all":
        onFilter(undefined, undefined);
        break;
      case "today":
        onFilter(startOfDay(now).toISOString(), endOfDay(now).toISOString());
        break;
      case "this_week":
        onFilter(
          startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
          endOfWeek(now, { weekStartsOn: 1 }).toISOString()
        );
        break;
      case "this_month":
        onFilter(startOfMonth(now).toISOString(), endOfMonth(now).toISOString());
        break;
      case "last_month": {
        const lastMonth = subMonths(now, 1);
        onFilter(
          startOfMonth(lastMonth).toISOString(),
          endOfMonth(lastMonth).toISOString()
        );
        break;
      }
      case "custom":
        break;
    }
  };

  const applyCustom = () => {
    if (customFrom && customTo) {
      onFilter(
        startOfDay(new Date(customFrom)).toISOString(),
        endOfDay(new Date(customTo)).toISOString()
      );
    }
  };

  const presets: { key: Preset; label: string }[] = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "this_week", label: "This Week" },
    { key: "this_month", label: "This Month" },
    { key: "last_month", label: "Last Month" },
    { key: "custom", label: "Custom" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {presets.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => applyPreset(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
              preset === key
                ? "bg-blue-500 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-zinc-400 text-sm">to</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={applyCustom}
            disabled={!customFrom || !customTo}
            className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-300 text-white text-sm font-medium transition cursor-pointer disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from "date-fns";

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
      case "all": onFilter(undefined, undefined); break;
      case "today": onFilter(startOfDay(now).toISOString(), endOfDay(now).toISOString()); break;
      case "this_week": onFilter(startOfWeek(now, { weekStartsOn: 1 }).toISOString(), endOfWeek(now, { weekStartsOn: 1 }).toISOString()); break;
      case "this_month": onFilter(startOfMonth(now).toISOString(), endOfMonth(now).toISOString()); break;
      case "last_month": { const lm = subMonths(now, 1); onFilter(startOfMonth(lm).toISOString(), endOfMonth(lm).toISOString()); break; }
      case "custom": break;
    }
  };

  const applyCustom = () => {
    if (customFrom && customTo) {
      onFilter(startOfDay(new Date(customFrom)).toISOString(), endOfDay(new Date(customTo)).toISOString());
    }
  };

  const presets: { key: Preset; label: string }[] = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "this_week", label: "Week" },
    { key: "this_month", label: "Month" },
    { key: "last_month", label: "Last Mo" },
    { key: "custom", label: "Custom" },
  ];

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-1.5">
        {presets.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => applyPreset(key)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer min-h-[36px] active:scale-95 ${
              preset === key
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "glass-card text-[var(--muted)] hover:text-[var(--foreground)] active:bg-[var(--surface-hover)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-fade-in">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="input-premium px-3 py-2.5 rounded-lg text-sm text-[var(--foreground)] min-h-[44px]"
          />
          <span className="text-[var(--muted)] text-xs text-center">to</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="input-premium px-3 py-2.5 rounded-lg text-sm text-[var(--foreground)] min-h-[44px]"
          />
          <button
            onClick={applyCustom}
            disabled={!customFrom || !customTo}
            className="btn-premium px-4 py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] active:scale-95"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

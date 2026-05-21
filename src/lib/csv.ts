import { format } from "date-fns";
import type { TimeEntry } from "./types";
import { formatHours } from "./format";

export function generateCSV(entries: TimeEntry[]): string {
  const headers = [
    "Date",
    "Task",
    "Project",
    "Client",
    "Start",
    "End",
    "Duration (HH:MM:SS)",
    "Hours",
    "Hourly Rate",
    "Amount",
  ];

  const rows = entries.map((entry) => {
    const hours = (entry.duration_seconds || 0) / 3600;
    const rate = entry.project?.hourly_rate || 0;
    const amount = hours * rate;
    const durationSec = entry.duration_seconds || 0;
    const h = Math.floor(durationSec / 3600);
    const m = Math.floor((durationSec % 3600) / 60);
    const s = durationSec % 60;

    return [
      format(new Date(entry.started_at), "yyyy-MM-dd"),
      entry.task_name,
      entry.project?.name || "",
      entry.project?.client_name || "",
      format(new Date(entry.started_at), "HH:mm"),
      entry.ended_at ? format(new Date(entry.ended_at), "HH:mm") : "",
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      formatHours(durationSec),
      rate ? rate.toFixed(2) : "",
      rate ? amount.toFixed(2) : "",
    ];
  });

  const escape = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const lines = [headers, ...rows].map((row) =>
    row.map((val) => escape(String(val))).join(",")
  );

  return lines.join("\n");
}

export function downloadCSV(entries: TimeEntry[], filename?: string) {
  const csv = generateCSV(entries);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `time-entries-${format(new Date(), "yyyy-MM-dd")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

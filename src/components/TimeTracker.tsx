"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, type TimeEntry } from "@/lib/supabase";

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatHours(totalSeconds: number): string {
  const hours = totalSeconds / 3600;
  return hours.toFixed(2);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TimeTracker() {
  const [taskName, setTaskName] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    const { data, error } = await supabase
      .from("time_entries")
      .select("*")
      .order("started_at", { ascending: false });

    if (error) {
      console.error("Error fetching entries:", error);
      return;
    }

    setEntries(data || []);

    // Check if there's an active (unstopped) entry
    const active = data?.find((e: TimeEntry) => !e.ended_at);
    if (active) {
      setActiveEntry(active);
      setTaskName(active.task_name);
      setIsRunning(true);
    }
  }, []);

  useEffect(() => {
    fetchEntries().finally(() => setLoading(false));
  }, [fetchEntries]);

  // Timer tick
  useEffect(() => {
    if (!isRunning || !activeEntry) return;

    const tick = () => {
      const start = new Date(activeEntry.started_at).getTime();
      const now = Date.now();
      setElapsed(Math.floor((now - start) / 1000));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isRunning, activeEntry]);

  const handleStart = async () => {
    const name = taskName.trim();
    if (!name) return;

    const { data, error } = await supabase
      .from("time_entries")
      .insert({ task_name: name })
      .select()
      .single();

    if (error) {
      console.error("Error starting timer:", error);
      return;
    }

    setActiveEntry(data);
    setIsRunning(true);
    setElapsed(0);
    await fetchEntries();
  };

  const handleStop = async () => {
    if (!activeEntry) return;

    const now = new Date().toISOString();
    const start = new Date(activeEntry.started_at).getTime();
    const durationSeconds = Math.floor((Date.now() - start) / 1000);

    const { error } = await supabase
      .from("time_entries")
      .update({ ended_at: now, duration_seconds: durationSeconds })
      .eq("id", activeEntry.id);

    if (error) {
      console.error("Error stopping timer:", error);
      return;
    }

    setIsRunning(false);
    setActiveEntry(null);
    setElapsed(0);
    setTaskName("");
    await fetchEntries();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("time_entries")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting entry:", error);
      return;
    }

    await fetchEntries();
  };

  const completedEntries = entries.filter((e) => e.ended_at);
  const totalSeconds = completedEntries.reduce(
    (sum, e) => sum + (e.duration_seconds || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Timer Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="text-5xl font-mono font-bold tracking-wider text-zinc-900 dark:text-zinc-100">
            {formatDuration(elapsed)}
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="What are you working on?"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isRunning) handleStart();
            }}
            disabled={isRunning}
            className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition"
          />
          {isRunning ? (
            <button
              onClick={handleStop}
              className="px-8 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition cursor-pointer"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={!taskName.trim()}
              className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white font-semibold transition disabled:cursor-not-allowed cursor-pointer"
            >
              Start
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      {completedEntries.length > 0 && (
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
            <div className="text-right">
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Billable Hours
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatHours(totalSeconds)} hrs
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entries List */}
      {completedEntries.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Time Entries
          </h2>
          <div className="space-y-2">
            {completedEntries.map((entry) => (
              <div
                key={entry.id}
                className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between transition hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {entry.task_name}
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {formatDate(entry.started_at)} &middot;{" "}
                    {formatTime(entry.started_at)} &ndash;{" "}
                    {entry.ended_at ? formatTime(entry.ended_at) : "ongoing"}
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right">
                    <div className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatDuration(entry.duration_seconds || 0)}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {formatHours(entry.duration_seconds || 0)} hrs
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition cursor-pointer"
                    title="Delete entry"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedEntries.length === 0 && !isRunning && (
        <div className="text-center py-12 text-zinc-400">
          <p className="text-lg">No time entries yet</p>
          <p className="text-sm mt-1">
            Enter a task name and hit Start to begin tracking
          </p>
        </div>
      )}
    </div>
  );
}

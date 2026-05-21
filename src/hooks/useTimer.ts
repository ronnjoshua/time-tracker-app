"use client";

import { useState, useEffect } from "react";
import type { TimeEntry } from "@/lib/types";

export function useTimer(activeEntry: TimeEntry | null, paused: boolean) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!activeEntry) {
      setElapsed(0);
      return;
    }

    if (paused) return;

    const tick = () => {
      const start = new Date(activeEntry.started_at).getTime();
      const pausedSeconds = getPausedSeconds(activeEntry.id);
      setElapsed(Math.floor((Date.now() - start) / 1000) - pausedSeconds);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeEntry, paused]);

  return elapsed;
}

// Store pause tracking in localStorage keyed by entry ID
function getPauseKey(entryId: string) {
  return `pause_${entryId}`;
}

export function getPausedSeconds(entryId: string): number {
  try {
    const data = localStorage.getItem(getPauseKey(entryId));
    if (!data) return 0;
    const { totalPaused, pauseStart } = JSON.parse(data);
    // If currently paused, add time since pause started
    if (pauseStart) {
      return totalPaused + Math.floor((Date.now() - pauseStart) / 1000);
    }
    return totalPaused || 0;
  } catch {
    return 0;
  }
}

export function startPause(entryId: string) {
  const current = getPausedSeconds(entryId);
  localStorage.setItem(
    getPauseKey(entryId),
    JSON.stringify({ totalPaused: current, pauseStart: Date.now() })
  );
}

export function endPause(entryId: string) {
  const totalPaused = getPausedSeconds(entryId);
  localStorage.setItem(
    getPauseKey(entryId),
    JSON.stringify({ totalPaused, pauseStart: null })
  );
}

export function clearPause(entryId: string) {
  localStorage.removeItem(getPauseKey(entryId));
}

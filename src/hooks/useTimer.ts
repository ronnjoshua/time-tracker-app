"use client";

import { useState, useEffect } from "react";
import type { TimeEntry } from "@/lib/types";

export function useTimer(activeEntry: TimeEntry | null) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!activeEntry) {
      setElapsed(0);
      return;
    }

    const tick = () => {
      const start = new Date(activeEntry.started_at).getTime();
      setElapsed(Math.floor((Date.now() - start) / 1000));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeEntry]);

  return elapsed;
}

"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { TimeEntry } from "@/lib/types";

export function useEntries() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(
    async (filters?: { from?: string; to?: string }) => {
      let query = supabase
        .from("time_entries")
        .select("*, project:projects(*)")
        .order("started_at", { ascending: false });

      if (filters?.from) {
        query = query.gte("started_at", filters.from);
      }
      if (filters?.to) {
        query = query.lte("started_at", filters.to);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching entries:", error);
        return [];
      }

      setEntries(data || []);
      setLoading(false);
      return data || [];
    },
    []
  );

  const createEntry = async (taskName: string, projectId?: string | null) => {
    const insertData: Record<string, unknown> = { task_name: taskName };
    if (projectId) insertData.project_id = projectId;

    const { data, error } = await supabase
      .from("time_entries")
      .insert(insertData)
      .select("*, project:projects(*)")
      .single();

    if (error) {
      console.error("Error creating entry:", error);
      return null;
    }

    return data as TimeEntry;
  };

  const stopEntry = async (entry: TimeEntry) => {
    const now = new Date().toISOString();
    const start = new Date(entry.started_at).getTime();
    const durationSeconds = Math.floor((Date.now() - start) / 1000);

    const { error } = await supabase
      .from("time_entries")
      .update({ ended_at: now, duration_seconds: durationSeconds })
      .eq("id", entry.id);

    if (error) {
      console.error("Error stopping entry:", error);
      return false;
    }
    return true;
  };

  const updateEntry = async (
    id: string,
    updates: {
      task_name?: string;
      started_at?: string;
      ended_at?: string;
      project_id?: string | null;
    }
  ) => {
    // Recalculate duration if times changed
    const updateData: Record<string, unknown> = { ...updates };
    if (updates.started_at && updates.ended_at) {
      const start = new Date(updates.started_at).getTime();
      const end = new Date(updates.ended_at).getTime();
      updateData.duration_seconds = Math.floor((end - start) / 1000);
    }

    const { error } = await supabase
      .from("time_entries")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error updating entry:", error);
      return false;
    }
    return true;
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase
      .from("time_entries")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting entry:", error);
      return false;
    }
    return true;
  };

  const completedEntries = entries.filter((e) => e.ended_at);
  const activeEntry = entries.find((e) => !e.ended_at) || null;

  return {
    entries,
    completedEntries,
    activeEntry,
    loading,
    fetchEntries,
    createEntry,
    stopEntry,
    updateEntry,
    deleteEntry,
  };
}

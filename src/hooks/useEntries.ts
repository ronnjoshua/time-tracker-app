"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { TimeEntry } from "@/lib/types";

async function getUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

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
    const userId = await getUserId();
    const insertData: Record<string, unknown> = { task_name: taskName };
    if (projectId) insertData.project_id = projectId;
    if (userId) insertData.user_id = userId;

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

  const stopEntry = async (entry: TimeEntry, pausedSeconds: number = 0) => {
    const now = new Date().toISOString();
    const start = new Date(entry.started_at).getTime();
    const durationSeconds = Math.floor((Date.now() - start) / 1000) - pausedSeconds;

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

  const createManualEntry = async (data: {
    task_name: string;
    started_at: string;
    ended_at: string;
    project_id?: string | null;
  }) => {
    const userId = await getUserId();
    const start = new Date(data.started_at).getTime();
    const end = new Date(data.ended_at).getTime();
    const durationSeconds = Math.floor((end - start) / 1000);

    const insertData: Record<string, unknown> = {
      task_name: data.task_name,
      started_at: data.started_at,
      ended_at: data.ended_at,
      duration_seconds: durationSeconds,
    };
    if (data.project_id) insertData.project_id = data.project_id;
    if (userId) insertData.user_id = userId;

    const { data: entry, error } = await supabase
      .from("time_entries")
      .insert(insertData)
      .select("*, project:projects(*)")
      .single();

    if (error) {
      console.error("Error creating manual entry:", error);
      return null;
    }

    return entry as TimeEntry;
  };

  const duplicateEntry = async (entry: TimeEntry) => {
    const userId = await getUserId();
    const now = new Date();
    const durationMs = (entry.duration_seconds || 0) * 1000;
    const startedAt = new Date(now.getTime() - durationMs).toISOString();

    const insertData: Record<string, unknown> = {
      task_name: entry.task_name,
      started_at: startedAt,
      ended_at: now.toISOString(),
      duration_seconds: entry.duration_seconds,
    };
    if (entry.project_id) insertData.project_id = entry.project_id;
    if (userId) insertData.user_id = userId;

    const { data, error } = await supabase
      .from("time_entries")
      .insert(insertData)
      .select("*, project:projects(*)")
      .single();

    if (error) {
      console.error("Error duplicating entry:", error);
      return null;
    }

    return data as TimeEntry;
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
    createManualEntry,
    duplicateEntry,
    stopEntry,
    updateEntry,
    deleteEntry,
  };
}

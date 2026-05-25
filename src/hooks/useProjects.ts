"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/lib/types";

async function getUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("archived", false)
      .order("name");

    if (error) {
      console.error("Error fetching projects:", error);
      return;
    }

    setProjects(data || []);
    setLoading(false);
  }, []);

  const createProject = async (project: {
    name: string;
    client_name?: string;
    hourly_rate?: number;
    color?: string;
  }) => {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from("projects")
      .insert({ ...project, ...(userId ? { user_id: userId } : {}) })
      .select()
      .single();

    if (error) {
      console.error("Error creating project:", error);
      return null;
    }

    await fetchProjects();
    return data as Project;
  };

  const updateProject = async (
    id: string,
    updates: Partial<Omit<Project, "id" | "created_at">>
  ) => {
    const { error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating project:", error);
      return false;
    }

    await fetchProjects();
    return true;
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase
      .from("projects")
      .update({ archived: true })
      .eq("id", id);

    if (error) {
      console.error("Error archiving project:", error);
      return false;
    }

    await fetchProjects();
    return true;
  };

  return {
    projects,
    loading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}

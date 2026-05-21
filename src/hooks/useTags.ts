"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Tag } from "@/lib/types";

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTags = useCallback(async () => {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching tags:", error);
      return;
    }

    setTags(data || []);
    setLoading(false);
  }, []);

  const createTag = async (tag: { name: string; color?: string }) => {
    const { data, error } = await supabase
      .from("tags")
      .insert(tag)
      .select()
      .single();

    if (error) {
      console.error("Error creating tag:", error);
      return null;
    }

    await fetchTags();
    return data as Tag;
  };

  const deleteTag = async (id: string) => {
    const { error } = await supabase.from("tags").delete().eq("id", id);

    if (error) {
      console.error("Error deleting tag:", error);
      return false;
    }

    await fetchTags();
    return true;
  };

  const getEntryTags = async (entryId: string): Promise<Tag[]> => {
    const { data, error } = await supabase
      .from("time_entry_tags")
      .select("tag:tags(*)")
      .eq("time_entry_id", entryId);

    if (error) {
      console.error("Error fetching entry tags:", error);
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((d: any) => d.tag as Tag);
  };

  const setEntryTags = async (entryId: string, tagIds: string[]) => {
    // Remove existing tags
    await supabase
      .from("time_entry_tags")
      .delete()
      .eq("time_entry_id", entryId);

    if (tagIds.length === 0) return true;

    // Insert new tags
    const { error } = await supabase.from("time_entry_tags").insert(
      tagIds.map((tagId) => ({
        time_entry_id: entryId,
        tag_id: tagId,
      }))
    );

    if (error) {
      console.error("Error setting entry tags:", error);
      return false;
    }

    return true;
  };

  return {
    tags,
    loading,
    fetchTags,
    createTag,
    deleteTag,
    getEntryTags,
    setEntryTags,
  };
}

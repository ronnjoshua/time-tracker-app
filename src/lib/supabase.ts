import { createSupabaseBrowser } from "./supabase-browser";

// Browser client singleton for use in client components and hooks
export const supabase = createSupabaseBrowser();

// Re-export types for convenience
export type { TimeEntry, Project, Tag, Profile } from "./types";

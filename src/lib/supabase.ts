import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type TimeEntry = {
  id: string;
  task_name: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  created_at: string;
};

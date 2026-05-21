export type TimeEntry = {
  id: string;
  task_name: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  project_id: string | null;
  user_id: string | null;
  created_at: string;
  // Joined data
  project?: Project | null;
  tags?: Tag[];
};

export type Project = {
  id: string;
  user_id: string | null;
  name: string;
  client_name: string | null;
  hourly_rate: number | null;
  color: string;
  archived: boolean;
  created_at: string;
};

export type Tag = {
  id: string;
  user_id: string | null;
  name: string;
  color: string;
  created_at: string;
};

export type Profile = {
  id: string;
  display_name: string | null;
  default_hourly_rate: number;
  created_at: string;
};

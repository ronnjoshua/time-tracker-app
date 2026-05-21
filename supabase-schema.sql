-- Run this in your Supabase SQL Editor to create the time_entries table

create table time_entries (
  id uuid default gen_random_uuid() primary key,
  task_name text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer,
  created_at timestamptz not null default now()
);

-- Index for faster queries by date
create index idx_time_entries_started_at on time_entries (started_at desc);

-- Enable Row Level Security (optional — disable if you're the only user)
-- alter table time_entries enable row level security;

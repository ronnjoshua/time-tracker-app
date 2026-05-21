-- Run this in your Supabase SQL Editor

-- ============================================
-- PROJECTS TABLE
-- ============================================
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  name text not null,
  client_name text,
  hourly_rate numeric(10,2),
  color text default '#3b82f6',
  archived boolean default false,
  budget_hours numeric(10,2),
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================
-- TAGS TABLE
-- ============================================
create table if not exists tags (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  name text not null,
  color text default '#6b7280',
  created_at timestamptz not null default now()
);

-- ============================================
-- TIME ENTRIES TABLE
-- ============================================
create table if not exists time_entries (
  id uuid default gen_random_uuid() primary key,
  task_name text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer,
  project_id uuid references projects(id) on delete set null,
  user_id uuid,
  created_at timestamptz not null default now()
);

-- ============================================
-- TIME ENTRY TAGS (many-to-many junction)
-- ============================================
create table if not exists time_entry_tags (
  time_entry_id uuid references time_entries(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (time_entry_id, tag_id)
);

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_time_entries_started_at on time_entries (started_at desc);
create index if not exists idx_time_entries_project_id on time_entries (project_id);

-- ============================================
-- MIGRATION: If you already have a time_entries table, run these:
-- ============================================
-- alter table time_entries add column if not exists project_id uuid references projects(id) on delete set null;
-- alter table time_entries add column if not exists user_id uuid;

-- ============================================
-- MIGRATION: Add budget_hours and notes to projects:
-- ============================================
-- alter table projects add column if not exists budget_hours numeric(10,2);
-- alter table projects add column if not exists notes text;

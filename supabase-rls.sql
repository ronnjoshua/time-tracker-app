-- ============================================
-- RUN THIS AFTER ENABLING GOOGLE AUTH
-- ============================================

-- 1. Enable RLS on all tables
alter table time_entries enable row level security;
alter table projects enable row level security;
alter table tags enable row level security;
alter table time_entry_tags enable row level security;

-- 2. RLS policies for time_entries
create policy "Users see own entries" on time_entries
  for select using (auth.uid() = user_id);
create policy "Users insert own entries" on time_entries
  for insert with check (auth.uid() = user_id);
create policy "Users update own entries" on time_entries
  for update using (auth.uid() = user_id);
create policy "Users delete own entries" on time_entries
  for delete using (auth.uid() = user_id);

-- 3. RLS policies for projects
create policy "Users see own projects" on projects
  for select using (auth.uid() = user_id);
create policy "Users insert own projects" on projects
  for insert with check (auth.uid() = user_id);
create policy "Users update own projects" on projects
  for update using (auth.uid() = user_id);
create policy "Users delete own projects" on projects
  for delete using (auth.uid() = user_id);

-- 4. RLS policies for tags
create policy "Users see own tags" on tags
  for select using (auth.uid() = user_id);
create policy "Users insert own tags" on tags
  for insert with check (auth.uid() = user_id);
create policy "Users update own tags" on tags
  for update using (auth.uid() = user_id);
create policy "Users delete own tags" on tags
  for delete using (auth.uid() = user_id);

-- 5. RLS policies for time_entry_tags (based on entry ownership)
create policy "Users manage own entry tags" on time_entry_tags
  for all using (
    exists (
      select 1 from time_entries
      where time_entries.id = time_entry_tags.time_entry_id
      and time_entries.user_id = auth.uid()
    )
  );

-- ============================================
-- BACKFILL: Assign existing data to your user
-- Replace YOUR_USER_ID with your actual user ID from Supabase Auth
-- You can find it in Authentication > Users in Supabase dashboard
-- ============================================
-- update time_entries set user_id = 'YOUR_USER_ID' where user_id is null;
-- update projects set user_id = 'YOUR_USER_ID' where user_id is null;
-- update tags set user_id = 'YOUR_USER_ID' where user_id is null;

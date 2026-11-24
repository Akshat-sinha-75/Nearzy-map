-- =====================================================================
-- Nearzy Survey Map: lock the database to the survey team only
-- =====================================================================
-- Run once in the Supabase dashboard of the map's project:
--   SQL Editor -> New query -> paste this whole file -> Run.
-- Safe to run again; it replaces its own rules each time.
--
-- Before running:
--   1. Change the two emails in STEP 3 to your team's real emails.
--   2. Authentication -> Sign In / Providers -> turn OFF
--      "Allow new users to sign up" (only the admin creates accounts).
--   3. Authentication -> Users -> "Add user" -> "Create new user" for
--      each team member (tick "Auto Confirm User"), and give them their
--      password privately.
--
-- To add someone later:   insert into public.survey_team (email, role) values ('name@example.com', 'editor');
-- View-only access:       use 'viewer' instead of 'editor'.
-- To remove someone:      delete from public.survey_team where email = 'name@example.com';
-- =====================================================================

begin;

-- STEP 1: the team list. Only the dashboard (or this SQL editor) can read or change it.
create table if not exists public.survey_team (
  email     text primary key check (email = lower(email)),
  role      text not null default 'editor' check (role in ('editor', 'viewer')),
  added_at  timestamptz not null default now()
);
alter table public.survey_team enable row level security;
revoke all on public.survey_team from anon, authenticated;

-- STEP 2: helper that tells the database the signed-in person's role
-- ('editor', 'viewer', or nothing). It only trusts confirmed accounts.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.survey_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select t.role
  from public.survey_team t
  join auth.users u on lower(u.email) = t.email
  where u.id = auth.uid()
    and u.email_confirmed_at is not null
  limit 1
$$;
revoke all on function private.survey_role() from public, anon;
grant execute on function private.survey_role() to authenticated;

-- The app calls this to decide what to show (map only, or add/edit/delete too).
create or replace function public.my_survey_role()
returns text
language sql
stable
security invoker
set search_path = ''
as $$ select private.survey_role() $$;
revoke all on function public.my_survey_role() from public, anon;
grant execute on function public.my_survey_role() to authenticated;

-- STEP 3: the first team members. CHANGE THESE EMAILS (lowercase).
insert into public.survey_team (email, role) values
  ('first.person@example.com', 'editor'),
  ('second.person@example.com', 'editor')
on conflict (email) do update set role = excluded.role;

-- STEP 4: lock the shops table. Remove every old rule (including any
-- "anyone can read/insert" rules) and allow only the team.
alter table public.shops enable row level security;

do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'shops' loop
    execute format('drop policy %I on public.shops', p.policyname);
  end loop;
end $$;

revoke all on public.shops from anon;
grant select, insert, update, delete on public.shops to authenticated;

create policy "team can view shops" on public.shops
  for select to authenticated
  using ((select private.survey_role()) is not null);

create policy "editors can add shops" on public.shops
  for insert to authenticated
  with check ((select private.survey_role()) = 'editor');

create policy "editors can edit shops" on public.shops
  for update to authenticated
  using ((select private.survey_role()) = 'editor')
  with check ((select private.survey_role()) = 'editor');

create policy "editors can delete shops" on public.shops
  for delete to authenticated
  using ((select private.survey_role()) = 'editor');

-- STEP 5: remember who added each shop (filled in automatically).
alter table public.shops
  add column if not exists created_by uuid default auth.uid() references auth.users (id) on delete set null;

commit;

-- =====================================================================
-- STEP 6 (separate, optional): remove the 60 test shops.
-- First run only this line to see exactly what would be deleted:
--
--   select id, shop_name from public.shops where shop_name ~* '^(dummy shop|dense area shop) [0-9]+$';
--
-- If the list is only test shops, run:
--
--   delete from public.shops where shop_name ~* '^(dummy shop|dense area shop) [0-9]+$';
-- =====================================================================

-- CHECK: after running, this should return 0 rows when you are NOT logged in
-- (open the live site in a private window: it should show only the login screen).

-- 0003_rls.sql — Row Level Security policies for all CSRA tables.

-- ---------------------------------------------------------------------------
-- Helper: current_user_role()
-- Security-definer so it can read public.users.role even when RLS is enabled
-- on that table. Used by policies below to branch on reporter vs mother.
-- ---------------------------------------------------------------------------
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS on all tables
-- ---------------------------------------------------------------------------
alter table public.users                          enable row level security;
alter table public.reporter_details               enable row level security;
alter table public.maternal_basic                 enable row level security;
alter table public.maternal_screening             enable row level security;
alter table public.maternal_confirmatory          enable row level security;
alter table public.baby_basic                     enable row level security;
alter table public.baby_serological               enable row level security;
alter table public.mother_self_report             enable row level security;
alter table public.mother_self_report_baby_health enable row level security;

-- ---------------------------------------------------------------------------
-- public.users
-- ---------------------------------------------------------------------------
drop policy if exists users_select on public.users;
create policy users_select
  on public.users
  for select
  using (id = auth.uid());

drop policy if exists users_update on public.users;
create policy users_update
  on public.users
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- No insert policy: only service role can insert (bypasses RLS).
-- No delete policy.

-- ---------------------------------------------------------------------------
-- public.reporter_details
-- ---------------------------------------------------------------------------
drop policy if exists reporter_details_select on public.reporter_details;
create policy reporter_details_select
  on public.reporter_details
  for select
  using (public.current_user_role() = 'reporter');

drop policy if exists reporter_details_insert on public.reporter_details;
create policy reporter_details_insert
  on public.reporter_details
  for insert
  with check (
    user_id = auth.uid()
    and public.current_user_role() = 'reporter'
  );

drop policy if exists reporter_details_update on public.reporter_details;
create policy reporter_details_update
  on public.reporter_details
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- public.maternal_basic (reporter-only)
-- ---------------------------------------------------------------------------
drop policy if exists maternal_basic_select on public.maternal_basic;
create policy maternal_basic_select
  on public.maternal_basic
  for select
  using (public.current_user_role() = 'reporter');

drop policy if exists maternal_basic_insert on public.maternal_basic;
create policy maternal_basic_insert
  on public.maternal_basic
  for insert
  with check (public.current_user_role() = 'reporter');

drop policy if exists maternal_basic_update on public.maternal_basic;
create policy maternal_basic_update
  on public.maternal_basic
  for update
  using (public.current_user_role() = 'reporter')
  with check (public.current_user_role() = 'reporter');

-- ---------------------------------------------------------------------------
-- public.maternal_screening (reporter-only)
-- ---------------------------------------------------------------------------
drop policy if exists maternal_screening_select on public.maternal_screening;
create policy maternal_screening_select
  on public.maternal_screening
  for select
  using (public.current_user_role() = 'reporter');

drop policy if exists maternal_screening_insert on public.maternal_screening;
create policy maternal_screening_insert
  on public.maternal_screening
  for insert
  with check (public.current_user_role() = 'reporter');

drop policy if exists maternal_screening_update on public.maternal_screening;
create policy maternal_screening_update
  on public.maternal_screening
  for update
  using (public.current_user_role() = 'reporter')
  with check (public.current_user_role() = 'reporter');

-- ---------------------------------------------------------------------------
-- public.maternal_confirmatory (reporter-only)
-- ---------------------------------------------------------------------------
drop policy if exists maternal_confirmatory_select on public.maternal_confirmatory;
create policy maternal_confirmatory_select
  on public.maternal_confirmatory
  for select
  using (public.current_user_role() = 'reporter');

drop policy if exists maternal_confirmatory_insert on public.maternal_confirmatory;
create policy maternal_confirmatory_insert
  on public.maternal_confirmatory
  for insert
  with check (public.current_user_role() = 'reporter');

drop policy if exists maternal_confirmatory_update on public.maternal_confirmatory;
create policy maternal_confirmatory_update
  on public.maternal_confirmatory
  for update
  using (public.current_user_role() = 'reporter')
  with check (public.current_user_role() = 'reporter');

-- ---------------------------------------------------------------------------
-- public.baby_basic (reporter-only)
-- ---------------------------------------------------------------------------
drop policy if exists baby_basic_select on public.baby_basic;
create policy baby_basic_select
  on public.baby_basic
  for select
  using (public.current_user_role() = 'reporter');

drop policy if exists baby_basic_insert on public.baby_basic;
create policy baby_basic_insert
  on public.baby_basic
  for insert
  with check (public.current_user_role() = 'reporter');

drop policy if exists baby_basic_update on public.baby_basic;
create policy baby_basic_update
  on public.baby_basic
  for update
  using (public.current_user_role() = 'reporter')
  with check (public.current_user_role() = 'reporter');

-- ---------------------------------------------------------------------------
-- public.baby_serological (reporter-only)
-- ---------------------------------------------------------------------------
drop policy if exists baby_serological_select on public.baby_serological;
create policy baby_serological_select
  on public.baby_serological
  for select
  using (public.current_user_role() = 'reporter');

drop policy if exists baby_serological_insert on public.baby_serological;
create policy baby_serological_insert
  on public.baby_serological
  for insert
  with check (public.current_user_role() = 'reporter');

drop policy if exists baby_serological_update on public.baby_serological;
create policy baby_serological_update
  on public.baby_serological
  for update
  using (public.current_user_role() = 'reporter')
  with check (public.current_user_role() = 'reporter');

-- ---------------------------------------------------------------------------
-- public.mother_self_report
-- ---------------------------------------------------------------------------
drop policy if exists mother_self_report_select on public.mother_self_report;
create policy mother_self_report_select
  on public.mother_self_report
  for select
  using (
    user_id = auth.uid()
    or public.current_user_role() = 'reporter'
  );

drop policy if exists mother_self_report_insert on public.mother_self_report;
create policy mother_self_report_insert
  on public.mother_self_report
  for insert
  with check (true);

drop policy if exists mother_self_report_update on public.mother_self_report;
create policy mother_self_report_update
  on public.mother_self_report
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- public.mother_self_report_baby_health
-- ---------------------------------------------------------------------------
drop policy if exists mother_self_report_baby_health_select on public.mother_self_report_baby_health;
create policy mother_self_report_baby_health_select
  on public.mother_self_report_baby_health
  for select
  using (
    exists (
      select 1
      from public.mother_self_report m
      where m.id = mother_self_report_baby_health.report_id
        and (
          m.user_id = auth.uid()
          or public.current_user_role() = 'reporter'
        )
    )
  );

drop policy if exists mother_self_report_baby_health_insert on public.mother_self_report_baby_health;
create policy mother_self_report_baby_health_insert
  on public.mother_self_report_baby_health
  for insert
  with check (true);

-- No update, no delete on mother_self_report_baby_health.

-- ---------------------------------------------------------------------------
-- Phase 4 additions
-- ---------------------------------------------------------------------------
-- public.current_user_role() is security definer, but Postgres still requires
-- callers to hold EXECUTE on the function. Grant it to anon + authenticated so
-- RLS policies that call it (every reporter-gated policy above, plus the
-- mother_self_report policies) work for both anonymous and signed-in users.
grant execute on function public.current_user_role() to anon, authenticated;

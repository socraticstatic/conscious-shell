/*
  # app_logs — no anon select path, scan-free deny

  Even after the initplan fix (20260707121500), anon selects on app_logs
  still hit SQLSTATE 57014: is_approved() is evaluated once, but its false
  result leaves an RLS qual that zero rows can satisfy, and RLS's
  security-barrier semantics keep it as a per-row Filter inside the scan.
  Postgres must walk all ~414k rows (~460MB) to prove nothing matches,
  which alone blows the anon role's 3s statement_timeout.

  Fix: remove the anon select path entirely. With no permissive select
  policy applicable to anon, RLS resolves to constant false at plan time —
  no scan, fast deny. Approved authenticated users keep read access via a
  single permissive policy. Residual scan cost for authenticated-but-
  unapproved probers is accepted (rare, self-deanonymizing).

  Drops BOTH existing select policies ("Anyone can read logs" permissive,
  "approved_only_select" restrictive) — the pg_policies cmd='SELECT'
  filter guarantees insert policies (the gate page's error telemetry
  path) are untouched. Each dropped policy is raised as a notice.
*/

do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'app_logs' and cmd = 'SELECT'
  loop
    raise notice 'dropping select policy on app_logs: %', pol.policyname;
    execute format('drop policy %I on public.app_logs', pol.policyname);
  end loop;
end $$;

create policy app_logs_select_approved on public.app_logs
  for select to authenticated
  using ((select public.is_approved()));

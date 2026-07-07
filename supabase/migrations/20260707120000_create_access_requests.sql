/*
  # Access requests — the department's intake ledger

  One row per identity that has ever asked to enter. Status lifecycle:
  pending -> approved | denied | revoked.

  Security: RLS enabled with NO client policies at all. Visitors must never
  be able to read their own status — a readable "denied" tells the person
  they were seen and judged; an eternal "pending" tells them nothing.
  Only the service role (edge function, dashboard) touches this table.
*/

create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'denied', 'revoked')),
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  note text,
  unique (user_id)
);

alter table public.access_requests enable row level security;
-- No policies. Deny-all for anon and authenticated. Service role bypasses RLS.

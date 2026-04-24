-- visitor_sessions: one row per anonymous visitor, upserted on conflict
create table if not exists visitor_sessions (
  visitor_id text primary key,
  persona text,
  persona_confidence numeric,
  signals jsonb,
  sessions_count integer default 1,
  last_seen timestamptz default now(),
  created_at timestamptz default now()
);

alter table visitor_sessions enable row level security;

create policy "anon insert/upsert" on visitor_sessions
  for insert with check (true);

create policy "anon update own" on visitor_sessions
  for update using (true);

-- visitor_events: append-only event log
create table if not exists visitor_events (
  id uuid primary key default gen_random_uuid(),
  visitor_id text,
  type text,
  payload jsonb,
  created_at timestamptz default now()
);

alter table visitor_events enable row level security;

create policy "anon insert" on visitor_events
  for insert with check (true);

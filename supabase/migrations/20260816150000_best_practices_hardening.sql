/*
  # Best-practices hardening — 2026-08-16 audit findings 2-4

  2. app_logs was world-readable and rendered by LogViewer, so anyone with
     the (public) anon key could insert rows that display to every visitor.
     Public SELECT is dropped; LogViewer now renders the local session buffer
     instead. INSERT stays open (the console logger needs it) but bounded so
     the table can't be bulk-filled with megabyte rows.

  3. visitor_sessions had UPDATE ... USING (true): one unfiltered PostgREST
     call could overwrite persona/signals on every row. Writes now go through
     sync_visitor_session(), scoped to the caller-supplied visitor_id. Ids are
     client-generated, never SELECTable, so the blast radius is rows whose id
     you already hold — i.e. your own.

  4. contact_submissions accepted inserts of any size. Same bound-the-insert
     treatment; limits mirror the client-side validation in Contact.tsx.
*/

-- 2. app_logs -----------------------------------------------------------
drop policy if exists "Anyone can read logs" on public.app_logs;
drop policy if exists "Anyone can insert logs" on public.app_logs;

create policy "Anyone can insert bounded logs"
  on public.app_logs
  for insert
  to anon, authenticated
  with check (
    char_length(message) <= 4000
    and char_length(coalesce(source, '')) <= 200
    and char_length(coalesce(url, '')) <= 2000
    and char_length(coalesce(user_agent, '')) <= 1000
    and char_length(coalesce(session_id, '')) <= 64
  );

-- 3. visitor_sessions ---------------------------------------------------
drop policy if exists "Anon can insert own session" on public.visitor_sessions;
drop policy if exists "Anon can update own session" on public.visitor_sessions;

create or replace function public.sync_visitor_session(
  p_visitor_id text,
  p_persona text,
  p_confidence numeric,
  p_signals jsonb,
  p_sessions_count integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Bounds gate both the insert and update paths; silently drop junk the
  -- same way the old RLS rejection was swallowed client-side.
  if p_visitor_id is null
     or char_length(p_visitor_id) not between 8 and 64
     or char_length(coalesce(p_persona, '')) > 100
     or pg_column_size(p_signals) > 16384
     or p_sessions_count not between 0 and 100000 then
    return;
  end if;

  insert into visitor_sessions
    (visitor_id, persona, persona_confidence, signals, sessions_count, last_seen)
  values
    (p_visitor_id, p_persona, p_confidence, p_signals, p_sessions_count, now())
  on conflict (visitor_id) do update set
    persona            = excluded.persona,
    persona_confidence = excluded.persona_confidence,
    signals            = excluded.signals,
    sessions_count     = excluded.sessions_count,
    last_seen          = now();
end;
$$;

revoke all on function public.sync_visitor_session(text, text, numeric, jsonb, integer) from public;
grant execute on function public.sync_visitor_session(text, text, numeric, jsonb, integer) to anon, authenticated;

-- 4. contact_submissions ------------------------------------------------
drop policy if exists "allow anon insert" on public.contact_submissions;

create policy "allow bounded anon insert"
  on public.contact_submissions
  for insert
  to anon
  with check (
    char_length(name) between 1 and 200
    and char_length(email) between 3 and 320
    and position('@' in email) > 1
    and char_length(message) between 20 and 5000
  );

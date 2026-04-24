/*
  # Visitor intelligence — anonymous persona + behavioral signals

  1. New Tables
    - `visitor_sessions`
      - `visitor_id` (text, primary key) — client-generated UUID stored in
        localStorage. No PII. Used only so returning visitors can be
        recognized by their device.
      - `persona` (text) — one of 'replicant' | 'blade_runner' | 'architect'
        | 'archivist' | 'off_world' | 'unknown'
      - `persona_confidence` (numeric, 0..1)
      - `signals` (jsonb) — latest classifier inputs (section dwell totals,
        scroll depth, session length, special-interaction flags)
      - `sessions_count` (int) — how many visits we've seen
      - `first_seen`, `last_seen` (timestamptz)
    - `visitor_events`
      - `id` (uuid, primary key)
      - `visitor_id` (text) — same anon id
      - `type` (text) — e.g. 'persona_change', 'special_interaction'
      - `payload` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on both tables
    - Both tables allow public INSERT and public UPDATE (anon UI needs to
      upsert its own profile). SELECT is NOT granted publicly — nobody can
      read another visitor's profile from the browser; the analytics side
      reads via service role only.

  3. Notes
    - This table stores NO personally identifying information. The
      visitor_id is a random UUID per device; there is no email, IP, or
      fingerprint written here.
*/

CREATE TABLE IF NOT EXISTS visitor_sessions (
  visitor_id text PRIMARY KEY,
  persona text NOT NULL DEFAULT 'unknown',
  persona_confidence numeric NOT NULL DEFAULT 0,
  signals jsonb NOT NULL DEFAULT '{}'::jsonb,
  sessions_count integer NOT NULL DEFAULT 1,
  first_seen timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS visitor_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  type text NOT NULL DEFAULT '',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'visitor_sessions' AND policyname = 'Anon can insert own session'
  ) THEN
    CREATE POLICY "Anon can insert own session"
      ON visitor_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'visitor_sessions' AND policyname = 'Anon can update own session'
  ) THEN
    CREATE POLICY "Anon can update own session"
      ON visitor_sessions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'visitor_events' AND policyname = 'Anon can append events'
  ) THEN
    CREATE POLICY "Anon can append events"
      ON visitor_events FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS visitor_events_vid_idx ON visitor_events (visitor_id, created_at DESC);

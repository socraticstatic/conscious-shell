/*
  # Design-battle rounds (scifi archivist vs goth archivist)

  1. New Tables
    - `design_rounds`
      - `id` (uuid, primary key)
      - `round_number` (int) — monotonic counter
      - `agent` (text) — 'scifi' or 'goth'
      - `title` (text) — proposed design name
      - `palette` (jsonb) — array of hex colors
      - `motif` (text) — primary visual element
      - `material` (text) — surface/texture
      - `typography` (text) — typeface mood
      - `critique` (text) — one-line ripost at the opponent
      - `score` (int) — running score for the speaking agent after this round
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled
    - Public SELECT so the transcript is visible to everyone
    - Public INSERT so the in-browser battle can persist rounds (this is an
      ephemeral art piece — no sensitive data, matches the pattern used by
      app_logs in this project)

  3. Indexes
    - created_at DESC for fast recent-fetches
*/

CREATE TABLE IF NOT EXISTS design_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_number integer NOT NULL DEFAULT 0,
  agent text NOT NULL DEFAULT 'scifi',
  title text NOT NULL DEFAULT '',
  palette jsonb NOT NULL DEFAULT '[]'::jsonb,
  motif text NOT NULL DEFAULT '',
  material text NOT NULL DEFAULT '',
  typography text NOT NULL DEFAULT '',
  critique text NOT NULL DEFAULT '',
  score integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE design_rounds ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'design_rounds' AND policyname = 'Public can read design rounds'
  ) THEN
    CREATE POLICY "Public can read design rounds"
      ON design_rounds FOR SELECT TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'design_rounds' AND policyname = 'Public can append design rounds'
  ) THEN
    CREATE POLICY "Public can append design rounds"
      ON design_rounds FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS design_rounds_created_at_idx ON design_rounds (created_at DESC);

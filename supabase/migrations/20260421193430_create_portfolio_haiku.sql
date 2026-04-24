/*
  # Create portfolio_haiku table

  1. New Tables
    - `portfolio_haiku`
      - `id` (uuid, primary key) — unique row id
      - `line1` (text) — first line (roughly 5 syllables)
      - `line2` (text) — second line (roughly 7 syllables)
      - `line3` (text) — third line (roughly 5 syllables)
      - `source` (text) — collection attribution, e.g. "50 COVID Haiku Epiphanies"
      - `mood` (text) — short mood tag used for styling/filtering
      - `order_index` (integer) — display ordering
      - `created_at` (timestamptz) — creation timestamp

  2. Security
    - Enable RLS on `portfolio_haiku`
    - Add a SELECT-only policy for `anon` and `authenticated`
    - No mutation policies; only service role can write

  3. Notes
    - Public display content. Rotates in the /etc/haiku section of the portfolio.
*/

CREATE TABLE IF NOT EXISTS portfolio_haiku (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line1 text NOT NULL DEFAULT '',
  line2 text NOT NULL DEFAULT '',
  line3 text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT '',
  mood text NOT NULL DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE portfolio_haiku ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'portfolio_haiku'
      AND policyname = 'Public can read haiku'
  ) THEN
    CREATE POLICY "Public can read haiku"
      ON portfolio_haiku
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

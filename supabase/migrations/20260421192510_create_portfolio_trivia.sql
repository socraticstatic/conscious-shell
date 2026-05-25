/*
  # Create portfolio_trivia table

  1. New Tables
    - `portfolio_trivia`
      - `id` (uuid, primary key) — unique row id
      - `category` (text) — grouping label such as `origin`, `language`, `numbers`, `rituals`, `quirks`
      - `label` (text) — short key/left-side label
      - `value` (text) — the actual fact shown to the reader
      - `glyph` (text) — optional lucide icon name
      - `order_index` (integer) — display ordering
      - `created_at` (timestamptz) — created time

  2. Security
    - Enable RLS on `portfolio_trivia`
    - Add a permissive SELECT policy for `anon` and `authenticated` roles so the site can render this content publicly
    - No INSERT / UPDATE / DELETE policies; only service role can mutate

  3. Notes
    - This powers the new "Human Layer" / dossier section of the portfolio
    - All values are public trivia; no private data is stored here
*/

CREATE TABLE IF NOT EXISTS portfolio_trivia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'misc',
  label text NOT NULL DEFAULT '',
  value text NOT NULL DEFAULT '',
  glyph text NOT NULL DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE portfolio_trivia ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'portfolio_trivia'
      AND policyname = 'Public can read trivia'
  ) THEN
    CREATE POLICY "Public can read trivia"
      ON portfolio_trivia
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

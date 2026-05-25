/*
  # Noir narration

  1. New Tables
    - `portfolio_noir`
      - `id` (uuid, primary key)
      - `line` (text) — first-person detective narration line
      - `mood` (text) — rain | smoke | neon | dread | wry
      - `order_index` (integer)
      - `created_at` (timestamptz)
  2. Security
    - RLS enabled
    - Public SELECT policy for anon + authenticated
    - No mutation policies
*/

CREATE TABLE IF NOT EXISTS portfolio_noir (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line text NOT NULL DEFAULT '',
  mood text NOT NULL DEFAULT 'rain',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE portfolio_noir ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'portfolio_noir' AND policyname = 'Public can read noir'
  ) THEN
    CREATE POLICY "Public can read noir"
      ON portfolio_noir FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

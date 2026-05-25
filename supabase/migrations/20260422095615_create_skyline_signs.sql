/*
  # Holographic skyline billboards

  1. New Tables
    - `skyline_signs`
      - `id` (uuid, primary key)
      - `text` (text) — the billboard copy
      - `tone` (text) — 'neon' | 'siren' | 'ember' | 'cyan'
      - `order_index` (integer)
      - `created_at` (timestamptz)
  2. Security
    - RLS enabled
    - Public SELECT for anon + authenticated
    - No mutation policies
*/

CREATE TABLE IF NOT EXISTS skyline_signs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL DEFAULT '',
  tone text NOT NULL DEFAULT 'neon',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE skyline_signs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'skyline_signs' AND policyname = 'Public can read skyline signs'
  ) THEN
    CREATE POLICY "Public can read skyline signs"
      ON skyline_signs FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

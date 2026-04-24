/*
  # Esper photo-enhance hotspots

  1. New Tables
    - `esper_hotspots`
      - `id` (uuid, primary key)
      - `photo_url` (text) — stock photo the enhance sequence operates on
      - `photo_caption` (text) — case-file caption
      - `x` (numeric) — left position 0..1
      - `y` (numeric) — top position 0..1
      - `w` (numeric) — width 0..1
      - `h` (numeric) — height 0..1
      - `track_cmd` (text) — fake TRACK command string
      - `enhance_cmd` (text) — fake ENHANCE command string
      - `reveal` (text) — revealed plaintext finding
      - `order_index` (integer)
      - `created_at` (timestamptz)
  2. Security
    - RLS enabled
    - Public SELECT policy for anon + authenticated
    - No mutation policies
*/

CREATE TABLE IF NOT EXISTS esper_hotspots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_url text NOT NULL DEFAULT '',
  photo_caption text NOT NULL DEFAULT '',
  x numeric NOT NULL DEFAULT 0,
  y numeric NOT NULL DEFAULT 0,
  w numeric NOT NULL DEFAULT 0.1,
  h numeric NOT NULL DEFAULT 0.1,
  track_cmd text NOT NULL DEFAULT '',
  enhance_cmd text NOT NULL DEFAULT '',
  reveal text NOT NULL DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE esper_hotspots ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'esper_hotspots' AND policyname = 'Public can read esper'
  ) THEN
    CREATE POLICY "Public can read esper"
      ON esper_hotspots FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

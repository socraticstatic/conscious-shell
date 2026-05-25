/*
  # Unreliable Narrator Engine

  1. New Tables
    - `narrator_alternate_copy` - the "honest" version of every section
      - `id` (uuid, primary key)
      - `section_key` (text, unique) - matches component name (hero, about, work, etc.)
      - `original_fragments` (jsonb) - key phrases from the public version
      - `honest_fragments` (jsonb) - the contradicting/honest replacements
      - `contradiction_notes` (text) - internal notes on the contradiction
      - `intensity` (int) - 1-5, how dramatic the rewrite is
      - `created_at` (timestamptz)

    - `narrator_triggers` (tracking which triggers visitors have activated)
      - `id` (uuid, primary key)
      - `visitor_id` (text)
      - `origami_found` (boolean) - clicked origami unicorns
      - `console_command` (boolean) - typed the command
      - `baseline_failed` (boolean) - deliberately failed baseline
      - `narrator_unlocked` (boolean) - all 3 triggers hit
      - `current_reality` (text) - 'public' or 'honest'
      - `unlocked_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on all tables
    - Alternate copy readable by anon (content delivery)
    - Triggers writable/readable by matching visitor
*/

CREATE TABLE IF NOT EXISTS narrator_alternate_copy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text UNIQUE NOT NULL,
  original_fragments jsonb NOT NULL DEFAULT '[]'::jsonb,
  honest_fragments jsonb NOT NULL DEFAULT '[]'::jsonb,
  contradiction_notes text NOT NULL DEFAULT '',
  intensity int NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE narrator_alternate_copy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read alternate copy"
  ON narrator_alternate_copy FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS narrator_triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  origami_found boolean NOT NULL DEFAULT false,
  console_command boolean NOT NULL DEFAULT false,
  baseline_failed boolean NOT NULL DEFAULT false,
  narrator_unlocked boolean NOT NULL DEFAULT false,
  current_reality text NOT NULL DEFAULT 'public',
  unlocked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE narrator_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visitors can read own triggers"
  ON narrator_triggers FOR SELECT
  TO anon, authenticated
  USING (visitor_id = current_setting('request.headers', true)::json->>'x-visitor-id');

CREATE POLICY "Visitors can insert own triggers"
  ON narrator_triggers FOR INSERT
  TO anon, authenticated
  WITH CHECK (visitor_id = current_setting('request.headers', true)::json->>'x-visitor-id');

CREATE POLICY "Visitors can update own triggers"
  ON narrator_triggers FOR UPDATE
  TO anon, authenticated
  USING (visitor_id = current_setting('request.headers', true)::json->>'x-visitor-id')
  WITH CHECK (visitor_id = current_setting('request.headers', true)::json->>'x-visitor-id');

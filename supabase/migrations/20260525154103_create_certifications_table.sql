/*
  # Create certifications table

  1. New Tables
    - `certifications`
      - `id` (uuid, primary key)
      - `title` (text) - certification name
      - `institution` (text) - issuing body
      - `credential_id` (text) - credential identifier
      - `issued_date` (text) - when issued
      - `category` (text) - grouping (ai, leadership, technical, etc.)
      - `curriculum_notes` (jsonb) - array of curriculum module descriptions
      - `skills` (jsonb) - array of skills/competencies
      - `description` (text) - summary of what was covered
      - `url` (text) - verification link
      - `order_index` (int) - display order
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Public read access for portfolio display
*/

CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  institution text NOT NULL DEFAULT '',
  credential_id text NOT NULL DEFAULT '',
  issued_date text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'technical',
  curriculum_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  description text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read certifications"
  ON certifications FOR SELECT
  TO anon, authenticated
  USING (true);

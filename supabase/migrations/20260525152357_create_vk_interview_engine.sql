/*
  # Voight-Kampff Interview Engine

  1. New Tables
    - `vk_interview_questions` - 50+ branching interview questions
      - `id` (uuid, primary key)
      - `question_text` (text) - the question to display
      - `category` (text) - empathy, logic, creativity, darkness, honesty
      - `sequence_order` (int) - default order
      - `options` (jsonb) - array of {text, next_question_id, traits}
      - `is_root` (boolean) - whether this is an entry point
      - `mood` (text) - ambient mood for this question
      - `created_at` (timestamptz)

    - `vk_personality_profiles` - predefined profile archetypes
      - `id` (uuid, primary key)
      - `name` (text) - profile archetype name
      - `description` (text)
      - `trait_weights` (jsonb) - {empathy, logic, creativity, darkness, honesty}
      - `palette` (jsonb) - custom color palette for this profile
      - `section_order` (jsonb) - array of section names in display order
      - `tone` (text) - formal, casual, cryptic, confrontational
      - `created_at` (timestamptz)

    - `vk_visitor_dossiers` - per-visitor profiling results
      - `id` (uuid, primary key)
      - `visitor_id` (text) - anonymous fingerprint
      - `answers` (jsonb) - array of {question_id, answer_index, timestamp}
      - `traits` (jsonb) - accumulated trait scores
      - `profile_id` (uuid, FK) - matched personality profile
      - `interview_complete` (boolean)
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on all tables
    - Questions and profiles readable by anon (public content)
    - Dossiers writable/readable only by matching visitor_id
*/

-- Questions table
CREATE TABLE IF NOT EXISTS vk_interview_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  category text NOT NULL DEFAULT 'empathy',
  sequence_order int NOT NULL DEFAULT 0,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_root boolean NOT NULL DEFAULT false,
  mood text NOT NULL DEFAULT 'neutral',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vk_interview_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read interview questions"
  ON vk_interview_questions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Profiles table
CREATE TABLE IF NOT EXISTS vk_personality_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  trait_weights jsonb NOT NULL DEFAULT '{}'::jsonb,
  palette jsonb NOT NULL DEFAULT '{}'::jsonb,
  section_order jsonb NOT NULL DEFAULT '[]'::jsonb,
  tone text NOT NULL DEFAULT 'cryptic',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vk_personality_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read personality profiles"
  ON vk_personality_profiles FOR SELECT
  TO anon, authenticated
  USING (true);

-- Visitor dossiers table
CREATE TABLE IF NOT EXISTS vk_visitor_dossiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  traits jsonb NOT NULL DEFAULT '{"empathy":0,"logic":0,"creativity":0,"darkness":0,"honesty":0}'::jsonb,
  profile_id uuid REFERENCES vk_personality_profiles(id),
  interview_complete boolean NOT NULL DEFAULT false,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vk_visitor_dossiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visitors can read own dossier"
  ON vk_visitor_dossiers FOR SELECT
  TO anon, authenticated
  USING (visitor_id = current_setting('request.headers', true)::json->>'x-visitor-id');

CREATE POLICY "Visitors can insert own dossier"
  ON vk_visitor_dossiers FOR INSERT
  TO anon, authenticated
  WITH CHECK (visitor_id = current_setting('request.headers', true)::json->>'x-visitor-id');

CREATE POLICY "Visitors can update own dossier"
  ON vk_visitor_dossiers FOR UPDATE
  TO anon, authenticated
  USING (visitor_id = current_setting('request.headers', true)::json->>'x-visitor-id')
  WITH CHECK (visitor_id = current_setting('request.headers', true)::json->>'x-visitor-id');

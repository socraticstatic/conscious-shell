/*
  # Voight-Kampff style empathy-test questions

  ## Purpose
  Add a Blade Runner inspired "empathy test" section to the portfolio where visitors
  can cycle through design-philosophy questions. Data lives in Supabase so the
  portfolio owner can edit the bank without redeploying.

  ## New Tables
  - `vk_questions`
    - `id` (uuid) — primary key
    - `prompt` (text) — the question body (English)
    - `prompt_jp` (text) — short Japanese subtitle / glyph
    - `category` (text) — grouping label e.g. 'baseline', 'principle', 'craft'
    - `order_index` (int4) — display ordering
    - `created_at` (timestamptz)

  ## Security
  - RLS enabled
  - Public SELECT (portfolio content is public-facing)

  ## Seed
  - Seeds 8 questions on first apply; idempotent via ON CONFLICT DO NOTHING.
*/

CREATE TABLE IF NOT EXISTS vk_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt text NOT NULL,
  prompt_jp text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'baseline',
  order_index int4 NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vk_questions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'vk_questions' AND policyname = 'vk_questions public read'
  ) THEN
    CREATE POLICY "vk_questions public read"
      ON vk_questions
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

INSERT INTO vk_questions (prompt, prompt_jp, category, order_index) VALUES
  ('A product ships with a rough edge the user will never see. Do you stay late to polish it?', '共感', 'baseline', 1),
  ('Your research contradicts the founder''s favorite feature. What do you present in the meeting?', '証拠', 'baseline', 2),
  ('A junior designer hands you work that is 70% of what you would do. Do you redo it or ship it?', '指導', 'principle', 3),
  ('The roadmap has ten things. You can only do three. Which three, and why those?', '選択', 'principle', 4),
  ('A tortoise lies on its back in the desert, beating its legs trying to turn itself over, but it can''t. You''re the PM. Not helping. Why is that?', '共感', 'baseline', 5),
  ('You have one hour with the CEO. Do you show data, a demo, or a story?', '説得', 'craft', 6),
  ('A design system rule is slowing the team down on a launch. Do you break it?', '柔軟', 'craft', 7),
  ('Your best work was five years ago. What are you doing about it?', '未来', 'principle', 8)
ON CONFLICT DO NOTHING;

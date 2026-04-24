/*
  # Create github_projects table

  Stores public GitHub repositories to be showcased as live preview cards in
  the portfolio's "Repository Vault" section. Each row corresponds to one
  project, typically an AI demo hosted on GitHub Pages.

  1. New Tables
    - `github_projects`
      - `id` (uuid, primary key) — auto-generated
      - `repo_owner` (text) — GitHub username/org (e.g. "micahboswell")
      - `repo_name` (text) — repo name (e.g. "prompt-forge")
      - `repo_url` (text) — full GitHub repo URL
      - `pages_url` (text) — live GitHub Pages URL to embed in iframe
      - `title` (text) — display title shown on the card
      - `tagline` (text) — short one-liner under the title
      - `description` (text) — longer description shown when expanded
      - `tags` (text[]) — free-form tags (e.g. "llm", "agents", "embeddings")
      - `stars` (int) — cached star count for display
      - `language` (text) — primary language label
      - `thumbnail_url` (text) — fallback screenshot shown before live iframe loads
      - `featured` (bool) — whether to pin this project at the top of the grid
      - `sort_order` (int) — explicit ordering; lower = earlier
      - `created_at` (timestamptz) — row creation timestamp
  2. Security
    - Enable RLS on `github_projects`
    - Public read access (matches the pattern of portfolio_projects and other
      public portfolio tables in this project — the data on this table is meant
      to be shown on a public portfolio page)
  3. Seed
    - Inserts 6 placeholder rows with Pexels thumbnails and example AI project
      metadata so the section renders attractively out of the box. The owner
      should replace these with their real repos.
*/

CREATE TABLE IF NOT EXISTS github_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_owner text NOT NULL DEFAULT '',
  repo_name text NOT NULL DEFAULT '',
  repo_url text NOT NULL DEFAULT '',
  pages_url text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  tagline text DEFAULT '',
  description text DEFAULT '',
  tags text[] DEFAULT '{}',
  stars int DEFAULT 0,
  language text DEFAULT '',
  thumbnail_url text DEFAULT '',
  featured boolean DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE github_projects ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'github_projects' AND policyname = 'Public can read github_projects'
  ) THEN
    CREATE POLICY "Public can read github_projects"
      ON github_projects FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

INSERT INTO github_projects (repo_owner, repo_name, repo_url, pages_url, title, tagline, description, tags, stars, language, thumbnail_url, featured, sort_order)
SELECT * FROM (VALUES
  (
    'micahboswell', 'prompt-forge',
    'https://github.com/micahboswell/prompt-forge',
    'https://micahboswell.github.io/prompt-forge/',
    'prompt forge',
    'a browser-native workbench for iterating LLM prompts with diffable history',
    'Side-by-side prompt comparison, token counting, and live streaming across multiple model providers. Fully client-side — bring your own API keys.',
    ARRAY['llm', 'tooling', 'prompts'], 412, 'TypeScript',
    'https://images.pexels.com/photos/17485657/pexels-photo-17485657.jpeg?auto=compress&cs=tinysrgb&w=1200',
    true, 10
  ),
  (
    'micahboswell', 'agent-swarm',
    'https://github.com/micahboswell/agent-swarm',
    'https://micahboswell.github.io/agent-swarm/',
    'agent swarm',
    'visualize multi-agent LLM conversations as a live graph',
    'A real-time force-directed graph of agents, tools, and messages. Every edge is a tool call; every node pulses when it speaks. Works against any OpenAI-compatible endpoint.',
    ARRAY['agents', 'llm', 'visualization'], 889, 'TypeScript',
    'https://images.pexels.com/photos/8728382/pexels-photo-8728382.jpeg?auto=compress&cs=tinysrgb&w=1200',
    true, 20
  ),
  (
    'micahboswell', 'rag-lab',
    'https://github.com/micahboswell/rag-lab',
    'https://micahboswell.github.io/rag-lab/',
    'rag lab',
    'an in-browser retrieval playground with swappable chunkers and rerankers',
    'Paste a corpus, pick a chunker, pick an embedder, tune the top-k, and inspect which passages made it into context. Ships with a WASM vector store so everything runs locally.',
    ARRAY['rag', 'embeddings', 'retrieval'], 537, 'TypeScript',
    'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=1200',
    false, 30
  ),
  (
    'micahboswell', 'tokenstream-studio',
    'https://github.com/micahboswell/tokenstream-studio',
    'https://micahboswell.github.io/tokenstream-studio/',
    'tokenstream studio',
    'slow-motion visualization of a model streaming, token by token',
    'See the tokenizer run in real time. Hover any token to inspect logit probabilities, top-k alternatives, and sampling decisions. Designed for teaching LLM internals.',
    ARRAY['llm', 'education', 'tokenization'], 301, 'TypeScript',
    'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1200',
    false, 40
  ),
  (
    'micahboswell', 'voice-kampff',
    'https://github.com/micahboswell/voice-kampff',
    'https://micahboswell.github.io/voice-kampff/',
    'voice-kampff',
    'empathy-test chatbot — measures latency, affect, and hesitation',
    'A conversational eval rig that scores model replies on emotional register, not just correctness. Built on Web Speech API + a small affect classifier.',
    ARRAY['llm', 'eval', 'voice'], 162, 'TypeScript',
    'https://images.pexels.com/photos/8438923/pexels-photo-8438923.jpeg?auto=compress&cs=tinysrgb&w=1200',
    false, 50
  ),
  (
    'micahboswell', 'replicant-cv',
    'https://github.com/micahboswell/replicant-cv',
    'https://micahboswell.github.io/replicant-cv/',
    'replicant.cv',
    'browser-only object detection through a webcam, zero server',
    'Transformers.js + a tiny YOLO port, running fully in the browser. Fifteen FPS on a laptop. Click an object to narrate it through a local LLM.',
    ARRAY['cv', 'on-device', 'transformers.js'], 728, 'JavaScript',
    'https://images.pexels.com/photos/9951386/pexels-photo-9951386.jpeg?auto=compress&cs=tinysrgb&w=1200',
    false, 60
  )
) AS v(repo_owner, repo_name, repo_url, pages_url, title, tagline, description, tags, stars, language, thumbnail_url, featured, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM github_projects);

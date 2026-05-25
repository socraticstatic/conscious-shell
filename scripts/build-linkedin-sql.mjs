#!/usr/bin/env node
// Reads scripts/seed-out/*.json and emits SQL migration files.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = join(process.cwd(), 'scripts', 'seed-out');
const MIG_DIR = join(process.cwd(), 'supabase', 'migrations');

const recs = JSON.parse(readFileSync(join(OUT_DIR, 'linkedin_recommendations.json'), 'utf8'));
const articles = JSON.parse(readFileSync(join(OUT_DIR, 'linkedin_articles.json'), 'utf8'));

const esc = (s) => s == null ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`;
const escJson = (v) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;

// ---- recommendations table ----
const recsSql = `/*
  # Create linkedin_recommendations table

  Real LinkedIn recommendations received, parsed from LinkedIn data export.
  Used by WebDossier (testimony category) and VKInterview (corroboration block).

  - Public read access (RLS) for portfolio display.
*/

CREATE TABLE IF NOT EXISTS linkedin_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recommender_name text NOT NULL,
  recommender_role text NOT NULL DEFAULT '',
  recommendation_text text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  relationship text NOT NULL DEFAULT 'colleague',
  traits_signal jsonb NOT NULL DEFAULT '[]'::jsonb,
  given_date date NOT NULL,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE linkedin_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read linkedin_recommendations"
  ON linkedin_recommendations
  FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO linkedin_recommendations (recommender_name, recommender_role, recommendation_text, excerpt, relationship, traits_signal, given_date, order_index) VALUES
${recs.map(r => `(${esc(r.recommender_name)}, ${esc(r.recommender_role)}, ${esc(r.recommendation_text)}, ${esc(r.excerpt)}, ${esc(r.relationship)}, ${escJson(r.traits_signal)}, ${esc(r.given_date)}, ${r.order_index})`).join(',\n')};
`;

// ---- articles table ----
const articlesSql = `/*
  # Create linkedin_articles table

  Long-form essays from LinkedIn, parsed from LinkedIn data export.
  Used by Manifesto (broadcast log) and GithubLab (transmissions).

  - Public read access (RLS) for portfolio display.
*/

CREATE TABLE IF NOT EXISTS linkedin_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  published_date date NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  intercept_line text NOT NULL DEFAULT '',
  body_markdown text NOT NULL DEFAULT '',
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  reading_minutes int NOT NULL DEFAULT 1,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE linkedin_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read linkedin_articles"
  ON linkedin_articles
  FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO linkedin_articles (slug, title, published_date, excerpt, intercept_line, body_markdown, tags, reading_minutes, order_index) VALUES
${articles.map(a => `(${esc(a.slug)}, ${esc(a.title)}, ${esc(a.published_date)}, ${esc(a.excerpt)}, ${esc(a.intercept_line)}, ${esc(a.body_markdown)}, ${escJson(a.tags)}, ${a.reading_minutes}, ${a.order_index})`).join(',\n')};
`;

const ts = new Date().toISOString().replace(/[-T:Z.]/g, '').slice(0, 14);
writeFileSync(join(MIG_DIR, `${ts}_create_linkedin_recommendations.sql`), recsSql);
writeFileSync(join(MIG_DIR, `${(parseInt(ts) + 1).toString()}_create_linkedin_articles.sql`), articlesSql);

console.log(`Wrote ${ts}_create_linkedin_recommendations.sql (${recs.length} rows)`);
console.log(`Wrote ${(parseInt(ts) + 1)}_create_linkedin_articles.sql (${articles.length} rows)`);
console.log(`Total SQL size: ${(recsSql.length + articlesSql.length / 1024).toFixed(1)} KB`);

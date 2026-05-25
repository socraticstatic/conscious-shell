/*
  # Portfolio content tables

  1. New Tables
    - `portfolio_projects` — selected work entries (title, role, client, summary, tags, image_url, year, order_index, featured)
    - `portfolio_services` — services offered (title, description, icon, order_index)
    - `portfolio_testimonials` — client testimonials (quote, author, role, order_index)
    - `portfolio_awards` — awards / recognition (title, year, organization, order_index)
    - `portfolio_publications` — publications (title, kind, url, order_index)

  2. Security
    - RLS enabled on all tables
    - Public read access for anon + authenticated (portfolio is public content)
    - No write policies — content is seeded via migrations only

  3. Notes
    - All tables seeded with Micah Boswell's conscious-shell.com content
    - `order_index` controls display order across all tables
*/

CREATE TABLE IF NOT EXISTS portfolio_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  role text NOT NULL DEFAULT '',
  client text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  image_url text NOT NULL DEFAULT '',
  year text NOT NULL DEFAULT '',
  order_index int NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '',
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote text NOT NULL,
  author text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  organization text NOT NULL DEFAULT '',
  year text NOT NULL DEFAULT '',
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  kind text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_publications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read projects"
  ON portfolio_projects FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public can read services"
  ON portfolio_services FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public can read testimonials"
  ON portfolio_testimonials FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public can read awards"
  ON portfolio_awards FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public can read publications"
  ON portfolio_publications FOR SELECT TO anon, authenticated USING (true);

INSERT INTO portfolio_projects (title, role, client, summary, tags, image_url, year, order_index, featured) VALUES
  ('AT&T Product Design', 'Product Design', 'AT&T', 'Led product design initiatives across consumer-facing experiences, earning the 2023 Act Boldly award for impact on the business.', ARRAY['Product Design','UX','Enterprise'], 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600', '2023', 10, true),
  ('Deserve Mobile', 'Product Design / UX', 'Deserve', 'Shaped the mobile product experience for a modern credit card platform focused on financial inclusion for students and new-to-credit users.', ARRAY['Mobile','Fintech','UX'], 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=1600', '2022', 20, true),
  ('Treverity — Founding Design Partner', 'Founding Design Partner', 'Treverity', 'Built the design practice from zero: product vision, research rituals, and the systems that let engineers ship with confidence.', ARRAY['Design Leadership','Product','Systems'], 'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=1600', '2021', 30, true),
  ('Treverity Design Library', 'Design Ops', 'Treverity', 'Unified component library and design tokens across web and mobile — cut handoff time roughly in half and standardized accessibility.', ARRAY['Design Ops','Design Systems'], 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1600', '2021', 40, false),
  ('Treverity KPI Builder', 'Product Design', 'Treverity', 'A flexible canvas for operators to compose, compare, and share KPIs without waiting on an analyst.', ARRAY['Data','Product Design','B2B'], 'https://images.pexels.com/photos/669610/pexels-photo-669610.jpeg?auto=compress&cs=tinysrgb&w=1600', '2021', 50, false),
  ('Treverity Icon Archive', 'Icon Design', 'Treverity', 'A cohesive 400+ icon system designed for clarity at 16px and expressiveness at 64px.', ARRAY['Icon Design','Visual'], 'https://images.pexels.com/photos/326501/pexels-photo-326501.jpeg?auto=compress&cs=tinysrgb&w=1600', '2020', 60, false),
  ('Home Service Plus', 'Service Design', 'HSP', 'Mapped the end-to-end homeowner journey and redesigned the dispatch experience around the technicians actually doing the work.', ARRAY['Service Design','Research'], 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1600', '2019', 70, false),
  ('Acumen Customer Website', 'Product Design', 'Acumen', 'Rebuilt the customer portal around real account tasks — replacing a brochure site with a tool customers actually use.', ARRAY['Product Design','Web'], 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1600', '2018', 80, false),
  ('US Mint — Omnichannel Strategy', 'UX Strategy', 'US Mint', 'Aligned retail, web, and collector experiences around a single customer model spanning decades of product history.', ARRAY['Strategy','Omnichannel'], 'https://images.pexels.com/photos/210600/pexels-photo-210600.jpeg?auto=compress&cs=tinysrgb&w=1600', '2017', 90, false),
  ('Dell Technologies — UX Strategy', 'UX Strategy', 'Dell', 'Set the UX direction for enterprise product lines, building the research cadence that fed product roadmaps.', ARRAY['Strategy','Enterprise'], 'https://images.pexels.com/photos/3183165/pexels-photo-3183165.jpeg?auto=compress&cs=tinysrgb&w=1600', '2016', 100, false),
  ('Real Sugar Soda', 'Brand Strategy & Design', 'Real Sugar Soda', 'Brand strategy and identity system for a craft soda company — retail-ready from day one.', ARRAY['Brand','Identity'], 'https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg?auto=compress&cs=tinysrgb&w=1600', '2015', 110, false),
  ('Broadlane', 'Creative Direction', 'Broadlane', 'Creative direction across digital and print for a national healthcare supply-chain company. Brand Overhaul of the Year, 2010.', ARRAY['Creative Direction','Brand'], 'https://images.pexels.com/photos/3184423/pexels-photo-3184423.jpeg?auto=compress&cs=tinysrgb&w=1600', '2010', 120, false);

INSERT INTO portfolio_services (title, description, icon, order_index) VALUES
  ('Strategic Consulting', 'Leverage 20+ years of shipping product to pressure-test direction, sequencing, and the org work that makes design land.', 'Compass', 10),
  ('Product Design', 'From discovery research through launch and post-launch measurement — design that survives contact with production.', 'Layers', 20),
  ('Mentorship', 'One-on-one coaching for product, UI, and UX designers ready to move into senior and leadership roles.', 'Users', 30);

INSERT INTO portfolio_testimonials (quote, author, role, order_index) VALUES
  ('He is always ready to discuss the pros and cons of various strategies or designs and work with you.', 'Tali Swann-Sternberg', 'Google', 10);

INSERT INTO portfolio_awards (title, organization, year, order_index) VALUES
  ('Act Boldly Award', 'AT&T', '2023', 10),
  ('Brand Overhaul of the Year', 'Broadlane', '2010', 20),
  ('Best Speaker', 'Ignite', '2012', 30);

INSERT INTO portfolio_publications (title, kind, url, order_index) VALUES
  ('Wine for the Rest of Us', 'Book', '', 10),
  ('Data Driven Design', 'Book', '', 20),
  ('Distinguished Gentleman', 'Book', '', 30),
  ('Children''s Book', 'Apple Books', '', 40);

/*
  # Web dossier — facts about the subject, pulled from open-web research

  1. New Table
    - `web_dossier_facts`
      - `id` (uuid, primary key)
      - `category` (text) — role | experience | expertise | mentoring |
        writing | off_duty | opinion | bio
      - `text` (text) — the fact itself, written in dossier voice
      - `source_label` (text) — short source name (e.g. "linkedin.com")
      - `source_url` (text) — full URL
      - `weight` (int) — 1..5, used for weighted random draw
      - `order_index` (int)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled
    - Public SELECT (the dossier is meant to be visible on the public site)
    - No public INSERT/UPDATE/DELETE — only the service role (via
      migrations) can modify this table.

  3. Seed Data
    - 18 facts sourced from the open web about Micah Boswell, the owner
      of conscious-shell.com. Each includes the URL it was found at.
*/

CREATE TABLE IF NOT EXISTS web_dossier_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'bio',
  text text NOT NULL DEFAULT '',
  source_label text NOT NULL DEFAULT '',
  source_url text NOT NULL DEFAULT '',
  weight integer NOT NULL DEFAULT 1,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE web_dossier_facts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'web_dossier_facts' AND policyname = 'Public can read dossier'
  ) THEN
    CREATE POLICY "Public can read dossier"
      ON web_dossier_facts FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

INSERT INTO web_dossier_facts (category, text, source_label, source_url, weight, order_index) VALUES
  ('role', 'Currently listed as Experience Lead · DNI for On-Premise and Cloud Network Infrastructure at AT&T.', 'theorg.com', 'https://theorg.com/org/att/org-chart/micah-boswell', 4, 1),
  ('experience', 'Over two decades of funding, planning and designing experiences — both traditional tools and emerging ones.', 'linkedin.com', 'https://www.linkedin.com/in/micahboswell/', 5, 2),
  ('experience', 'Has been running as a Principal freelance Independent Consultant for 13+ years.', 'crunchbase.com', 'https://www.crunchbase.com/person/micah-boswell', 3, 3),
  ('bio', 'Portfolio site — conscious-shell.com — dates back to the year 2000. Always in progress.', 'conscious-shell.com', 'https://www.conscious-shell.com/', 5, 4),
  ('experience', 'Career highlights include experience-design work with the U.S. Mint, Pier 1, GE, and Toyota.', 'linkedin.com', 'https://www.linkedin.com/in/micahboswell/', 5, 5),
  ('experience', 'Previously VP of Experience Design at Treverity LLC. Built design libraries and human-centric systems there.', 'treverity.com', 'https://treverity.com/about-us/team/micah-boswell/', 3, 6),
  ('expertise', 'Specialties: e-commerce UX, user-centered design, interaction design, transmedia experience, CMS architecture, brand strategy.', 'linkedin.com', 'https://www.linkedin.com/in/micahboswell/', 3, 7),
  ('opinion', 'Device-agnostic. Strong believer in the collaborative whiteboard-prototyping session as the real unit of design work.', 'linkedin.com', 'https://www.linkedin.com/in/micahboswell/', 2, 8),
  ('mentoring', 'Mentor (and Advisory Board member) at CareerFoundry. Operating out of Dallas, Texas.', 'rocketreach.co', 'https://rocketreach.co/micah-boswell-email_49510890', 4, 9),
  ('mentoring', 'Twenty+ years of experience, offered to the next generation of designers to help them avoid the classic mistakes.', 'linkedin.com', 'https://www.linkedin.com/in/micahboswell/', 2, 10),
  ('writing', 'Has published on UX critical thinking — arguing that method without critique is just choreography.', 'linkedin.com', 'https://www.linkedin.com/pulse/ux-critical-thinking-micah-boswell', 3, 11),
  ('writing', 'Writing series: "UX Method of the Week" — covered journey mapping, lean user research, culture mapping.', 'linkedin.com', 'https://www.linkedin.com/pulse/ux-method-week-journey-mapping-micah-boswell', 3, 12),
  ('writing', 'Essay: UX Design, Strategy, and Sustainability. Design as a climate practice, not just a product one.', 'linkedin.com', 'https://www.linkedin.com/pulse/ux-designstrategy-sustainability-micah-boswell', 2, 13),
  ('opinion', 'Self-described: data-driven, customer-centric, with a well-honed design toolkit and a bias toward clarity.', 'linkedin.com', 'https://www.linkedin.com/in/micahboswell/', 2, 14),
  ('opinion', 'Champions empathy as a core value — not as a slogan. Twenty-plus years of people-centric design as a daily practice.', 'linkedin.com', 'https://www.linkedin.com/in/micahboswell/', 3, 15),
  ('off_duty', 'Listed on IMDb. Credit: Producer. The design leader has a second life in film.', 'imdb.com', 'https://www.imdb.com/name/nm5119038/', 4, 16),
  ('off_duty', 'Contributing photographer on Unsplash as @micahboswell. Images in the public commons.', 'unsplash.com', 'https://unsplash.com/@micahboswell', 3, 17),
  ('bio', 'Has maintained a personal presence on brandyourself.com since the earlier era of the social web.', 'brandyourself.com', 'http://micahboswell.brandyourself.com/', 1, 18)
ON CONFLICT DO NOTHING;

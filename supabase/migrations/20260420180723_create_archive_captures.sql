/*
  # Wayback Machine captures of conscious-shell.com

  ## Purpose
  Stores one historical snapshot per year (2000 — present) of conscious-shell.com,
  pulled from the archive.org CDX index. Used to power a "temporal archive" section
  where visitors can travel through 25 years of the site's evolving designs via
  embedded Wayback iframes.

  ## New Tables
  - `archive_captures`
    - `id` (uuid, pk)
    - `year` (int4) — e.g. 2000, 2001…
    - `timestamp_raw` (text) — 14-digit wayback timestamp (YYYYMMDDhhmmss)
    - `captured_at` (timestamptz) — parsed datetime of capture
    - `original_url` (text) — the URL that was captured
    - `wayback_url` (text) — human link back to wayback machine
    - `embed_url` (text) — iframe-ready `if_` variant
    - `era_label` (text) — short designer-era tag
    - `order_index` (int4)
    - `created_at` (timestamptz)

  ## Security
  - RLS enabled
  - Public SELECT only (archive content is public by nature)

  ## Seed
  - 25 yearly snapshots (2000-2025), idempotent insert.
*/

CREATE TABLE IF NOT EXISTS archive_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year int4 NOT NULL,
  timestamp_raw text NOT NULL,
  captured_at timestamptz NOT NULL,
  original_url text NOT NULL,
  wayback_url text NOT NULL,
  embed_url text NOT NULL,
  era_label text NOT NULL DEFAULT '',
  order_index int4 NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS archive_captures_timestamp_raw_key ON archive_captures (timestamp_raw);

ALTER TABLE archive_captures ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'archive_captures' AND policyname = 'archive_captures public read'
  ) THEN
    CREATE POLICY "archive_captures public read"
      ON archive_captures
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

INSERT INTO archive_captures (year, timestamp_raw, captured_at, original_url, wayback_url, embed_url, era_label, order_index) VALUES
  (2000, '20001024073753', '2000-10-24 07:37:53+00', 'http://www.conscious-shell.com/', 'https://web.archive.org/web/20001024073753/http://www.conscious-shell.com/', 'https://web.archive.org/web/20001024073753if_/http://www.conscious-shell.com/', 'geocities era', 1),
  (2001, '20010201202100', '2001-02-01 20:21:00+00', 'http://conscious-shell.com/', 'https://web.archive.org/web/20010201202100/http://conscious-shell.com/', 'https://web.archive.org/web/20010201202100if_/http://conscious-shell.com/', 'tables & gifs', 2),
  (2002, '20020123140935', '2002-01-23 14:09:35+00', 'http://www.conscious-shell.com/', 'https://web.archive.org/web/20020123140935/http://www.conscious-shell.com/', 'https://web.archive.org/web/20020123140935if_/http://www.conscious-shell.com/', 'post-dotcom', 3),
  (2003, '20030130132914', '2003-01-30 13:29:14+00', 'http://www.conscious-shell.com/', 'https://web.archive.org/web/20030130132914/http://www.conscious-shell.com/', 'https://web.archive.org/web/20030130132914if_/http://www.conscious-shell.com/', 'flash interlude', 4),
  (2004, '20040210214129', '2004-02-10 21:41:29+00', 'http://www.conscious-shell.com/', 'https://web.archive.org/web/20040210214129/http://www.conscious-shell.com/', 'https://web.archive.org/web/20040210214129if_/http://www.conscious-shell.com/', 'css awakenings', 5),
  (2005, '20050125041847', '2005-01-25 04:18:47+00', 'http://conscious-shell.com/', 'https://web.archive.org/web/20050125041847/http://conscious-shell.com/', 'https://web.archive.org/web/20050125041847if_/http://conscious-shell.com/', 'web 2.0 dawn', 6),
  (2006, '20060113221511', '2006-01-13 22:15:11+00', 'http://www.conscious-shell.com/', 'https://web.archive.org/web/20060113221511/http://www.conscious-shell.com/', 'https://web.archive.org/web/20060113221511if_/http://www.conscious-shell.com/', 'gradients & glass', 7),
  (2007, '20070204085643', '2007-02-04 08:56:43+00', 'http://www.conscious-shell.com/', 'https://web.archive.org/web/20070204085643/http://www.conscious-shell.com/', 'https://web.archive.org/web/20070204085643if_/http://www.conscious-shell.com/', 'pre-iphone', 8),
  (2008, '20080315074003', '2008-03-15 07:40:03+00', 'http://www.conscious-shell.com/', 'https://web.archive.org/web/20080315074003/http://www.conscious-shell.com/', 'https://web.archive.org/web/20080315074003if_/http://www.conscious-shell.com/', 'ia/ux split', 9),
  (2009, '20090721023939', '2009-07-21 02:39:39+00', 'http://www.conscious-shell.com/', 'https://web.archive.org/web/20090721023939/http://www.conscious-shell.com/', 'https://web.archive.org/web/20090721023939if_/http://www.conscious-shell.com/', 'minimalism begins', 10),
  (2010, '20100820055522', '2010-08-20 05:55:22+00', 'http://www.conscious-shell.com/', 'https://web.archive.org/web/20100820055522/http://www.conscious-shell.com/', 'https://web.archive.org/web/20100820055522if_/http://www.conscious-shell.com/', 'retina incoming', 11),
  (2011, '20110902042732', '2011-09-02 04:27:32+00', 'http://www.conscious-shell.com/', 'https://web.archive.org/web/20110902042732/http://www.conscious-shell.com/', 'https://web.archive.org/web/20110902042732if_/http://www.conscious-shell.com/', 'responsive era', 12),
  (2012, '20120101104944', '2012-01-01 10:49:44+00', 'http://www.conscious-shell.com/', 'https://web.archive.org/web/20120101104944/http://www.conscious-shell.com/', 'https://web.archive.org/web/20120101104944if_/http://www.conscious-shell.com/', 'flat preview', 13),
  (2013, '20130526085630', '2013-05-26 08:56:30+00', 'http://conscious-shell.com/', 'https://web.archive.org/web/20130526085630/http://conscious-shell.com/', 'https://web.archive.org/web/20130526085630if_/http://conscious-shell.com/', 'flat landing', 14),
  (2014, '20140517060221', '2014-05-17 06:02:21+00', 'http://conscious-shell.com/', 'https://web.archive.org/web/20140517060221/http://conscious-shell.com/', 'https://web.archive.org/web/20140517060221if_/http://conscious-shell.com/', 'material echo', 15),
  (2015, '20150306073206', '2015-03-06 07:32:06+00', 'http://conscious-shell.com/', 'https://web.archive.org/web/20150306073206/http://conscious-shell.com/', 'https://web.archive.org/web/20150306073206if_/http://conscious-shell.com/', 'big type', 16),
  (2016, '20160111114750', '2016-01-11 11:47:50+00', 'http://conscious-shell.com/', 'https://web.archive.org/web/20160111114750/http://conscious-shell.com/', 'https://web.archive.org/web/20160111114750if_/http://conscious-shell.com/', 'full-bleed', 17),
  (2017, '20170316162524', '2017-03-16 16:25:24+00', 'http://conscious-shell.com/', 'https://web.archive.org/web/20170316162524/http://conscious-shell.com/', 'https://web.archive.org/web/20170316162524if_/http://conscious-shell.com/', 'brutalism hint', 18),
  (2018, '20180109221922', '2018-01-09 22:19:22+00', 'http://conscious-shell.com/', 'https://web.archive.org/web/20180109221922/http://conscious-shell.com/', 'https://web.archive.org/web/20180109221922if_/http://conscious-shell.com/', 'darkmode trial', 19),
  (2019, '20190113011531', '2019-01-13 01:15:31+00', 'https://conscious-shell.com/', 'https://web.archive.org/web/20190113011531/https://conscious-shell.com/', 'https://web.archive.org/web/20190113011531if_/https://conscious-shell.com/', 'grid systems', 20),
  (2020, '20200224055846', '2020-02-24 05:58:46+00', 'https://conscious-shell.com/', 'https://web.archive.org/web/20200224055846/https://conscious-shell.com/', 'https://web.archive.org/web/20200224055846if_/https://conscious-shell.com/', 'pandemic pause', 21),
  (2021, '20210119172637', '2021-01-19 17:26:37+00', 'https://conscious-shell.com/', 'https://web.archive.org/web/20210119172637/https://conscious-shell.com/', 'https://web.archive.org/web/20210119172637if_/https://conscious-shell.com/', 'motion returns', 22),
  (2022, '20220117223359', '2022-01-17 22:33:59+00', 'https://conscious-shell.com/', 'https://web.archive.org/web/20220117223359/https://conscious-shell.com/', 'https://web.archive.org/web/20220117223359if_/https://conscious-shell.com/', 'editorial', 23),
  (2023, '20230110041053', '2023-01-10 04:10:53+00', 'https://conscious-shell.com/', 'https://web.archive.org/web/20230110041053/https://conscious-shell.com/', 'https://web.archive.org/web/20230110041053if_/https://conscious-shell.com/', 'case study focus', 24),
  (2024, '20240223175345', '2024-02-23 17:53:45+00', 'https://www.conscious-shell.com/', 'https://web.archive.org/web/20240223175345/https://www.conscious-shell.com/', 'https://web.archive.org/web/20240223175345if_/https://www.conscious-shell.com/', 'framer era', 25),
  (2025, '20250207213912', '2025-02-07 21:39:12+00', 'https://www.conscious-shell.com/', 'https://web.archive.org/web/20250207213912/https://www.conscious-shell.com/', 'https://web.archive.org/web/20250207213912if_/https://www.conscious-shell.com/', 'present day', 26)
ON CONFLICT (timestamp_raw) DO NOTHING;

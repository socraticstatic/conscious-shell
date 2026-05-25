# LinkedIn Testimony & Signal — Design Spec

**Date:** 2026-05-25
**Status:** Approved — ready for implementation plan
**Scope:** Weave Micah's LinkedIn recommendations and long-form articles into the existing tears-in-rain site without adding new nav routes. Full Blade Runner thematic treatment.

## Goals

- Recommendations received become *testimony*: cited, dated, human evidence in surfaces that already ask "who is this person."
- Long-form articles become *intercepted broadcasts*: dated transmissions in surfaces that already deal with thought and writing.
- No new top-level nav. Existing sections deepen rather than multiplying.
- Content lives in Supabase, matching the rest of the site's content model.

## Non-goals

- No new pages, routes, or top-level navigation entries.
- No external links out to LinkedIn — content lives on-site.
- No CMS or admin UI. Updates happen via SQL migrations the same way the rest of the site is managed.

## Data model

Two new Supabase tables.

### `linkedin_recommendations`

| column | type | notes |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `recommender_name` | text | full name (joined first/last from CSV) |
| `recommender_role` | text | "{job_title} · {company}" |
| `recommendation_text` | text | full quote |
| `excerpt` | text | curated one-sentence pull quote for compact surfaces |
| `relationship` | text | one of: `mentee`, `colleague`, `partner`, `report`, `peer` — hand-tagged at seed time |
| `traits_signal` | jsonb | array of trait keys this rec corroborates: `["empathy", "honesty", "creativity", "logic", "darkness"]` — used to match VK results |
| `given_date` | date | parsed from CSV `Creation Date` |
| `status` | text | `VISIBLE` only — others filtered at seed time |
| `order_index` | int | display order |
| `created_at` | timestamptz | default now() |

RLS: enabled, public SELECT.

### `linkedin_articles`

| column | type | notes |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `slug` | text unique | matches HTML filename stem |
| `title` | text | parsed from `<title>` in HTML |
| `published_date` | date | parsed from filename prefix or article body |
| `excerpt` | text | first meaningful paragraph, ≤220 chars, hand-curated |
| `intercept_line` | text | noir one-liner written specifically for the broadcast log (e.g. "transmission caught the night the empathy meters drifted") |
| `body_markdown` | text | stripped, normalized body content as markdown |
| `tags` | jsonb | array of topic tags: `ux`, `ai`, `method`, `philosophy`, etc. |
| `reading_minutes` | int | computed at seed time |
| `order_index` | int | sort key, default chronological descending |
| `created_at` | timestamptz | default now() |

RLS: enabled, public SELECT.

## Component changes

### `WebDossier.tsx` — add testimony category

- Extend `CATEGORY_META` with a `testimony` entry, accent color `#7dd6e8` (matching VK cyan).
- Extend `portfolio.ts` to fetch `linkedin_recommendations` and pass to `WebDossier` as a sibling prop, or merge into the existing `facts` array shape with `category: 'testimony'`. Decision in the plan: merge into facts to keep WebDossier's rotation logic untouched.
- When a `testimony` fact is active, the dossier card shows:
  - Quote in a slightly larger serif-leaning treatment (still monospace family, but the quote gets a left border and italicized run).
  - Cited as `— {recommender_name} · {recommender_role} · {given_date}`.
  - Category tag reads `field testimony · cross-checked`.
- Weight: 5 (highest available) so testimony surfaces more often than open-web facts. Tunable.

### `VKInterview.tsx` — corroboration in result screen

- After empathy profile lands, pick one rec whose `traits_signal` overlaps the profile's dominant trait (top 1–2 trait_weights).
- Render below the profile description in a "field corroboration" block:
  ```
  cross-reference · field log
  ─────────────────────────
  "{quote}"
                  — {name}, {role}
  ```
- Subtle CRT flicker on first appearance, then static. Cyan accent matching VK theme.
- If no rec matches the dominant trait, fall back to a random `VISIBLE` rec with `relationship in ('mentee', 'colleague')`.
- This is a non-blocking enhancement: if the recs table is empty or the query fails, the section degrades gracefully (no corroboration block, profile still shows).

### `Manifesto.tsx` — add broadcast log subsection

Below the existing 4-directive manifesto, add a second block titled `broadcast log` (jp: `放送記録`).

- Table-style layout, same monospace grid feel as the directive table.
- Columns: `#` · `intercepted` (date) · `signal` (intercept_line) · `length` (reading_minutes + "m").
- Click any row → article expands inline below the row in a noir reading panel. Body renders as monospace prose with section-break ornaments. Click again or another row to collapse / swap.
- Heading bar mimics existing SectionHeader: `path="/broadcast.log"`, `right="18 transmissions · archived"`.

### `GithubLab.tsx` — transmissions tab

GithubLab already shows repos with tabs/filters. Add a sibling segment "transmissions" (or surface as a chip filter) that pulls the same articles but presents them as signal logs — minimal, scan-style, tagged. Clicking a row opens the same reading panel pattern from Manifesto (extracted into a shared `<TransmissionPanel>` component).

If the lab component's layout makes a tab awkward, this section can fall back to a vertical strip below the repo grid with the heading "intercepted transmissions · cross-referenced from manifesto archive."

### Shared component: `TransmissionPanel.tsx` (new)

Single noir reading panel used by both Manifesto and GithubLab. Props:
- `article: LinkedInArticle`
- `onClose: () => void`

Renders title, date, reading time, body. Handles markdown → React via a tiny inline renderer (no new dependency — most LinkedIn essays use simple paragraphs and headers).

### `src/lib/supabase.ts` — add types

Add `LinkedInRecommendation` and `LinkedInArticle` exported types mirroring the table columns.

### `src/lib/portfolio.ts` — extend fetcher

Append two parallel `supabase.from(...).select('*')...` calls. Add to the returned shape. Update consumers (`App.tsx`).

## Seed data preparation

Two SQL migrations, generated offline from the LinkedIn export:

1. `YYYYMMDDHHMMSS_create_linkedin_recommendations.sql` — table DDL + RLS + seed INSERTs.
2. `YYYYMMDDHHMMSS_create_linkedin_articles.sql` — table DDL + RLS + seed INSERTs.

A small Node script (in `scripts/seed-linkedin.ts`, not committed to the public surface) parses the CSV and HTML files and emits the INSERT statements. The script is a one-shot seed builder, not runtime code — it's run locally, output reviewed, then pasted into the migration files. Keeps the build clean and avoids parsing CSV/HTML at deploy time.

The script:
- Reads `/tmp/linkedin/Recommendations_Received.csv`, filters `Status=VISIBLE`, joins names, normalizes dates.
- Reads each `Articles/Articles/*.html`, extracts `<title>`, parses date from filename or content, strips body to markdown using a minimal HTML→MD pass.
- Outputs `excerpt`, `intercept_line`, `traits_signal`, `tags`, `relationship` as best-effort defaults; Micah reviews and edits in the migration file before commit.

## Theme / copy guidelines

- Recommendations are *evidence*, not *promotion*. Frame as "field testimony", "cross-reference", "corroboration." Never "what people say about me" or "raves."
- Articles are *transmissions* and *broadcasts*. Frame as "intercepted", "archived", "signal caught at {date}." Never "blog posts" or "thought leadership."
- Dates always shown in ISO-ish form: `2024-03-25` not "March 25, 2024."
- Names cited in full only on the dossier and corroboration block. Manifesto broadcast rows are author-less in the row view; author appears inside the expanded panel.

## Failure modes

- **Empty tables on first load:** dossier just shows web facts (existing behavior). VK result shows no corroboration block. Manifesto shows only the 4 directives (existing behavior). Lab shows only repos.
- **One table empty, other full:** sections render only what they have. No errors.
- **Network failure to Supabase:** existing fetch error pathways apply; nothing new.

## Testing

- Smoke: dev server boots, all four touched sections render, no console errors.
- Visual: WebDossier cycles through and lands on a testimony card. VK interview completes and shows corroboration. Manifesto broadcast log renders 18 rows; clicking expands. Lab transmissions chip filters articles.
- Data integrity check: count(rows) per table matches expected (47 recs, 18 articles).

## Out of scope (explicitly deferred)

- Recommendations *given* — would invert the framing and is a separate design conversation.
- Endorsements (1,612 rows) — too noisy at single-row resolution. If surfaced later, it's as a skyline/constellation visualization, not a list.
- Publications (book + haiku) — small enough to do as a follow-up, lower priority than the two main streams.
- Search across articles.
- RSS / JSON-Feed export.

## File touchpoints

| file | change |
|---|---|
| `supabase/migrations/<ts>_create_linkedin_recommendations.sql` | new |
| `supabase/migrations/<ts>_create_linkedin_articles.sql` | new |
| `scripts/seed-linkedin.ts` | new, local-only helper |
| `src/lib/supabase.ts` | add types |
| `src/lib/portfolio.ts` | add fetchers |
| `src/App.tsx` | wire new data to components |
| `src/components/WebDossier.tsx` | add testimony category rendering |
| `src/components/VKInterview.tsx` | add corroboration block in result screen |
| `src/components/Manifesto.tsx` | add broadcast log subsection |
| `src/components/GithubLab.tsx` | add transmissions section |
| `src/components/TransmissionPanel.tsx` | new shared reading panel |

# Studio Page Implementation Plan (v2, hardened)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/studio` - a standalone, first-person, warm-link landing page with a sample teardown as centerpiece - plus lead-source capture and the outreach kit that gives the page its only traffic.

**Architecture:** `/studio` renders standalone like `CaseStudy` (no site Nav, no dock, no boot overlay, no theater on any tier). All copy is static in the component - no new content tables. One migration adds `source` and `company` to `contact_submissions`; a local `StudioIntake` form posts there. Prerender emits `dist/studio/index.html` with a noindex head (copying the 404's robots pattern) and build-blocking guards keep `studio` out of sitemap.xml, llms.txt, and agents.md forever.

**Tech Stack:** React + Vite + Tailwind, Supabase, prerender.mjs - all existing. Zero new dependencies.

**Spec:** This document. The "Page copy", "Sample teardown", and "Outreach kit" sections are final copy, not drafts.

## Global Constraints

- First person singular. Never "we", never "our team".
- No em dashes in site copy. No horizontal scrolling. No iframes.
- AT&T title used everywhere: `Experience Lead, DNI at AT&T` (matches llms.txt). No other AT&T facts beyond resume/index.html.
- Quiet-sell: `/studio` never appears in Nav links, sitemap.xml, llms.txt, or agents.md; prerendered head carries `<meta name="robots" content="noindex, follow" />`. Enforced by build guards (Task 3), not convention.
- Tokens: ground #0b0a08, bone #e8e4dc, muted #a8a29e, magenta #e040fb only accent. Prose serif ≥17px/1.7; labels mono. 44px targets; 15px+ for anything a reader weighs; inputs 16px on mobile (iOS zoom).
- The page must be complete without JavaScript beyond the form (prerendered HTML carries all copy).

## Decided (not open for the implementer)

- Sample teardown is a composite; no real product named.
- No custom OG image in v1: `og:image` = `https://conscious-shell.com/esper/art-corazon.jpg` (existing, abstract, on-palette). Title/description carry the message. A designed card is a later nicety, not a task.
- No visit analytics in v1. Twenty warm recipients; replies are the metric; conversions land in `contact_submissions.source='studio'`. Nothing else is worth its surface area.
- `useDocumentMeta` is NOT modified. noindex lives only in the prerendered head, same as the 404.

## The one open decision (Micah only)

Pre-filling the outreach worksheet from Mail/iMessages requires his explicit yes. Until then, Task 6 seeds memory-hook rows from public/canon facts only.

---

## Page copy (final)

**Header row** (mono, 11px): `micah boswell · the studio` · right: `← the lab` (link to `/`)

**H1:** `Your AI pilot works. Nobody uses it.`

**Sub (serif):** `I'm Micah Boswell. Thirty years of enterprise UX, currently Experience Lead, DNI at AT&T. I take one outside engagement a month: a two-week teardown that finds out why the humans won't adopt your AI, and hands your team the fix.`

**Problem (serif, exactly this):** `Most enterprise AI pilots don't fail on the model. They fail at the moment a person has to trust the output, change a habit, or explain the answer to someone else. That moment is a design problem, and it's usually the one nobody staffed.`

**SKU block** - title `AI Adoption Teardown`, meta line `$18,000 fixed · two weeks · one engagement per month`:
- `days 1-3 · I shadow the real users inside the real workflow. Not interviews about the tool. The work itself.`
- `days 4-5 · the failure map. Every point where a human drops out, ranked by what it costs you.`
- `days 6-8 · the redesigned interaction model, walked through with your users.`
- `days 9-10 · the build path. What your engineers ship, in what order, with acceptance criteria. One readout with your team.`
- Close: `You keep: the failure map, the redesign, the build path, and the recording of the readout.`

**Proof band** (each stat links to its case study):
- `48% error reduction` → `/work/ge-nuclear-fortran-unification` · `GE Nuclear. Hundreds of legacy apps unified into role-based dashboards.`
- `$300K+ recovered` → `/work/at-and-t-product-design` · `AT&T. One diagnostics redesign.`
- `31% abandonment cut` → `/work/us-mint-omnichannel-strategy` · `U.S. Mint. First persona-driven strategy for a government retailer.`

**Sample teardown** - inline, content below.

**Secondary card:** `After the teardown, some teams keep me. Advisory retainer: $6,000/month, 4-6 hrs/week, two seats, selective.`

**About strip:** `Thirty years shipping enterprise software: GE Nuclear, Citi, Wells Fargo, the U.S. Mint, Dell, AT&T. I write TypeScript and run production agents at home. The rest of me lives at conscious-shell.com.`

**Intake** (see Task 4 for exact component spec). Section heading: `start the intro call`. Below the form: `or write me directly: micah@conscious-shell.com`

## Sample teardown (final copy)

Label (mono): `case file · composite, drawn from real patterns · no client named`
Title: `the assistant nobody asked twice`

Context: `An ops copilot for a network operations team. The demo dazzled leadership. Six weeks after rollout, daily actives sat under 8% of licensed seats. The model was fine. Here is where the humans left.`

Failure map (numbered, severity tag on each):
1. `the trust cliff — fatal · ~60% of drop-off` · `The first materially wrong answer lands in week one. No confidence signal, no source to check. That user never comes back, and tells two more.`
2. `answer-shaped output — high` · `Fluent paragraphs where the job needed a value and a link. Verifying the answer costs more than looking it up.`
3. `outside the system of record — high` · `The copilot lives in its own tab. Ground truth lives in the ticket. Every use is a detour.`
4. `no draft state — medium` · `Output lands in customer-visible fields with no undo, so users pre-edit in a notepad. The tool added a step.`
5. `expertise inversion — medium, compounding` · `Seniors get no value; they already know. Juniors can't validate. Adoption pools with exactly the people least able to catch an error. That's risk, not productivity.`

Redesign (two moves):
- `citations or silence` · `Every claim links its source row, or the machine says it can't verify. Trust rebuilds on refusability, not fluency.`
- `move into the ticket` · `Inline suggestions with accept, edit, undo. Draft state by default. The copilot stops being a destination.`

Build path: `week 1 · instrument the drop-off, ship the citation layer. week 2 · the inline surface, behind a flag. week 3 · measure suggestion-acceptance, not sessions.`

Closing line (serif, standalone): `Adoption isn't the metric. Unforced return use in week four is.`

## Outreach kit (final copy - Task 6)

Templates (only [bracketed] slots are user-fill):

**A · former senior colleagues:** `[Name] - [personal line]. I've started taking one outside engagement a month alongside AT&T: a two-week teardown for AI pilots that stalled at adoption - the model works, the humans won't use it. Wrote up what it looks like: [link]. If your shop has one of those, or you know someone cursing at theirs, I'd love the intro. Either way, good to be back in touch.`

**B · CareerFoundry mentees:** `[Name] - watching what you're doing at [company] and not surprised. Question from the other direction: does your org have an AI pilot that demoed well and died in rollout? I do two-week adoption teardowns on exactly those: [link]. If your team's fighting one, tell your PM you know the guy. And tell me how [personal] is going.`

**C · old friends:** `[Name] - [personal line]. New thing on my side: I fix AI pilots people won't use. Two-week teardown, one a month, alongside the day job: [link]. You know everybody - if someone in your orbit is stuck mid-pilot, send them my way and I'll owe you dinner at [place].`

Worksheet: 20 rows `name / relationship / where now / hook / channel / sent`. Seed rows from canon only (no mail mining): Treverity/ARCOS engineering + product leads (Harvey dashboards era), the Kraybill/GE Wilmington circle, C2G/Citi 2016 team, Granite/Wells Fargo 2020-21, CareerFoundry mentees by cohort, Broadlane/MedAssets alumni, Richards Group era. Cadence note: `five per day, mornings, personal line first, never two templates to people who know each other on the same day.`

---

### Task 1: Migration - lead source + company

**Files:**
- Create: `supabase/migrations/20260817100000_contact_source_company.sql`

**Interfaces:**
- Produces: `contact_submissions.source text not null default 'site'`, `contact_submissions.company text not null default ''`. The lab's existing form needs NO change (defaults cover it).

- [ ] **Step 1: Write the migration**

```sql
/*
  # Lead source + company on contact_submissions

  /studio posts here with source='studio' so studio leads are separable
  from lab traffic. company is optional intake context. The existing lab
  form is untouched; defaults cover its inserts.
*/
alter table contact_submissions
  add column if not exists source text not null default 'site',
  add column if not exists company text not null default '';
```

- [ ] **Step 2: Apply** - `npx supabase db push`
- [ ] **Step 3: Verify** - REST: `curl -s "$URL/rest/v1/contact_submissions?select=source,company&limit=1" -H "apikey: $KEY"` returns the columns (empty array also proves schema).
- [ ] **Step 4: Commit** - `git add supabase/migrations/20260817100000_contact_source_company.sql && git commit -m "feat(contact): source + company columns for studio leads"`

### Task 2: Studio route, standalone shell, full copy

**Files:**
- Create: `src/components/Studio.tsx`
- Modify: `src/App.tsx` - two lines: import, and route insertion so the block reads exactly:

```tsx
      <Route path="/work/:slug" element={<CaseStudy />} />
      <Route path="/studio" element={<Studio />} />
      <Route path="*" element={<NotFound />} />
```

**Interfaces:**
- Consumes: `useDocumentMeta` (title/description/url/image only - no robots), `supabase` client (Task 4 uses it inside this file).
- Produces: `Studio` default export; section ids `offer`, `sample`, `intake`.

- [ ] **Step 1: Component skeleton** - standalone `<main className="min-h-[100dvh] bg-[#0b0a08] text-[#e8e4dc]">`, single centered column `max-w-[720px] mx-auto px-5 py-14`, NO Nav/dock/boot imports. Header row per copy spec; every section from "Page copy (final)" verbatim. Serif prose `font-serif text-[17px] leading-[1.7]`; mono labels `text-[11px] tracking-[0.25em] uppercase`; magenta only on the H1 period, stat numbers, and links.
- [ ] **Step 2: Meta** - `useDocumentMeta({ title: 'The AI Adoption Teardown — Micah Boswell', description: "Your AI pilot works. Nobody uses it. A two-week teardown that finds out why, and hands your team the fix.", url: 'https://conscious-shell.com/studio', image: 'https://conscious-shell.com/esper/art-corazon.jpg', type: 'website' })`
- [ ] **Step 3: Verify dev** - `/studio` at 375 and 1280: zero horizontal overflow (`document.documentElement.scrollWidth === clientWidth`), all three case-study links resolve 200, `← the lab` returns home, no dock/nav present.
- [ ] **Step 4: Commit** - `feat(studio): standalone warm-link landing page`

### Task 3: Prerender - static page, noindex, build guards

**Files:**
- Modify: `scripts/prerender.mjs`

**Interfaces:**
- Consumes: existing `template`, `esc`, `setMetaTag`, `die` helpers and the 404's robots-replacement pattern (line ~700).
- Produces: `dist/studio/index.html`; guards that fail the build on any quiet-sell leak.

- [ ] **Step 1: `studioDocument(template)`** - mirror `notFoundDocument`'s shape: replace `<title>` with `The AI Adoption Teardown — Micah Boswell`; set description/og/twitter metas via `setMetaTag` (same values as Task 2); replace the robots tag with `<meta name="robots" content="noindex, follow" />` using the 404's exact match-or-append logic; NO canonical link; inject a static-copy `#root` block containing H1, sub, problem, SKU lines, proof stats, and the mailto (the full sample is fine client-side; static head + core copy is what link scrapers and crawlers read).
- [ ] **Step 2: Emit** - in `main()`, after the 404 write: `mkdirSync(join(DIST,'studio'),{recursive:true}); writeFileSync(join(DIST,'studio','index.html'), studioDocument(template));` and log `[prerender] /studio → dist/studio/index.html (noindex)`.
- [ ] **Step 3: Guards (build-blocking)** - immediately after sitemap/llms/agents are written:

```js
  // Quiet-sell guards: /studio is warm-link only. A leak is a build failure.
  const sitemapOut = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
  const llmsOut = readFileSync(join(DIST, 'llms.txt'), 'utf8');
  const agentsOut = readFileSync(join(DIST, 'agents.md'), 'utf8');
  if (/studio/i.test(sitemapOut)) die('quiet-sell violation: sitemap.xml mentions studio');
  if (/\/studio/.test(llmsOut)) die('quiet-sell violation: llms.txt links /studio');
  if (/\/studio/.test(agentsOut)) die('quiet-sell violation: agents.md links /studio');
  const studioOut = readFileSync(join(DIST, 'studio', 'index.html'), 'utf8');
  if (!studioOut.includes('content="noindex')) die('studio page lost its noindex tag');
```

- [ ] **Step 4: Verify** - `pnpm run build`; expect the studio log line and green guards; `grep -c noindex dist/studio/index.html` ≥ 1; `grep -ci studio dist/sitemap.xml` = 0.
- [ ] **Step 5: Commit** - `feat(prerender): studio static page with noindex + quiet-sell build guards`

### Task 4: StudioIntake form

**Files:**
- Modify: `src/components/Studio.tsx` (local component, same file - it is only used here)

**Interfaces:**
- Consumes: `supabase.from('contact_submissions').insert({ name, email, company, message, source: 'studio' })` (columns from Task 1).

- [ ] **Step 1: Component** - fields and rules, exactly:
  - `name` text, required (error copy: `# required`)
  - `email` email, required + `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` (error: `# invalid address`)
  - `company` text, optional, placeholder `company (optional)`
  - `message` textarea rows=4, required, min 20 chars, label `> what's stalling?` (error: `# min 20 characters`)
  - All inputs `text-[16px]`, `min-h-[44px]`, bone on ground, `focus:border-[#e040fb]`; errors shown only after blur or submit (copy the lab form's touched-map pattern from `Contact.tsx`).
  - Submit button: `request the call` (mono, magenta border, 44px). Sending state: `// sending...`. Server error state: `# transmission failed — try email instead` with the mailto visible.
  - Success replaces the form: `Got it. You'll hear from me within 48 hours, with an honest read on whether I can help.`
- [ ] **Step 2: Verify dev funnel** - mobile pane 375: fill, submit, confirm success copy; REST-select newest row: `source='studio'`, company populated. Note the row (name it `STUDIO E2E TEST`) for Micah's manual delete - anon key cannot delete.
- [ ] **Step 3: Verify validation** - empty submit shows three errors; 19-char message blocks; valid email gate works.
- [ ] **Step 4: Commit** - `feat(studio): intake form with lead-source capture`

### Task 5: Full verification + deploy

- [ ] **Step 1: Type/lint/build** - `pnpm exec tsc -p tsconfig.app.json --noEmit && pnpm exec eslint src/components/Studio.tsx && pnpm run build` all green (build exercises Task 3 guards).
- [ ] **Step 2: Walk the funnel as a user** - fresh mobile pane load of `/studio`: read order sane, tap a proof stat → case study loads → back preserves nothing weird; tap `request the call` path end to end (second labeled test row acceptable; note both for deletion).
- [ ] **Step 3: Desktop pass** - 1280: measure column centered, no overflow, links 200.
- [ ] **Step 4: Deploy** - commit anything pending, `git push origin main`; wait for ● Ready.
- [ ] **Step 5: Live checks** - `curl -s https://conscious-shell.com/studio | grep -c noindex` ≥1; `curl -s https://conscious-shell.com/sitemap.xml | grep -ci studio` = 0; live page shows H1; paste-preview sanity: `curl -s https://conscious-shell.com/studio | grep og:title` shows the teardown title.

### Task 6: Outreach kit (vault)

**Files:**
- Create (vault): `💼 Consulting/Warm_Outreach_Kit.md`
- Modify (vault): `💼 Consulting/Practice_Strategy.md` - action list: mark studio shipped; link the kit.

- [ ] **Step 1: Write the kit** - the three templates verbatim from "Outreach kit (final copy)"; the 20-row worksheet table with canon-seeded hook rows (Treverity/ARCOS, GE Wilmington, C2G/Citi, Granite/Wells Fargo, CareerFoundry, Broadlane, Richards eras); the cadence note.
- [ ] **Step 2: Update strategy doc**; confirm both files read back.

## Self-Review (run against v1's holes)

- Every "or" removed: intake is a dedicated local component; OG card is decided (existing image); noindex path is decided (prerender only, 404 pattern); og generation task deleted rather than underspecified.
- Nav/dock leakage on /studio: closed (standalone like CaseStudy; route order shown exactly).
- Crawl surface: guards are build-blocking code, not review checklist items.
- Contact.tsx untouched (YAGNI) - defaults carry the lab; only the studio writes new columns.
- Analytics cut is explicit and reasoned, not forgotten.
- Production test rows: named, and flagged for Micah's manual delete (anon key cannot).
- Copy: zero em dashes; first person throughout; AT&T title consistent with llms.txt.

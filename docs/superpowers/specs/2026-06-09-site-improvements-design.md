# Site Improvements — Design Spec
**Date:** 2026-06-09  
**Project:** tears-in-rain (conscious-shell.com)  
**Approach:** Phase B — quick wins first, each phase independently deployable and verified

---

## Scope

9 issues identified across 4 phases. Each phase ends with a deploy + verify cycle before the next begins.

---

## Phase 1 — Quick Fixes (est. 20–30 min)

### 1.1 Fix LinkedIn URL

**File:** `src/components/Contact.tsx` line 53  
**Change:** `https://www.linkedin.com/` → `https://www.linkedin.com/in/micahboswell`

### 1.2 Fix copy inconsistency

**File:** `src/components/About.tsx`  
**Bio paragraph** says "20+ years" in two places. Hero hardcodes "30 years".  
**Change:** Update both About paragraphs to say "30 years" / "30+ projects across..."

### 1.3 Remove dead code

Dead components — never imported in `App.tsx` or any active component:

| File | Reason safe to delete |
|------|----------------------|
| `src/components/GithubLab.tsx` | Never imported in App.tsx |
| `src/components/GenerativeThumb.tsx` | Only used by GithubLab |
| `src/components/ArticleConstellation.tsx` | Never imported anywhere |
| `src/components/BaselineDrift.tsx` | Never imported anywhere |

Dead import — imported in App.tsx but never rendered:

| Location | Change |
|----------|--------|
| `src/App.tsx` line 58 | Remove `const AgentBattle = lazy(...)` import line |

**Note:** `TransmissionPanel.tsx` is NOT dead — Manifesto.tsx uses it.  
**Note:** `ScrambleText.tsx` is NOT dead — HumanLayer and HaikuDeck use it.

### 1.4 Verification

- [ ] LinkedIn click → lands on micahboswell profile
- [ ] About bio reads "30 years" consistently with Hero
- [ ] `npx vite build` produces 0 errors, bundle is smaller
- [ ] Deploy and confirm at conscious-shell.com

---

## Phase 2 — OG/Social Meta + Favicon (est. 1–2 hrs)

### 2.1 OG Image (1200×630)

Create `/public/og-image.png` matching site aesthetic:
- Background `#07070a`
- Left column: `conscious_shell v4.7` in monospace, magenta `●` dot, then "Micah Boswell" large
- Right column: cyan rule, "Design Leader · 30 years · 126 projects"
- Bottom strip: `research → product → traction → organizations that ship`
- Palette: cyan `#00d4ff`, magenta `#e040fb`, off-white `#e8e4dc`, dim `#6b6660`
- Generated as a static PNG via a short Node/Canvas script, committed to `/public/`

### 2.2 Favicon

Replace `vite.svg` with `/public/favicon.svg`:
- Dark `#07070a` background
- Square with a small magenta `■` mark or stylized `M` in `#e040fb`
- Also generate `favicon-32.png` and `favicon-16.png` for broad browser support
- Add `apple-touch-icon.png` (180×180)

**File:** `index.html` — update `<link rel="icon">` to point to new favicon

### 2.3 Complete social meta in index.html

Add/update these tags:

```html
<meta property="og:type"        content="website" />
<meta property="og:url"         content="https://conscious-shell.com" />
<meta property="og:site_name"   content="conscious_shell" />
<meta property="og:image"       content="https://conscious-shell.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card"       content="summary_large_image" />
<meta name="twitter:image"      content="https://conscious-shell.com/og-image.png" />
<meta name="twitter:creator"    content="@socraticstatic" />
```

Existing `og:title`, `og:description`, `twitter:card` are present — just need image + url + type.

### 2.4 Verification

- [ ] Share URL in iMessage/Slack — preview card appears with image
- [ ] Check via `https://opengraph.xyz/?url=https://conscious-shell.com`
- [ ] Favicon appears in browser tab after deploy
- [ ] Apple touch icon works when added to iOS home screen

---

## Phase 3 — Contact Form via Supabase (est. 2–3 hrs)

### 3.1 Supabase schema

New table `contact_submissions`:

```sql
create table contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  message     text not null,
  created_at  timestamptz default now()
);

-- RLS: allow anonymous inserts only (no reads)
alter table contact_submissions enable row level security;
create policy "anon insert" on contact_submissions
  for insert to anon with check (true);
```

No reads exposed publicly. You query via Supabase dashboard or service key.

### 3.2 Form component

Replace the two-button CTA block in `Contact.tsx` with a terminal-style form. The mailto button remains as a fallback beneath.

**Fields:**
- `name` — text input, required
- `email` — email input, required, basic format validation
- `message` — textarea, required, min 20 chars

**Visual style** — consistent with site aesthetic:
- Dark `#0b0a08` background inputs, `#2a2620` border, cyan focus ring `#00d4ff`
- Labels in `[#6b6660]` monospace, prefix `> `
- Submit button: `border border-[#e040fb] text-[#e040fb] hover:bg-[#e040fb] hover:text-[#07070a]`
- All inputs have `font-mono` to match terminal feel

**States:**
- `idle` — form visible, submit enabled
- `sending` — submit disabled, `// transmitting...` label
- `success` — form hidden, terminal success block: `# handshake CONFIRMED`, `# message queued`, timestamp
- `error` — inline error below submit: `# transmission failed — [error message]`, form remains editable

### 3.3 Validation

Client-side only (no library):
- All fields required
- Email must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Message min 20 chars
- Show inline error per field on blur, clear on focus

### 3.4 Verification

Full lifecycle test:
- [ ] Submit form with all valid data → success state appears
- [ ] Check Supabase dashboard → row exists with correct name/email/message
- [ ] Refresh page → form resets to idle
- [ ] Submit with blank fields → inline errors appear, no submission
- [ ] Submit with invalid email → inline error on email field
- [ ] Submit with short message → inline error on message field

---

## Phase 4 — Mobile Work Section (est. 1 hr)

### 4.1 Problem

On mobile, the right-column Esper panel (client, role, year metadata) is `hidden lg:block`. The mobile project row shows title + tags + year — but `client` and `role` are missing entirely on small screens.

### 4.2 Fix

In `ProjectRow` (Work.tsx), the mobile card block already has a layout. Add a compact metadata line directly below the title:

```
./lead_product_designer · Treverity          [existing role line — keep]
Dashboard Redesign                           [title]
Treverity · VP UX · 2022                    [ADD: client · role · year — small, dim]
```

Implementation: add a `<div className="md:hidden text-[10px] text-[#4a453e] mt-1">` with `{project.client} · {project.role} · {project.year}` after the title element in the mobile block.

No change to desktop layout.

### 4.3 Verification

- [ ] Resize browser to 375px width
- [ ] Scroll through Work section — every project row shows client, role, year
- [ ] Desktop unchanged — Esper panel still shows on large screens
- [ ] Deploy and check on actual phone

---

## Sequence summary

```
Phase 1 → deploy → verify → Phase 2 → deploy → verify → Phase 3 → deploy → verify → Phase 4 → deploy → verify
```

Each phase is a separate commit. No phase begins until the prior one is verified live.

---

## What is NOT in scope

- Rewriting About biography (copy-only, low impact)
- Recognition section structure (clean as-is)
- Services section visual redesign (functional, low priority)
- Any new sections or features beyond the 9 issues listed

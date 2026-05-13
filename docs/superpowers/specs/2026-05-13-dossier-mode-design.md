# Dossier Mode — Design Spec

**Date:** 2026-05-13  
**Status:** Approved  
**Phase:** 01 of 04 (Radical Ideas roadmap)

---

## Overview

Dossier Mode is an in-place case study experience. Clicking any project card transforms the current page — the portfolio grid blurs behind a full-width classified dossier overlay. No navigation, no new page load. ESC returns the visitor exactly where they were.

This is phase 01 of a four-system roadmap: Dossier Mode → The Breach → TYRELL.OS Terminal → Commission Terminal.

---

## User Experience

### Trigger
Any project card in the `Work` component gets an `onClick` handler. Clicking opens the dossier for that project.

### Enter animation (300ms)
1. Page content blurs to 15% opacity (`filter: blur(4px)`)
2. `DossierPanel` slides up from bottom (`translateY(100%) → translateY(0)`, `ease-out`)
3. Top amber border draws from left to right (CSS `width` animation)
4. STAR sections fade in staggered (50ms apart, `opacity: 0 → 1`)
5. Background scroll is locked (`overflow: hidden` on `body`)

### Exit (ESC key or ✕ button)
1. Panel slides down (`translateY(0) → translateY(100%)`, 200ms `ease-in`)
2. Page un-blurs
3. Scroll position preserved — no jump

---

## Layout

Three-column layout inside the dossier:

```
┌──────────────────────────────────────────────────────────────┐
│ ■ CLASSIFIED DOSSIER · [PROJECT NAME] · ACCESS: OPERATOR  ✕  │  ← topbar
├────────────┬───────────────────────────┬─────────────────────┤
│            │                           │                     │
│  METADATA  │      HERO IMAGE           │   STAR NARRATIVE    │
│  200px     │      flex-grow            │   240px             │
│            │                           │                     │
│  Year      │                           │  Situation ──────── │
│  Client    │                           │  Task ────────────  │
│  Role      │                           │  Action ──────────  │
│  Tags      │                           │  Result ──────────  │
│            │                           │                     │
│  Status    │                           │                     │
├────────────┴───────────────────────────┴─────────────────────┤
│ Additional artifacts  [thumb] [thumb] [thumb]  Populate…     │  ← gallery strip
└──────────────────────────────────────────────────────────────┘
```

### Topbar
- Left: amber `■` + "CLASSIFIED DOSSIER" + project name + "ACCESS: OPERATOR"
- Right: "REP-7 FILE #XXXX" + ESC ✕ close button
- `font-size: 9px`, `letter-spacing: 0.4em`, `text-transform: uppercase`

### Metadata column (200px, `border-right: 1px solid #1f1c17`)
- Year (large, amber, `22px`)
- Client
- Role
- Tags (existing `tags` array, rendered as small bordered pills)
- Status badge at bottom: always `● CASE FILE ACTIVE` in green — any project that has been seeded with STAR content is considered an active file. No `status` DB field needed.

### Image column (flex-grow)
- Hero image (`object-fit: cover`, fills column)
- Falls back to a dark gradient placeholder if `image_url` is empty

### STAR column (240px, `border-left: 1px solid #1f1c17`)
- Four sections: Situation / Task / Action / Result
- Each section: small amber label with trailing `────` line, then body text
- `font-size: 11px`, `color: #a8a29e`, `line-height: 1.7`
- Scrollable if content overflows

### Gallery strip
- `border-top: 1px solid #1f1c17`
- Shows `gallery_urls` as 60×40px thumbnails
- If empty: shows 3 dashed placeholder boxes + "Populate as available" label in `#2a2620`

---

## Components

### `DossierPanel.tsx` (new)
Props:
```ts
type DossierPanelProps = {
  project: Project | null;  // null = closed
  onClose: () => void;
};
```
- Renders `null` when `project` is null (no DOM cost when closed)
- Uses `framer-motion` `AnimatePresence` for enter/exit
- ESC key listener via `useEffect`
- Scroll lock via `useEffect` toggling `document.body.style.overflow`

### `Work.tsx` (modified)
- Adds `useState<Project | null>(null)` for `activeDossier`
- Passes `onClick={() => setActiveDossier(project)}` to each project card
- Renders `<DossierPanel project={activeDossier} onClose={() => setActiveDossier(null)} />`
- Applies `filter: blur(4px) opacity-15` class when `activeDossier !== null`

---

## Data Model

### Migration: add STAR fields + gallery to `portfolio_projects`

```sql
ALTER TABLE portfolio_projects
  ADD COLUMN IF NOT EXISTS situation  TEXT,
  ADD COLUMN IF NOT EXISTS task       TEXT,
  ADD COLUMN IF NOT EXISTS action     TEXT,
  ADD COLUMN IF NOT EXISTS result     TEXT,
  ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}';
```

### Seed script
Scrape the 15 project pages from `conscious-shell.com` and INSERT the STAR content into the new columns. AT&T seeded as the initial demo. All 15 populated before launch.

### `supabase.ts` type update
Add the five new fields to the `Project` type.

---

## Styling

Follows existing portfolio palette:
- Background: `#080706`
- Top border accent: `#e7b766`
- Labels: `#e7b766`, `font-size: 9px`, `letter-spacing: 0.4em`
- Body text: `#a8a29e`
- Borders: `#1f1c17`
- Dim text: `#4a453e`
- Status green: `#4ade80`
- Font: inherits `font-mono` from root

The dossier should feel continuous with the rest of the site, not like a modal from a different design system.

---

## Out of Scope

- Mobile layout (defer to later iteration)
- Multiple images per project (gallery field is in schema but UI shows placeholders until populated)
- Keyboard navigation between projects inside the dossier
- Sharing / permalink to a specific project dossier

---

## Success Criteria

1. Clicking any project card opens its dossier
2. ESC and ✕ both close it and restore scroll position
3. STAR content displays for all 15 seeded projects
4. Transition feels cinematic — not jarring
5. Gallery strip renders placeholders when `gallery_urls` is empty

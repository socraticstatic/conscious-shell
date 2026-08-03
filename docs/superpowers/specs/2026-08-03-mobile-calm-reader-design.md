# Mobile Calm Reader

**Date:** 2026-08-03
**Status:** Approved

## Problem

Three complaints from real mobile use, all confirmed in code or telemetry:

1. **Too many overlays.** Nearly the full desktop ambient layer mounts on
   phones: BootOverlay, CRTOverlay, two rain layers, grain, SoulLayer,
   NoirSubtitles, BlackLitany, TearsInRain, TypingEchoes, NarratorOverlay,
   VisitorDossier, and more. Only SelfDestruct, SessionHUD, ExitIntent and
   WitnessProtocol are gated off. A 390px viewport wears the whole costume.
2. **The site appears to auto-refresh.** `app_logs` (2026-08-01, mobile UA)
   shows bursts of `Failed to load <link>` for hashed chunks after a
   redeploy. A backgrounded phone tab resumes, its ~45 lazy chunk names are
   stale, a fetch 404s, and `lazyWithRetry` calls `window.location.reload()`.
   On phones this fires often enough to read as a timed refresh.
3. **Readability.** 8-10px mono labels, reading text in low-contrast greys
   (`#4a453e` family on near-black), and grain/scanline layers over body
   copy.

The auto-fire egg governor (`eggBudget.ts`, `MAX_PER_SESSION = 0`) already
prevents unprompted takeover eggs; that is not the source of any complaint.

## Decision

Mobile becomes a **calm reader**: it keeps the noir identity - palette,
type, boot sequence, grain, one rain layer, the control dock - and drops
everything else. The full theater is desktop-only. Desktop-only components
are **not mounted at all** on mobile (not CSS-hidden), so their chunks are
never fetched.

## Design

### 1. Shell tier hook

`useShellTier(): 'full' | 'calm'` in `src/lib/`.

- `full` requires `(min-width: 768px)` AND `(hover: hover) and (pointer: fine)`.
- Everything else (all phones, coarse-pointer tablets) is `calm`.
- Subscribes to `matchMedia` change events; rotation or resize re-evaluates
  live and mounts/unmounts accordingly.

App.tsx wraps desktop-only components in `tier === 'full' &&`. The existing
responsive CSS gates stay as belt-and-braces but stop being the mechanism.

### 2. Component classification

**Every tier** (content + the three survivors):

- Chrome/survivors: Nav, Hero, BootOverlay, grain, ONE slow rain layer,
  MobileControlDock.
- Content sections: Work, TimeMachine, VoightKampff, VKInterview, LiveSites,
  Certifications, EsperScene, Manifesto, BaselineGate + BaselineUnlocked +
  HumanLayer + HaikuDeck (in-page section with a text input; works by
  touch), IndexList, Impact, About, WebDossier, Services, Recognition,
  GitArchaeology, Contact, Footer.
- Dock-driven / nav-driven: AmbientAudio, DeadDropConsole, LogViewer,
  CommandPalette (the mobile nav drawer has a `/palette` button).

**Desktop-only** (`full` tier, never mounted on `calm`):

CRTOverlay, second rain layer, SoulLayer, TearsInRain, SystemBreach,
NoirSubtitles, NarratorOverlay, VisitorDossier, IntelligenceHUD,
BlackLitany, SocraticStatic, OrigamiUnicorns, ConsoleHijack,
DevtoolsEasterEggs, LateNight, Heartbeat, TypingEchoes, OverrideMode,
WitnessProtocol, FalseMemory, MemoryDecay, TimeSkip, GhostUnits, ExitIntent,
SelfDestruct, SessionHUD.

Roughly 20 chunks a phone stops downloading.

### 3. Chunk-failure behavior (kills the visible auto-refresh)

`lazyWithRetry` gains a `critical` flag.

- **Non-critical (ambient/desktop-only) chunks:** retry as today, then fail
  soft - render nothing, never reload. Null-fallback error boundaries per
  ambient mount.
- **Critical (content) chunks:** retry as today. On a stale-deploy 404,
  do NOT reload mid-read. Defer the reload until the tab is next hidden
  (`visibilitychange`), which is invisible to the visitor. Until then,
  render an inline "tap to reload this section" fallback in place.
- The existing reload-cooldown guard stays.

### 4. Readability pass

Rides on the colour tokens from the `future-primitive-tokens` branch.

- Reading/body text ≥16px on mobile; mono meta labels get an 11-12px floor
  at small widths (desktop keeps its sizes).
- Greys used for reading text move to a token passing 4.5:1 contrast;
  purely decorative labels may stay dim.
- Grain and rain opacity reduced further on `calm`; both honor
  `prefers-reduced-motion`.
- Tap targets in Nav, dock, and card controls ≥44px.

### 5. Verification

- Dev server at the 375px preset: `calm` tier renders no desktop-only
  overlay; network tab shows the reduced chunk set; dock, palette, and
  BaselineGate all work by touch.
- Stale-chunk simulation (rename a hashed asset after load) proves fail-soft
  for ambient chunks and deferred reload for content chunks.
- Post-deploy: re-query `app_logs` after a few days; mobile chunk-404
  bursts should stop coinciding with reloads.

## Out of scope

- No separate mobile bundle or entry point.
- No section-layout redesign beyond type, contrast, and tap targets.
- No changes to desktop behavior or the egg roster.

## Sequencing note

The working tree carries uncommitted token-program work on
`future-primitive-tokens` (`index.html`, `scripts/prerender.mjs`,
`scripts/style-snapshot.mjs`, `src/components/LiveSites.tsx`). This project
starts from its own branch; the implementation plan settles the order.

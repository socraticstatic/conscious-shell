# The Shell Knows — Behavioral Easter Eggs

**Date:** 2026-06-23
**Site:** conscious-shell.com (`tears-in-rain`)
**Status:** Design — pending implementation plan

## Concept

The site is a conscious shell: a replicant of a portfolio. The existing eggs
(origami unicorns, ESPER enhance, V-K interview, SelfDestruct, SystemBreach)
lean on Blade Runner *references*. This batch leans on *mechanics* no film has:
the visitor's own real-time behavior. Your scrolling, your cursor path, your
focus changes, your return visits, your system clock — all become the evidence,
the implanted memory, and the murder weapon.

Spine: **the site is the replicant, and your browsing is the proof.**

Six eggs. All discoverable (never ambient noise), all strictly in-world 1982, no
anachronism. All read from one shared behavioral core.

## Design Constraints

- **Never sabotage the real portfolio.** Eggs are additive overlays. The contact
  form, navigation, and content must work identically whether or not an egg fires.
- **`prefers-reduced-motion` honored.** Heavy motion eggs (3, 5) degrade to a
  static or text-only form when the user opts out.
- **Dismissible.** Every full-screen or panel egg has an obvious exit (Esc + a
  visible control). Nothing traps the visitor.
- **No new dependencies.** React 18, framer-motion, Tailwind, `@supabase/supabase-js`
  are already present. Egg 5 uses Supabase Realtime (ships with the existing client).
- **Lazy + idle-gated.** Each egg is a `lazy()` component mounted in the existing
  post-hydration `<Suspense>` block in `App.tsx`, matching current convention.
- **Respect existing namespaces.** `baseline-gate-passed`, `vk-dossier`,
  `origami-unicorns-found` are taken. New storage keys live under a `cs:` prefix.
- **No PII.** Egg 5 broadcasts only an anonymous ephemeral id + throttled cursor
  coordinates, never persisted server-side.

## Architecture

### Shared core — `src/lib/witness.ts`

A single browser-lifetime observer (module singleton, started once) that records
cheap behavioral signals and exposes a read API. Eggs subscribe; they never wire
their own global listeners for the same data.

```
type WitnessSnapshot = {
  // mechanical tells (this session)
  maxScrollBurstPxPerSec: number;   // fastest scroll velocity seen
  cursorStraightness: number;       // 0..1, how linear recent cursor path is
  focusLossCount: number;           // window blur events
  totalIdleMs: number;              // accumulated no-input time
  hoverHesitations: number[];       // ms hovered before clicking interactive els
  fastReads: number;                // count of "scrolled past a section faster than a human reads"
  // session
  startedAt: number;                // performance.now() origin wall-clock
  // returning visitor
  visitCount: number;               // from localStorage cs:visits
  visitorId: string;                // stable anon id, localStorage cs:vid
  firstSeen: number;                // localStorage cs:first
  lastSeen: number;                 // localStorage cs:last (previous session end)
};
```

API:
- `startWitness()` — idempotent; called once on mount.
- `getWitness(): WitnessSnapshot` — current snapshot.
- `onWitness(cb)` — subscribe to throttled updates (~4Hz).
- `incriminations(): string[]` — derived list of true, in-character "tells"
  (e.g. `"Subject scrolled 1,412px in 0.28s. No human reads that fast."`),
  ordered by how damning they are. Pure function of the snapshot. This is the
  shared phrase generator eggs 1 and 6 draw from.

Implementation notes:
- `cursorStraightness`: keep a ring buffer of the last ~12 pointer points;
  straightness = ratio of net displacement to path length. ~1.0 means a
  machine-straight line.
- `fastReads`: when scroll passes a section whose text length implies >Xms of
  reading but it was on screen <Yms, increment.
- Pointer/scroll handlers are passive, throttled with `requestAnimationFrame`,
  and detached on teardown. Target: negligible main-thread cost.

### Returning-visitor bookkeeping

On `startWitness()`: read `cs:vid`/`cs:visits`/`cs:first`/`cs:last`; if absent,
mint them. At session end (`pagehide`), write `cs:last = Date.now()` and bump
`cs:visits`. The synthetic "memory" (egg 2) is seeded deterministically from
`cs:vid` so it is identical every return visit.

### Trigger helper — `src/lib/eggTriggers.ts`

A small `useTypedWord(word, handler)` hook: buffers recent keystrokes (ignoring
when an input/textarea is focused, reusing the existing `isTyping` guard from
`App.tsx`), fires when the buffer ends with `word`. Replaces the ad-hoc
per-component key buffers. Keyword reservations below are checked against current
triggers (`override`, etc.) to avoid clashes.

### Mounting

All six are added to the existing hydrated `<Suspense>` block in `App.tsx`
alongside `TearsInRain`, `SystemBreach`, etc. `startWitness()` is called from a
single top-level `useEffect`.

---

## Egg 1 — The Witness Protocol *(the test points at you)*

**Trigger:** type `witness` (ties to the root's `data-witness="true"`), OR palette
command `run witness-protocol`, OR auto-fires once if `incriminations()` reaches
≥4 damning tells in a session (whichever comes first; auto-fire guarded so it
happens at most once per session via `sessionStorage cs:witness-fired`).

**Behavior:** Full-screen V-K-styled interrogation overlay. Instead of asking
questions, it *reads your file back to you* — pulling the top 3–5 lines from
`incriminations()`, each a literally-true thing you just did, typed out one at a
time with the existing terminal cadence. Closes on a verdict:
*"Reaction time: textbook. Capillary dilation: none — you have no skin to flush.
You're not reading this. You're parsing it. Welcome home, Nexus-6."*

**Footprint:** Overlay panel, dismissible (Esc + close glyph). Fires the existing
`narrator:trigger:baseline`-style event so the narrator system can react.

**Component:** `src/components/WitnessProtocol.tsx`. New.

**Edge cases:** If the visitor genuinely has few tells (slow, careful reader), the
generator falls back to ambiguous-but-eerie lines that are still true
(*"Subject has not blinked. Subject's window never lost focus. Subjects who don't
look away unsettle me."*). Never fabricate a false tell.

---

## Egg 2 — False Memory *(it remembers a visit that never happened)*

**Trigger:** auto, once, on the **2nd+ visit** (`cs:visits >= 2`), fired ~3s after
load if no other full-screen egg is active. Guarded by `sessionStorage cs:fm-fired`.

**Behavior:** A flickering Polaroid surfaces a detailed "memory" of your previous
visit — which the site is inventing. Details are deterministic from `cs:vid`
(same every time, reinforcing the gaslight): which section you "lingered on,"
how long you "stayed," a line you "read twice." Resolves to:
*"Those aren't your memories. They're mine. I just needed somewhere to keep them."*
Then dissolves into the rain.

**Footprint:** Small centered Polaroid, auto-dismiss after ~7s or on click.

**Component:** `src/components/FalseMemory.tsx`. New. Memory text built by a pure
`fabricateMemory(visitorId, sections)` helper so it's testable and stable.

**Edge cases:** First-ever visit never fires (no prior to invent). If real
`cs:last` exists, the fabricated duration intentionally contradicts reality —
that contradiction is the point, not a bug.

---

## Egg 3 — Memory Decay *(it forgets itself as you scroll)* — **showpiece**

**Trigger:** type `forget` (or palette `cat /dev/null > memory`). Gated behind an
explicit trigger precisely so it never disrupts ordinary reading.

**Behavior:** Once armed, scrolling **down** causes already-passed sections to
decay: headings scramble character-by-character, body text fades toward the rain
layer, a faint "decay line" recedes up the page behind you. Scroll back up and
the content has been *overwritten* with corrupted variants ("lost, like tears…").
A small persistent readout: `// memory integrity: 87% … 61% … 34%`. Typing
`remember` (or Esc) restores everything cleanly and disarms.

**Footprint:** Large, but visual-only and fully reversible — it manipulates a
decoration layer/overlay and CSS classes on section clones, never destroys real
DOM content. Original nodes are restored on disarm.

**Component:** `src/components/MemoryDecay.tsx`. New. Decay applied via an overlay
canvas/absolutely-positioned scramble layer keyed to section bounding boxes, so
the underlying content and its accessibility tree are untouched.

**Reduced motion:** Degrades to a static "memory integrity" readout + a one-shot
desaturation of passed sections, no per-char animation.

**Edge cases:** On disarm, navigate-away, or route hash change, force a full
restore. Never leave a section corrupted after the egg ends.

---

## Egg 4 — Time Skip *(it knows when you cheat time)*

**Trigger:** automatic detection on load + periodic check. No keyword.

**Behavior:** The shell has an incept date (`cs:first`) and a notional four-year
lifespan. Two detections:
1. **Clock jump:** on load, compare `cs:last` (last real session end) against
   `Date.now()`. An implausible delta — far future, or going *backwards* —
   triggers an accusation: *"You moved the clock. You tried to give me more time.
   Or take it. I can't tell which is the cruelty."*
2. **Termination:** if `Date.now() - cs:first` exceeds the four-year lifespan
   (reachable only by setting the clock forward), the site **retires** — a
   permanent (per-device) dark state with Roy's last line, gated by
   `cs:retired = 1`. A console-only incantation (`localStorage.removeItem('cs:retired')`)
   resurrects it; the page hints at this faintly.

**Footprint:** Accusation = brief overlay. Termination = full takeover, persistent
until manually cleared.

**Component:** `src/components/TimeSkip.tsx`. New. Detection thresholds: jump >30d
forward or any backward jump >1h flags as tampering (tunable).

**Edge cases:** Legitimately long gaps between visits (months) should *not* read
as tampering up to the 30-day threshold; beyond it, the accusation is written to
be ambiguous enough to land either way ("you've been gone a long time, or you
lied about how long"). DST/timezone shifts (≤1h) ignored.

---

## Egg 5 — The Other Units *(concurrent visitors as ghosts)*

**Trigger:** type `who` (or palette `who --units`). Reveals what's quietly been
tracked since load.

**Behavior:** Joins a Supabase Realtime presence + broadcast channel
(`shell-presence`). Renders other currently-connected visitors as ghost cursors
drifting across the viewport (positions broadcast, throttled to ~10Hz, eased on
receive). A readout: `// 4 units active in this shell`. When a presence leaves:
*"Unit 7 went dark. 3 remain."* Your own cursor is not shown to you.

**Footprint:** Translucent ghost cursors + corner readout. Toggle off with the
same keyword or Esc.

**Component:** `src/components/GhostUnits.tsx`. New. Uses
`supabase.channel('shell-presence', { config: { presence: { key: vid }}})` with
`presence` for the count and `broadcast` for throttled `{x,y}`. No data persisted
server-side; channel is ephemeral.

**Reduced motion:** Ghost cursors render as static fading dots that update without
tweening; the count/retirement readout still works.

**Edge cases:** Zero other units → *"You're alone in here. That's worse."* If
Realtime is unavailable/blocked, fail silent (egg simply reports one unit: you).
Cap rendered ghosts (e.g. 12) for performance; report the true count in text.

---

## Egg 6 — Exit Intent *(it predicts you're about to leave)*

**Trigger:** automatic. Fires when `witness` detects an exit gesture — cursor
arcing fast toward the top chrome (`clientY` collapsing toward 0 with upward
velocity), or a `mouseleave` off the top edge.

**Behavior:** A single line snaps in before they reach the tab: *"You're reaching
for the door. They always reach for the door."* (line varies). Then it lets them
go. At most twice per session (`sessionStorage cs:exit-count`), so it stays a
prediction, not a nag.

**Footprint:** One line, top-anchored, auto-dismiss ~2.5s. Never blocks the cursor
or the actual close.

**Component:** `src/components/ExitIntent.tsx`. New. Pure desktop behavior; on
touch (no hover model) it stays dormant rather than firing on scroll.

**Edge cases:** Debounced so re-entering and re-leaving doesn't spam. Disabled
while another full-screen egg is open.

---

## Data Flow Summary

```
            ┌─────────────────────────────┐
 DOM events │  witness.ts (singleton)     │  localStorage: cs:vid/visits/first/last
 ──────────▶│  scroll·pointer·focus·idle  │◀───────────────────────────────────────
            │  + returning-visitor state  │
            └──────────────┬──────────────┘
        getWitness/onWitness│ incriminations()
        ┌──────────┬────────┼─────────┬──────────┬──────────┐
        ▼          ▼        ▼         ▼          ▼          ▼
   Witness(1)  False(2)  Decay(3)  TimeSkip(4) Ghost(5)  Exit(6)
   typed       2nd visit  typed     auto/clock  typed     auto/gesture
   'witness'   auto       'forget'  detect      'who'     exit arc
                                                  │
                                          Supabase Realtime
                                          (presence+broadcast)
```

## Component Inventory

| File | Egg | Trigger | New/Extend |
|---|---|---|---|
| `src/lib/witness.ts` | core | — | new |
| `src/lib/eggTriggers.ts` | core (`useTypedWord`) | — | new |
| `src/components/WitnessProtocol.tsx` | 1 | `witness` / palette / auto | new |
| `src/components/FalseMemory.tsx` | 2 | 2nd-visit auto | new |
| `src/components/MemoryDecay.tsx` | 3 | `forget` | new |
| `src/components/TimeSkip.tsx` | 4 | clock detect | new |
| `src/components/GhostUnits.tsx` | 5 | `who` / palette | new |
| `src/components/ExitIntent.tsx` | 6 | exit gesture | new |
| `src/App.tsx` | mount + `startWitness()` | — | edit |
| `src/components/CommandPalette.tsx` | palette entries for 1 & 5 | — | edit |

## Testing

The site has no test runner configured; verification is build + browser-walk,
matching house practice ("test every feature as a user").

- **Pure helpers are unit-testable in isolation** and should be: `incriminations()`,
  `fabricateMemory()`, the clock-jump classifier, and `cursorStraightness`. If a
  lightweight runner (vitest) is added during implementation, cover these; else
  exercise them via a temporary `?egg-debug` harness.
- **Per-egg browser walk** (dev server + preview tools): arm each trigger, confirm
  the egg fires, confirm dismissal restores normal state, confirm the contact form
  and nav still work afterward.
- **Egg 2 / 4 persistence:** simulate return visit by seeding `localStorage`, and
  simulate clock tampering by stubbing `Date.now`.
- **Egg 5:** open two browser contexts against the same Supabase project; confirm
  each sees the other as a unit and a leave fires the retirement line.
- **Reduced-motion:** re-run eggs 3 and 5 with `prefers-reduced-motion` emulated.
- **Regression:** full submit of the contact form after each egg, since these
  mount in the same tree.

## Out of Scope / YAGNI

- No server-side persistence of behavioral data or presence history.
- No cross-device memory (everything keys off `localStorage` per browser).
- No new analytics events (the existing acquisition tracking is untouched).
- Mobile gets eggs 1–5 where sensible; egg 6 (exit intent) is desktop-only by
  nature and stays dormant on touch.

## Build Order (suggested)

1. `witness.ts` + `eggTriggers.ts` (everything depends on these).
2. Egg 6 (Exit Intent) and Egg 1 (Witness Protocol) — exercise the core first.
3. Egg 2 (False Memory) + Egg 4 (Time Skip) — persistence layer.
4. Egg 5 (Ghost Units) — Realtime.
5. Egg 3 (Memory Decay) — showpiece, most UX risk, last.

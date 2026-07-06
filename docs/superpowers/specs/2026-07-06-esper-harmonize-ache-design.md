# Esper — harmonize, calm, ache

Date: 2026-07-06
Branch: `esper-harmonize-ache`

## Problem

The site has two "esper" machines that don't know about each other, a portfolio
hover that thrashes, and reveal copy that is competent noir but nobody's.

1. **Two disjoint espers.** `EsperPanel` (inside `Work`) is a magenta crosshair
   that auto-follows portfolio rows. `EsperScene` is a separate section: cyan +
   `#ff006e` pink, eight auto-rotating Unsplash frames, click-a-node-to-reveal.
   Same name, same metaphor, two visual languages, sitting rooms apart.
2. **Jarring portfolio hover.** Every `ProjectRow` fires `onMouseEnter → setActive`,
   re-running EsperPanel's 0.7s zoom + crosshair jump. Simultaneously an
   IntersectionObserver auto-advances `active` on scroll. Hover and scroll fight
   over one variable; the panel hard-swaps its image on every mouse twitch.
3. **Reveals have no ache.** "Mineral composition reads wrong for this latitude."
   Good atmosphere, no person under it.

## Decisions (from brainstorm)

- Espers: **harmonize, keep two.** Not merged.
- Hover: **quiet highlight only.** Esper re-aims on click / scroll-settle.
- Content: **more frames, keep the noir register** — but the noir must ache.
- Ache lives in: **esper reveals · source comments · one new hidden egg.**

## Design

### 1. Harmonize the two espers
One shared law: **cyan `#00d4ff` = tracking, magenta `#e040fb` = locked/revealed**,
in both components. `EsperScene` swaps its active/reveal accent `#ff006e → #e040fb`
so both units read as the same instrument. Both adopt one easing curve
(`cubic-bezier(0.22, 1, 0.36, 1)`, expo-out) and slower, softer timing. EsperScene's
zoom softens from `1 → 1.35 → 2.2` (abrupt) to `1 → 1.25 → 1.9` (settles).

### 2. Portfolio hover = quiet highlight
- Remove `onMouseEnter → setActive` from `ProjectRow`. Hover is a pure CSS tint.
- Keep `onClick → setActive` (explicit re-aim).
- IntersectionObserver: debounce ~150ms, and stand down for ~1200ms after any
  manual click, so scroll and click stop fighting. Track `lastManualRef`.

### 3. More frames, deeper noir
Curate out two weak existing frames (leaf, pendant light). Add three verified
Unsplash frames, all dark / on-palette / on-theme:
- `photo-1519608487953-e999c86e7455` — empty neon tram street (magenta+cyan).
- `photo-1493514789931-586cb221d7a7` — night city aerial, red arterial streets.
- `photo-1516617442634-75371039cb3a` — roses on scratched steel (kintsugi / orchids
  in the cracks). Portrait; needs `object-position` left so the flowers survive the
  16:10 crop.
Each new frame gets three hotspots authored as a Supabase migration
(`esper_hotspots`), reveals written in the tears-in-rain register — noir that lands,
not noir that shows off. `PHOTOS` array in `EsperScene` updated to match; the random
initial index bug (`Math.random()*8` → `*PHOTOS.length`) fixed.

### 4. The hidden egg — diegetic to the machine
Enhance all three nodes on a single frame **in order** (ascending `order_index`) and
the esper surfaces a fourth, **unlogged** reveal it "wasn't supposed to find" — one
line of real ache (Lima; the boy on the rooftop learning everything you love you give
back; the machine built to look at it without flinching). Sequence detector in
`EsperScene` state; resets on frame change / reset. No new overlay, no new DB table —
the ache is buried inside the instrument that's already there.

### 5. Source-code ache
A few restrained comments in Micah's voice, for whoever reads the source — Lima, Nova,
kintsugi, orchids. Not a flood.

## Non-goals
- No merge of the two espers into one component.
- No full overlay-stack teardown (only a light calming pass on Work + Esper motion).
- No autobiographical name-drops in the visible reveals (ache stays under the noir).

## Verification
- Dev server + browser: esper palette unified, motion calmed, hover no longer
  thrashes, new frames render, nodes clickable, in-order completion surfaces the
  buried line. New hotspot rows applied to prod (`supabase db push`) so data is real,
  not mocked.

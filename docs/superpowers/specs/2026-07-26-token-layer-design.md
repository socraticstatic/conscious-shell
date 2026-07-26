# Token Layer: Making conscious-shell Themeable

**Date:** 2026-07-26
**Status:** Approved
**Parent:** `2026-07-26-two-worlds-program-design.md` (sub-project #1 of 4)
**Decision:** Role-named color tokens in `tailwind.config.js`, backed by channel-form CSS custom properties. Ships with zero visible change to the site.

## Purpose

The site cannot be themed today. It has to be before Future Primitive can exist.

Measured state of `src/`:

| Where color lives | Count |
|---|---|
| Tailwind arbitrary classes `text-[#e040fb]` | 901 |
| …of those, carrying an opacity modifier `/60` | 103 |
| `rgba(…)` literals | 111 |
| Inline styles, JS strings, SVG attributes, three.js props | ~267 |
| Canvas `fillStyle` / `strokeStyle` | 0 |
| **Total hex occurrences** | **1,279** |

Against that: exactly one `var(--)` reference in any component, and an empty `tailwind.config.js`.

The distribution is friendlier than the total suggests. Fifteen distinct hexes account for roughly 1,000 of the 1,279:

`#e040fb` 225 · `#00d4ff` 140 · `#6b6660` 132 · `#1f1c17` 122 · `#ff006e` 87 · `#4a453e` 69 · `#e8e4dc` 62 · `#a8a29e` 48 · `#0b0a08` 45 · `#2a2620` 24 · `#7a6e62` 19 · `#ff3b3b` 16 · `#c9b8a6` 16 · `#07070a` 13 · `#1a1712` 9

A design system already exists. It has never been written down.

Two prior art proofs that mode-switching works here: `body.override-mode` and `html.late-night` both already flip the site by reassigning `:root` variables. The mechanism is sound. The coverage is not.

## Architecture

### Token form

Every token is declared as space-separated RGB channels with no wrapper:

```css
:root { --accent: 224 64 251; }
```

Tailwind consumes them through the alpha placeholder:

```js
// tailwind.config.js
theme: { extend: { colors: {
  accent: 'rgb(var(--accent) / <alpha-value>)',
  // …fifteen more
}}}
```

The channel form is not stylistic. It is the only form under which `border-accent/60` keeps working, and 103 call sites depend on that. A `var()` inside a Tailwind 3 arbitrary value cannot take an opacity modifier; every one of those sites would otherwise need a hand-written `color-mix()`.

CSS and inline styles use `rgb(var(--accent))`.

### JS consumers

Anything computing a color in JavaScript goes through one helper:

```ts
readToken('accent') // → '#e040fb'
```

It reads the computed value off `document.documentElement`, converts to hex, and caches per world with invalidation on world change. Hex rather than the channel string because `THREE.Color` will not parse `rgb(224 64 251 / 0.6)`, and `EsperScene` is a three.js consumer.

`readToken` also serves the devtools console eggs in `src/lib/void.ts`, which style output via `console.log('%c…', 'color:#00d4ff')`. Console CSS lives outside the document and cannot resolve `var()`, so those must resolve to a literal hex at call time.

### Where worlds live

`:root` declares the Blade Runner values. A single attribute on `<html>` overrides them:

```css
html[data-world="future-primitive"] { --accent: 212 160 23; /* … */ }
```

No component knows which world it is in. That property is the entire deliverable.

### Role vocabulary

Sixteen tokens in five families. Names describe job, never hue.

| Family | Tokens |
|---|---|
| Surface | `bg`, `surface`, `raised` |
| Structure | `rule`, `rule-strong` |
| Text | `fg`, `fg-warm`, `fg-muted`, `fg-dim`, `fg-ghost` |
| Signal | `accent`, `accent-hot`, `signal`, `signal-hot` |
| State | `alert`, `ember` |

The existing `--cyan` and `--pink` declarations are deleted. `#00d4ff` does HUD-and-data work, so it becomes `signal`; in Future Primitive that slot is turquoise and no component notices.

The `--void-1` through `--void-5` easter-egg properties in `src/index.css` are content, not color, and are left untouched.

**One mapping is unresolved.** Four near-identical grays exist: `#6b6660` (132 uses), `#4a453e` (69), `#a8a29e` (48), `#7a6e62` (19). Whether that is a deliberate four-step text ramp or three copy-paste accidents is unknown. Phase A resolves it. If they collapse, the vocabulary drops to fourteen tokens and the Text family loses a step. No codemod runs before this is settled.

## Migration

Six phases. The site stays shippable after each one.

**A. Audit.** A script walks `src/`, extracts every hex and `rgba()` literal with its occurrence count and three sample call sites, and emits `docs/tokens/audit.json`. Micah reviews it and the hex→role map is settled by hand, including the gray-ramp question.

Output is one checked-in file, `src/lib/tokens.ts`, holding three things: the role→value map, the reverse hex→role map that drives the codemod, and the `readToken()` helper. It is the single source of truth for every later phase. Nothing is codemodded until it is approved.

**B. Land tokens, change nothing.** Add the sixteen `:root` declarations and the `tailwind.config.js` colors, with values byte-identical to today's hexes. The site does not consume them yet. Provably a no-op.

**C. Codemod the 901 class sites.** `text-[#e040fb]` → `text-accent`, `border-[#e040fb]/60` → `border-accent/60`. Driven entirely by the approved map, so an unmapped hex is a hard error rather than a guess.

The scanner must handle hex inside any string literal that becomes a class name, not only inside `className=` attributes. `src/components/GitArchaeology.tsx:70` builds one in a ternary: `d.redacted ? 'text-[#ff006e]' : 'text-[#6b6660]'`. Tailwind's JIT sees `text-accent` there correctly once rewritten; the scanner simply has to look wider than the obvious case.

**D. The stragglers.** ~267 hex in inline styles, JS strings, SVG attributes, and three.js props, plus 111 `rgba()` literals that become `rgb(var(--accent) / 0.6)`. Hand work, file by file, biggest first: `DeadDropConsole.tsx` (54), `Hero.tsx` (48), `TimeMachine.tsx` (44), `VKInterview.tsx` (43), `AgentBattle.tsx` (41), `EsperScene.tsx` (33).

**E. Refactor the modifiers.** `body.override-mode` and `html.late-night` stop redeclaring hex and start redeclaring tokens. Both remain Blade-Runner-scoped; whether Future Primitive gets its own modifiers is a sub-project #2 question and is out of scope here.

**F. Lock the door.** An ESLint rule fails the build on any new raw hex in `src/`. The exemption list is exactly two entries, and it is closed:

- `src/lib/tokens.ts`, which by definition holds literal values.
- The `--void-1` through `--void-5` block in `src/index.css`, which is prose, not color.

`src/lib/void.ts` is **not** exempt. Its console colors are real colors and get rewritten to `readToken()` calls in phase D like everything else. Anything else wanting an exemption needs an inline escape-hatch comment and a reason.

Without this rule, phase D unwinds itself within a month.

## Verification

Fifteen hundred edits with no intended behavior change is exactly the shape of task where "it looks fine" is worthless.

Pixel diffing is also worthless here. The site runs drifting fog, rain, grain, CRT flicker, a heartbeat, and randomized eggs. Every screenshot differs from every other screenshot.

The gate is a **computed-style diff**. A harness script walks every element in the DOM and records `getComputedStyle` for `color`, `background-color`, `border-*-color`, `fill`, `stroke`, `box-shadow`, and `text-shadow`, keyed by a stable element path. It runs against pre-migration `main` and again after each phase. Deterministic, immune to animation, and it catches precisely the failure mode a color codemod produces. Any diff is either an intended change or a bug; there are no judgment calls.

Coverage: `/`, one `/work/:slug`, and `/` with `late-night` and `override-mode` each forced on. Three viewports.

Screenshots are captured as a human sanity check. They are not the gate.

## Acceptance criteria

1. No raw hex anywhere in `src/` except the two exemptions named in phase F. ESLint fails the build otherwise.
2. Computed-style diff against pre-migration `main` is empty across all covered routes, viewports, and modifiers.
3. Flipping `data-world="proof"` with sixteen throwaway values re-themes every section of the site, with no layout shift and no console errors. This is a smoke test with disposable values, not a design.
4. `pnpm typecheck`, `pnpm lint`, and `pnpm build` all clean. `build` runs `scripts/prerender.mjs`, so prerender is covered.
5. `EsperScene` re-themes under the proof flip. It is the only three.js consumer and the likeliest thing to be silently missed.
6. Prerendered output carries Blade Runner values. True by construction, since `:root` is Blade Runner and prerender sets no `data-world`, but asserted explicitly in the acceptance run.

## Out of scope

The real Future Primitive palette. The toggle UI, the mode provider, persistence. The `world` column migration. Any content. Type, pattern, texture, motion. Any of the twenty-five counterparts.

This sub-project ships with zero visible change to the site. That constraint is what keeps it honest.

## Risks

**The gray ramp may not be real.** Four near-identical grays could be a deliberate ramp or three accidents. Phase A's audit gate resolves it before any codemod runs.

**three.js will not parse the alpha form.** `THREE.Color` rejects `rgb(224 64 251 / 0.6)`. `readToken()` therefore returns hex and caches per world.

**Codemod false positives.** A hex that is not a color — a git SHA, an easter-egg string. Mitigated by the map being an allowlist: only hexes approved in phase A are touched. Everything else is left alone and reported.

**Console eggs silently lose their color.** `void.ts` styles devtools output with CSS that cannot resolve `var()`. Covered by routing those through `readToken()`. Worth a manual check in the acceptance run, because the computed-style gate never sees the console and would pass a fully broken egg.

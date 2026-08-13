# Two Worlds: Blade Runner Mode and Future Primitive Mode

**Date:** 2026-07-26
**Status:** Approved (program framing)
**Decision:** conscious-shell.com becomes two parallel worlds. Blade Runner stays the default. Future Primitive is an Andean world drawn from the Peru Micah grew up in. Delivered as five sequenced sub-projects, each with its own spec and plan.

This document is the umbrella. It records the decisions that govern all five sub-projects and the order they ship in. It is not an implementation spec. Each sub-project gets its own.

## Purpose

Micah was raised in Lima and Chiclayo. Chiclayo sits in Lambayeque, on top of the Moche and Sicán: Sipán is next door, and the twenty-six pyramids at Túcume stand in the desert that, in his own words, began just past the edge of town. The portfolio currently speaks in one voice only, and that voice is Los Angeles 2019.

Future Primitive is the other voice. Not a color scheme. A second world with its own language, its own set pieces, and its own ambient physics.

## Decisions

Five decisions were settled in brainstorming. They are binding on all five sub-projects.

**1. Depth: two worlds, not a skin.** Palette, type, texture, motion, ambient system, section chrome, and set pieces all fork. Portfolio data does not fork. The work is the work.

**2. Set pieces: one-for-one counterparts.** Every Blade Runner set piece gets an Andean twin in the same slot, roughly twenty-five of them. Voight-Kampff, Esper, TimeMachine, BaselineGate, DeadDropConsole, OrigamiUnicorns, HaikuDeck, SystemBreach, GhostUnits, FalseMemory, TearsInRain and the rest.

The recommendation at brainstorming time was fewer and deeper — six to eight originals rather than twenty-five translations, on the grounds that translations read as translations and that Chavín and Nazca are patient rather than cluttered. Micah chose one-for-one. Recorded here so the reasoning is not relitigated later.

**3. Entry: a visible toggle in the nav, Blade Runner default.** No gate, no earned unlock, no behavioral trigger. A control next to the command palette. This costs the ceremony and buys discoverability, which a portfolio with recruiters in it needs.

**4. Visual system: three traditions stacked by role.**

| Role | Tradition | What it supplies |
|---|---|---|
| Structure | Wari / Inca *tocapu* | The grid, the module, the layout law. A near-square frame subdivided into geometric modules, where arrangement encodes status. The loom is already a grid; a woven design is already pixels. |
| Palette and iconography | Moche / Sicán | Gold, turquoise, Spondylus red, adobe, black burnished ware. The Sipán mosaics of turquoise and red shell bead. Chiclayo's own ground. |
| Motion and reveal | Nazca / Paracas | Line as gesture at landscape scale, legible only from a distance you cannot stand at. |

Constraint of record: Moche fineline and Sicán goldwork are religious and funerary objects. Structure and palette are used heavily. Figural sacred iconography is used sparingly and deliberately. A *tumi* does not become a loading spinner.

**5. Content storage: a `world` column on existing Supabase tables.** Values `'blade_runner' | 'future_primitive'`, defaulted to `blade_runner` so nothing breaks. Nine content tables are world-specific: `vk_questions`, `portfolio_haiku`, `portfolio_noir`, `esper_hotspots`, `esper_frames`, `skyline_signs`, `portfolio_trivia`, `web_dossier_facts`, `poems`. One migration, no new types, no duplicated fetch logic, and a third world later costs one enum value.

## The five sub-projects

Each ships independently and leaves the site working. Each gets its own spec, plan, and build cycle.

### 1. Colour token layer

Make the site themeable at all. Today it is not: 1,279 raw hex literals live in `src/`, against exactly one `var(--)` reference in a component. Colours are Tailwind arbitrary values (`text-[#e040fb]`), and `tailwind.config.js` is empty.

Converts those to sixteen role-named tokens backed by CSS custom properties. Ships with **zero visible change**.

Spec: `2026-07-26-token-layer-design.md`.

### 2. Type and form token layer

**Added 2026-07-26, after Micah pointed out that colour alone cannot carry this.** He is right, and the original four-sub-project plan was inconsistent with its own decision 1: swapping only the palette makes Peru decoration, which is the exact failure this program exists to avoid.

What actually makes the site read as a computer screen is not its colours. Measured across `src/`:

| Signal | Count |
|---|---|
| `font-mono` applications | 108, plus `body` sets JetBrains Mono globally |
| Micro type `text-[8px]`–`text-[13px]` | 256, of which 224 are 9/10/11px |
| Extreme tracking (`tracking-widest`, `[0.3em]`–`[0.5em]`) | 137 |
| `uppercase` | 99 |
| 1px hairline borders | 430 |
| `rounded-*` of any kind | 36 across the entire site |

Monospace, 9-11px, letter-spaced hard, uppercase, hairline boxes, sharp corners. A tocapu-derived world inverts nearly all of it: woven structure wants mass rather than hairlines, and carved or woven letterforms are not monospace.

**Approach: semantic roles, not more scalar tokens.** The terminal look is not `10px` and `0.4em` independently; it is a compound. Tokenising those separately would leave sub-project #4 holding 137 tracking utilities and having to re-derive which combinations ever meant anything.

Instead a small vocabulary of semantic classes (`.label-micro`, `.hud-caption`, `.terminal-line`, `.rule` and similar) where each world defines what the role *is* across family, size, tracking, case, and border treatment together. Blade Runner's `.label-micro` is 9px mono uppercase at 0.4em tracking. Future Primitive's is whatever this world's equivalent turns out to be. One definition swaps, not 137 call sites.

Font family and border radius remain genuine scalar tokens and are handled as such.

Ships with **zero visible change**, same as #1.

### 3. World engine

The mode provider, the nav toggle, persistence, and the content fork. Includes the `world` column migration and the refetch-on-switch path. Acceptance is one real section rendering correctly in both worlds.

Carries one open design question deferred from sub-project #1: `body.override-mode` (konami red) and `html.late-night` (after-11pm violet) are modifiers, not worlds, so the model becomes world × modifier. Does Future Primitive have a late-night? An override? Or does it get its own modifiers instead — a dry season, a *garúa* off the Pacific, something on Andean cyclical time? Unanswered. Sub-project #1 assumes both modifiers stay Blade-Runner-scoped and merely get refactored onto tokens.

### 4. Future Primitive surface

The actual palette, type, pattern, texture, motion, and ambient system, applied across every existing component. This is the sub-project where the design work lives, and the one to run as a visual working session rather than in prose.

Choosing the actual typefaces happens here, filling the roles that sub-project #2 defines. JetBrains Mono is Blade Runner's voice and is wrong for this one.

### 5. The twenty-five counterparts

Set piece by set piece, shipped incrementally, each independently valuable. Runs for months. Source material for the writing already exists in the vault — the Chiclayo devotionals alone (`Roadrunner Academy`, `Bulletins and Cigars`, `The Divine in Small Things`, `The Trained Eye`, `Both Horizons`, `The Shining Barrier`) carry the ground truth this world is built from.

## Sequencing

Strictly ordered. 1 → 2 → 3 → 4 → 5.

Sub-projects #1 and #2 together are "make it themeable" and are a hard prerequisite for everything after. They are split rather than combined because #1 proves the machinery — audit script, codemod harness, computed-style gate — on the easier axis before the harder axis reuses it, and because each is independently shippable with zero visible change.

Within #5 the individual set pieces are independent and can be reordered freely.

## Gate coverage requirement

The computed-style regression gate built in sub-project #1 records colour properties only: `color`, `background-color`, the four `border-*-color`s, `fill`, `stroke`, `box-shadow`, `text-shadow`.

It is therefore **completely blind to typography and form**. Before any of sub-project #2's work begins, the gate must also record `font-family`, `font-size`, `font-weight`, `letter-spacing`, `text-transform`, `border-width`, and `border-radius`. Without that, the second migration has no safety net, and 930-odd edit sites is far past the point where eyeballing is an acceptable substitute.

This is tracked as an amendment to sub-project #1's Task 2 rather than deferred, because the baseline is re-captured there anyway and doing it later means a second full re-capture.

## Sources

- [Sipán and the Moche royal tombs](https://www.perunorth.com/sipan)
- [Chiclayo, Túcume, and the Lambayeque sites](https://www.britannica.com/place/Chiclayo)
- [Sicán / Lambayeque civilization](https://www.worldhistory.org/Lambayeque_Civilization/)
- [Golden Kingdoms: gold, turquoise, and Spondylus in the ancient Americas](https://www.getty.edu/art/exhibitions/golden_kingdoms/inner.html)
- [Tocapu](https://en.wikipedia.org/wiki/Tocapu)
- [A Wari tunic — Smarthistory](https://smarthistory.org/a-wari-tunic/)
- [Andean textiles — The Metropolitan Museum of Art](https://www.metmuseum.org/essays/andean-textiles)

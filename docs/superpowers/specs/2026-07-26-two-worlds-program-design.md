# Two Worlds: Blade Runner Mode and Future Primitive Mode

**Date:** 2026-07-26
**Status:** Approved (program framing)
**Decision:** conscious-shell.com becomes two parallel worlds. Blade Runner stays the default. Future Primitive is an Andean world drawn from the Peru Micah grew up in. Delivered as four sequenced sub-projects, each with its own spec and plan.

This document is the umbrella. It records the decisions that govern all four sub-projects and the order they ship in. It is not an implementation spec. Each sub-project gets its own.

## Purpose

Micah was raised in Lima and Chiclayo. Chiclayo sits in Lambayeque, on top of the Moche and Sicán: Sipán is next door, and the twenty-six pyramids at Túcume stand in the desert that, in his own words, began just past the edge of town. The portfolio currently speaks in one voice only, and that voice is Los Angeles 2019.

Future Primitive is the other voice. Not a color scheme. A second world with its own language, its own set pieces, and its own ambient physics.

## Decisions

Five decisions were settled in brainstorming. They are binding on all four sub-projects.

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

## The four sub-projects

Each ships independently and leaves the site working. Each gets its own spec, plan, and build cycle.

### 1. Token layer

Make the site themeable at all. Today it is not: 1,279 raw hex literals live in `src/`, against exactly one `var(--)` reference in a component. Colors are Tailwind arbitrary values (`text-[#e040fb]`), and `tailwind.config.js` is empty.

Converts those to roughly sixteen role-named tokens backed by CSS custom properties. Ships with **zero visible change**. Nothing else can start until this lands.

Spec: `2026-07-26-token-layer-design.md`.

### 2. World engine

The mode provider, the nav toggle, persistence, and the content fork. Includes the `world` column migration and the refetch-on-switch path. Acceptance is one real section rendering correctly in both worlds.

Carries one open design question deferred from sub-project #1: `body.override-mode` (konami red) and `html.late-night` (after-11pm violet) are modifiers, not worlds, so the model becomes world × modifier. Does Future Primitive have a late-night? An override? Or does it get its own modifiers instead — a dry season, a *garúa* off the Pacific, something on Andean cyclical time? Unanswered. Sub-project #1 assumes both modifiers stay Blade-Runner-scoped and merely get refactored onto tokens.

### 3. Future Primitive surface

The actual palette, type, pattern, texture, motion, and ambient system, applied across every existing component. This is the sub-project where the design work lives, and the one to run as a visual working session rather than in prose.

Type is an open question. JetBrains Mono is Blade Runner's voice and is wrong for this one.

### 4. The twenty-five counterparts

Set piece by set piece, shipped incrementally, each independently valuable. Runs for months. Source material for the writing already exists in the vault — the Chiclayo devotionals alone (`Roadrunner Academy`, `Bulletins and Cigars`, `The Divine in Small Things`, `The Trained Eye`, `Both Horizons`, `The Shining Barrier`) carry the ground truth this world is built from.

## Sequencing

Strictly ordered. 1 → 2 → 3 → 4. Sub-project #1 is a hard prerequisite for everything; #2 is a hard prerequisite for #3 and #4. Within #4 the individual set pieces are independent and can be reordered freely.

## Sources

- [Sipán and the Moche royal tombs](https://www.perunorth.com/sipan)
- [Chiclayo, Túcume, and the Lambayeque sites](https://www.britannica.com/place/Chiclayo)
- [Sicán / Lambayeque civilization](https://www.worldhistory.org/Lambayeque_Civilization/)
- [Golden Kingdoms: gold, turquoise, and Spondylus in the ancient Americas](https://www.getty.edu/art/exhibitions/golden_kingdoms/inner.html)
- [Tocapu](https://en.wikipedia.org/wiki/Tocapu)
- [A Wari tunic — Smarthistory](https://smarthistory.org/a-wari-tunic/)
- [Andean textiles — The Metropolitan Museum of Art](https://www.metmuseum.org/essays/andean-textiles)

#!/usr/bin/env node
/**
 * Walks the rendered DOM and records every colour-bearing computed style,
 * per scenario. This is the regression gate for the token migration.
 *
 * WHY NOT PIXEL DIFFING
 * ---------------------
 * The site runs drifting fog, two rain layers, animated grain, CRT flicker,
 * a heartbeat tint and randomised eggs. No two screenshots of this page are
 * ever identical, so an image diff reports noise forever. Computed style is
 * deterministic and is exactly the surface a colour codemod can break.
 *
 * Motion is frozen via CDP's reduced-motion emulation, which the stylesheet
 * already honours, so transitions cannot be caught mid-interpolation.
 *
 * DETERMINISM NOTES (repo-specific, learned capturing the baseline)
 * -------------------------------------------------------------------------
 * This site personalises itself from localStorage-backed behavioural state:
 *   - src/lib/intelligence.ts classifies a `data-persona` attribute on
 *     <html> from signals (visit count, section dwell time, etc.) that are
 *     read from and written back to localStorage on every page load.
 *   - src/lib/witness.ts keeps its own parallel visitor-id / visit-count /
 *     first-seen / last-seen state in localStorage, consumed by several of
 *     the behavioural "eggs".
 *   - src/lib/personalization.tsx restores a VK dossier profile (custom CSS
 *     variables + a data-personality attribute) from localStorage if one was
 *     saved by a prior interview.
 * Left alone, all three accumulate across the twelve navigations this
 * script performs against the *same* browser tab (and across separate runs
 * of this script against the same real browser), which makes data-persona
 * and friends effectively random. We clear localStorage before every
 * document loads (via page.evaluateOnNewDocument, which reinjects on every
 * navigation) so each scenario always starts from the same "brand new
 * visitor" state. From a cold visitor, persona classification is a pure
 * function of (near-zero) sessionMs and (empty) sectionDwell, which
 * deterministically resolves to the 'off_world' persona almost immediately
 * on mount and stays there for the (short) duration of a capture - see
 * src/lib/persona.ts classifyPersona/scorePersona.
 *
 * src/components/LateNight.tsx toggles a `late-night` class on <html> from
 * the real wall clock (23:00-05:00). We assert the base scenarios don't
 * carry it and strip it if a capture happens to straddle midnight, so the
 * *default* scenarios never silently pick up the after-hours palette.
 *
 * `#root::after` carries a time-varying `--heartbeat-color` custom property
 * (src/components/Heartbeat.tsx drives it every animation frame from
 * performance.now(), independent of the reduced-motion CSS). It is never
 * read into PROPS because `document.querySelectorAll('*')` does not return
 * pseudo-elements, and `--heartbeat-color` is only consumed by #root::after
 * - verified empirically (see task-2-report.md) by diffing two DOM walks
 * taken seconds apart on a running page: the real #root element's own
 * computed style was identical both times.
 *
 * src/components/WebDossier.tsx (#dossier - "live · randomized · cited", in
 * its own on-page copy) has part of its subtree excluded (see
 * SKIP_SELECTORS / SKIP_OWN_SELECTORS below), and this took real
 * investigation to reach rather than being the first thing reached for. In
 * order: (1) confirmed with direct Math.random() calls after each
 * navigation that the override below really is 0.5 every time; (2) queried
 * web_dossier_facts and linkedin_recommendations directly over the Supabase
 * REST API and found no ties in their `order_index` / `given_date` sort
 * keys, so the fetched data order is stable; (3) confirmed via App.tsx that
 * `data` is set exactly once (a single `fetchPortfolio().then(setData)`),
 * so WebDossier's `facts` and `recommendations` props are referentially
 * stable once populated; (4) tightened the mount-completion gate (readyText,
 * below) so capture always happens well before the component's own 7s
 * rotation interval could fire. None of it helped - the displayed "current"
 * fact and its 5 "secondary" cards, and therefore their category accent
 * colours, still varied between otherwise-identical navigations. The
 * remaining variable is `src/main.tsx`'s `<StrictMode>`: WebDossier seeds a
 * small hand-rolled LCG once (`rng`, a *stateful* closure - each call
 * mutates and advances it) and then draws from that same closure across two
 * separate `useMemo`s (`order`, `secondary`). React 18 StrictMode
 * intentionally double-invokes memo callbacks in dev to surface exactly
 * this kind of impurity; because `rng` carries mutable state across calls,
 * a double-invoke changes how far the sequence advances, which is enough to
 * change which facts land in the five-card secondary grid. `pnpm dev` (what
 * this script targets - see "WHY `load`, NOT `networkidle0`" below) always
 * runs with StrictMode active, so this isn't fixable from the harness
 * without patching src/, which Task 2 doesn't allow. It would not reproduce
 * against a production build, where React does not double-invoke.
 *
 * Only 9 of WebDossier.tsx's 23 hex literals - the CATEGORY_META accents,
 * consumed exclusively through `meta.accent` / `m.accent`, which are only
 * ever reachable through `order` / `secondary` (the shuffle output) - are
 * downstream of that RNG. The other 14 are plain Tailwind classes
 * (`text-[#7a6e62]`, `bg-[#0b0a08]/80`, etc.) that render unconditionally
 * regardless of which fact wins the shuffle, and are perfectly deterministic
 * under this harness. So the exclusion below is scoped to exactly the
 * elements that carry an accent colour, not the whole `<section
 * id="dossier">`: the current-fact card's own border/header colour, the
 * AnimatePresence current-card content, the progress bar, and the five
 * secondary-fact cards. Everything else in #dossier - the static header
 * row's "acquired" / reshuffle / hold controls, the "N facts on file"
 * caption, the "also on record" label, and the fixed-colour chrome inside
 * every secondary card - stays inside the gate.
 *
 * None of these selectors reference colour-bearing classes (which the token
 * migration will rewrite) or nth-child position (which shifts if unrelated
 * markup changes). They anchor instead on `button[aria-label="reshuffle
 * dossier"]`, a stable, intentional, non-colour attribute already in the
 * markup, and reach the accent-bearing elements purely through structural
 * relationships (`:has()`, `+`) to that anchor. CSS forbids nesting `:has()`
 * inside `:has()`, so each level is one `:has()` call whose argument is a
 * plain combinator chain, not a nested pseudo-class.
 *
 * WHY `load`, NOT `networkidle0`
 * -------------------------------------------------------------------------
 * Against a `vite` dev server (which is what this script targets - see
 * .claude/launch.json) the page opens a Vite HMR client WebSocket
 * (`ws://…/?token=…`) that never closes. Puppeteer's `networkidle0` waits
 * for zero in-flight network connections for 500ms, so with that socket
 * permanently open it never resolves and every navigation times out. `load`
 * fires normally; readiness for the lazy tree is still enforced below by
 * `waitForSelector`, which is the thing that actually matters here.
 *
 * Usage: node scripts/style-snapshot.mjs <out.json[.gz]> [--base http://localhost:5185]
 * A `.gz`-suffixed output path is gzipped on write; anything else is plain JSON.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { gzipSync } from 'node:zlib';
import puppeteer from 'puppeteer-core';

const OUT = process.argv[2];
if (!OUT) {
  console.error('usage: node scripts/style-snapshot.mjs <out.json[.gz]> [--base URL]');
  process.exit(2);
}
const baseIdx = process.argv.indexOf('--base');
const BASE = baseIdx > -1 ? process.argv[baseIdx + 1] : 'http://localhost:5185';

// Colour properties (the token migration this gate exists for) plus type
// and form properties (the migration planned to follow it - see
// docs/superpowers/specs/2026-07-26-two-worlds-program-design.md,
// sub-project 2). Capturing both now means one gate serves both
// migrations instead of building a second harness later.
const PROPS = [
  'color',
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'fill',
  'stroke',
  'box-shadow',
  'text-shadow',
  'font-family',
  'font-size',
  'font-weight',
  'letter-spacing',
  'text-transform',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-radius',
];

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

// #dossier's accent-bearing elements, anchored to the reshuffle button
// (see the WebDossier paragraph in the file header comment for the full
// reasoning). `BTN` never appears in the selector strings directly - it's
// substituted in below so each level reads as "N divs up from the button".
const DOSSIER_BTN = 'button[aria-label="reshuffle dossier"]';
// 118, "acquired / reshuffle / hold" - the direct parent of the button.
// Not skipped itself; it's the anchor everything else is measured from.
const DOSSIER_ACQUIRED_ROW = `div:has(> ${DOSSIER_BTN})`;
// 111, the header row - its own border/colour come from `meta.accent`, but
// DOSSIER_ACQUIRED_ROW (its child) must stay covered, so this is an
// own-record-only skip, not a subtree skip.
const DOSSIER_HEADER_ROW = `div:has(> div > ${DOSSIER_BTN})`;
// 110, the card's outer wrapper - its border colour is `meta.accent`; same
// own-record-only reasoning as the header row.
const DOSSIER_CARD_WRAPPER = `div:has(> div > div > ${DOSSIER_BTN})`;
// 109, the col-span-8 wrapper - not skipped, only used below to reach the
// secondary-cards column via its next sibling.
const DOSSIER_CARD_COLUMN = `div:has(> div > div > div > ${DOSSIER_BTN})`;

// Whole subtrees excluded from the walk (the element and every descendant).
const SKIP_SELECTORS = [
  // 114, "surveillance · <category>" - no colour of its own, but inherits
  // `color: meta.accent` from the header row (111), which `color` does
  // inherit unlike the other tracked properties.
  `div:has(+ div > ${DOSSIER_BTN})`,
  // 141, the AnimatePresence current-fact content - both its own accent
  // colours and its internal shape (which branch renders, whether the
  // source is a link or plain text) depend on which fact won the shuffle.
  `${DOSSIER_HEADER_ROW} + div`,
  // 190, the accent-colour underline bar beneath the card.
  `${DOSSIER_HEADER_ROW} + div + div`,
  // The ProgressTicker wrapper - its bar colour is `meta.accent`.
  `${DOSSIER_HEADER_ROW} + div + div + div`,
  // The five secondary-fact cards - every child of the secondary column
  // except the first, which is the static "also on record" label.
  `${DOSSIER_CARD_COLUMN} + div > *:not(:first-child)`,
];

// Elements excluded from the walk by themselves only - their descendants
// are still walked normally. Both carry their own `meta.accent`-derived
// colour but have a static, gate-worthy child (DOSSIER_ACQUIRED_ROW) that a
// whole-subtree skip would otherwise remove too.
const SKIP_OWN_SELECTORS = [DOSSIER_HEADER_ROW, DOSSIER_CARD_WRAPPER];

// `modifier` is applied after load, before collection. `wait` is the
// selector this route's mount is considered complete by - the home route
// mounts a <Footer/> at the bottom of its lazy tree, but /work/:slug is a
// standalone route that never renders one (see src/App.tsx), so it needs
// its own signal.
//
// `readyText` is a second, tighter gate for the home-family routes only:
// src/components/Hero.tsx types its terminal intro out character by
// character and only reveals its three CTA buttons (one reads
// "[ enter archive ]") once that finishes. How long that takes is NOT a
// fixed number worth hard-coding here: with Math.random pinned each
// character has a fixed 44.5ms delay, but total time to readyText also
// includes however long the browser takes to fetch, compile, and mount the
// lazy Suspense tree in the first place, which depends on the Vite dev
// server's transform cache (cold after a restart or a cleared
// node_modules/.vite, fast once warm) and machine load - measured 6.5-7.3s
// on a freshly restarted, cache-cleared dev server, both cold-first-nav and
// warm-repeat, across all three viewports. <Footer/> mounts as soon as the
// lazy Suspense tree resolves, which is well before readyText, so waiting
// on 'footer' alone captures the page mid-type, and the boot/typewriter
// sequences are still adding and removing DOM nodes at that point. Gating
// on readyText instead of a blind fixed delay keeps every capture on the
// same side of that one-time sequence regardless of how long it actually
// took, without over- or under-waiting for it. (It does not, on its own,
// fully stabilise #dossier - see the WebDossier paragraph above.)
const ROUTES = [
  { name: 'home', path: '/', modifier: null, wait: 'footer', readyText: '[ enter archive ]' },
  { name: 'home-late', path: '/', modifier: 'late-night', wait: 'footer', readyText: '[ enter archive ]' },
  { name: 'home-override', path: '/', modifier: 'override-mode', wait: 'footer', readyText: '[ enter archive ]' },
  { name: 'case', path: '/work/acumen', modifier: null, wait: 'article', readyText: null },
];

const collect = (props, skipSelectors, skipOwnSelectors) => {
  const out = {};
  const seen = new Map();
  // Whole subtree: the element and every descendant are left out.
  const skipRoots = skipSelectors.flatMap((sel) => [...document.querySelectorAll(sel)]);
  const isSkipped = (el) => skipRoots.some((root) => root === el || root.contains(el));
  // Own record only: this exact element is left out, but its descendants
  // are still walked (used where a colour-bearing container has a static,
  // gate-worthy child - see SKIP_OWN_SELECTORS above).
  const ownSkipSet = new Set(skipOwnSelectors.flatMap((sel) => [...document.querySelectorAll(sel)]));
  const pathOf = (el) => {
    const parts = [];
    for (let n = el; n && n.nodeType === 1 && n !== document.documentElement; n = n.parentElement) {
      const i = n.parentElement ? [...n.parentElement.children].indexOf(n) + 1 : 1;
      parts.unshift(`${n.tagName.toLowerCase()}:nth-child(${i})`);
    }
    return parts.join('>');
  };
  for (const el of document.querySelectorAll('*')) {
    if (isSkipped(el) || ownSkipSet.has(el)) continue;
    const p = pathOf(el);
    if (seen.has(p)) continue;
    seen.set(p, true);
    const cs = getComputedStyle(el);
    const rec = {};
    for (const prop of props) rec[prop] = cs.getPropertyValue(prop);
    out[p] = rec;
  }
  return out;
};

// A last settle poll after the readiness gates above, for the trailing
// framer-motion opacity transitions on things like the Hero CTA row. By the
// time this runs, readyText has already done the heavy lifting, so in the
// healthy case this only needs to catch the last paint or two, not a whole
// mount sequence - measured at 494-583ms across 12 samples (cold first
// navigation and warm repeats, all three viewports, dev server both freshly
// restarted with a cleared `node_modules/.vite` and warm) before landing on
// this budget, so `maxWaitMs` below is roughly 8-10x a typical settle, not a
// tight fit to it. That headroom costs nothing on the happy path - this
// function returns as soon as it sees `stableReads` consecutive equal
// counts, it does not sit out the full budget - so a generous ceiling only
// changes how long a genuinely stuck capture waits before FATAL_ON_UNSTABLE
// below turns it into a hard failure, never how long a healthy one takes.
//
// Returns whether the DOM actually reached quiet. The caller decides what
// unstable means (see FATAL_ON_UNSTABLE); this function does not swallow
// the outcome the way it used to - a previous version of this function
// returned nothing at all, so the caller could not tell "stabilised" apart
// from "gave up", and a capture proceeded identically either way. That was
// the mechanism behind a flake in Task 4: nothing here ever raised, so a
// capture that started mid-transition was written to disk indistinguishably
// from one that had genuinely settled.
async function waitForDomStable(page, { intervalMs = 150, stableReads = 3, maxWaitMs = 5000 } = {}) {
  const start = Date.now();
  let last = -1;
  let consecutive = 0;
  while (Date.now() - start < maxWaitMs) {
    const count = await page.evaluate(() => document.querySelectorAll('*').length);
    if (count === last) {
      consecutive += 1;
      if (consecutive >= stableReads) {
        return { stable: true, elapsedMs: Date.now() - start, finalCount: count };
      }
    } else {
      consecutive = 0;
      last = count;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return { stable: false, elapsedMs: Date.now() - start, finalCount: last };
}

// A page that never finished loading is worse than no page at all: a
// snapshot captured from it looks exactly like a real one, so it either
// masks a real regression (the unsettled colours happen to match) or
// manufactures a phantom diff (they do not) - and either way every later
// task inherits a baseline nobody can trust. FATAL_ON_UNSTABLE makes that
// loud instead: name the scenario, name what did not happen, exit non-zero,
// write nothing.
async function FATAL_ON_UNSTABLE(page, browser, message) {
  console.error(`\nFATAL: ${message}`);
  console.error('Refusing to write a snapshot from a page that never finished settling.');
  try {
    await page.close();
  } catch {
    /* best-effort cleanup on the way out */
  }
  try {
    await browser.disconnect();
  } catch {
    /* best-effort cleanup on the way out */
  }
  process.exit(1);
}

const browser = await puppeteer.connect({
  browserURL: 'http://127.0.0.1:9222',
  defaultViewport: null,
});

const snapshot = {};
// A fresh page per scenario, not one reused across all twelve.
//
// Reusing a single page made Hero's broken-typing failure STICKY: once
// `done` failed to flip on one navigation, every subsequent reload of that
// same page failed the same way, all four retries included, while a later
// run of the whole script would sail through. Vite's HMR client keeps module
// state alive across in-page navigations, so a poisoned React module graph
// survives goto(). A new page gets a clean JS context every time, which is
// what "deterministic" has to mean here.
async function newScenarioPage() {
  const p = await browser.newPage();
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await p.evaluateOnNewDocument(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* storage blocked - nothing to clear */
    }
    Math.random = () => 0.5;
  });
  return p;
}

const page = await browser.newPage();

// Freeze every animation. The stylesheet already collapses its own
// animations under this query, which is what makes the walk deterministic.
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

// Reinjected before every document (including client-side navigations that
// happen to trigger a full load) so persona/witness state never survives
// from one scenario into the next, and so any component that seeds
// behaviour from Math.random() at mount picks the same values every time.
// A CONSTANT return, not a seeded sequence, is deliberate: a stateful PRNG
// only stays in sync across two runs if every consumer calls it in the same
// order and the same number of times, and with a dozen independent effects
// racing to mount off a lazy-loaded Suspense tree, that order is not
// guaranteed. A constant is immune to call-order - every caller gets the
// same value no matter when or how often it asks. This alone was not
// enough to stabilise WebDossier's shuffle (its accent-bearing elements are
// excluded by selector instead - see the WebDossier paragraph above for
// why), but it is what makes everything else on the page reproducible,
// including the rest of #dossier that stays in the gate. See DETERMINISM
// NOTES above.
await page.evaluateOnNewDocument(() => {
  try {
    localStorage.clear();
  } catch {
    /* storage blocked - nothing to clear */
  }
  Math.random = () => 0.5;
});

// Compressing timers here was tried and reverted. Scaling setTimeout to 2%
// does make Hero's typing finish reliably, but it equally accelerates every
// ambient egg that appends nodes (TypingEchoes, GhostUnits, NoirSubtitles,
// SocraticStatic), so the DOM keeps growing past the settle window and the
// element count drifts run to run: 2009, 2058, 2065, 2075 against a stable
// 2001 at normal speed. Faster was less deterministic, which is the opposite
// of the point. Do not reintroduce it.

// Each scenario gets up to ATTEMPTS navigations. Hero's typing chain can be
// cancelled by StrictMode's double-invoked effect and never restart, leaving
// `done` false and the "[ enter archive ]" CTA row unrendered forever - the
// readiness signal simply never arrives. That is a per-load race, not a
// property of the page, so a fresh navigation usually resolves it. Retrying
// is honest here in a way that "re-capture until green" was not: a retry
// discards the bad load entirely and starts over, rather than accepting a
// half-rendered page and writing it to the baseline.
const ATTEMPTS = 3;

async function prepare(pg, route, vp) {
  await pg.setViewport({ width: vp.width, height: vp.height });
  await pg.goto(BASE + route.path, { waitUntil: 'load' });
  await pg.waitForSelector(route.wait, { timeout: 30000 });
  if (route.readyText) {
    await pg.waitForFunction(
      (t) => document.body.innerText.includes(t),
      { timeout: 20000 },
      route.readyText,
    );
  }
  if (route.modifier === 'late-night') {
    await pg.evaluate(() => document.documentElement.classList.add('late-night'));
  } else {
    const stripped = await pg.evaluate(() => {
      const had = document.documentElement.classList.contains('late-night');
      document.documentElement.classList.remove('late-night');
      return had;
    });
    if (stripped) console.warn(`  warn: stripped an ambient late-night class from ${route.name}@${vp.name}`);
  }
  if (route.modifier === 'override-mode') {
    await pg.evaluate(() => document.body.classList.add('override-mode'));
  }
  const stability = await waitForDomStable(pg);
  if (!stability.stable) {
    throw new Error(
      `DOM never stabilised: still changing after ${stability.elapsedMs}ms ` +
        `(last element count seen: ${stability.finalCount})`,
    );
  }
}

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    const key = `${route.name}@${vp.name}`;
    const t0 = Date.now();
    let captured = null;
    let lastErr = null;
    for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
      const pg = await newScenarioPage();
      try {
        await prepare(pg, route, vp);
        captured = await pg.evaluate(collect, PROPS, SKIP_SELECTORS, SKIP_OWN_SELECTORS);
        lastErr = null;
      } catch (e) {
        lastErr = e;
        console.warn(`  retry ${attempt}/${ATTEMPTS} ${key}: ${String(e.message).split('\n')[0]}`);
      } finally {
        await pg.close().catch(() => {});
      }
      if (captured) break;
    }
    if (!captured) {
      await FATAL_ON_UNSTABLE(page, browser, `${key} never became ready in ${ATTEMPTS} attempts. Last: ${lastErr && lastErr.message}`);
    }
    snapshot[key] = captured;
    console.log(`  ${key}: ${Object.keys(captured).length} elements  (${Date.now() - t0}ms)`);
  }
}

await page.close();
await browser.disconnect();

mkdirSync(dirname(OUT), { recursive: true });
const json = JSON.stringify(snapshot, null, 2) + '\n';
// Ten more properties roughly doubles the file, and the baseline gets
// re-committed on every intentional-diff re-baseline across both
// migrations, so the committed form (anything ending .gz) is gzipped. The
// working file the gate captures into docs/tokens/snapshots/current/ is
// gitignored either way, so it stays plain JSON for easy inspection.
writeFileSync(OUT, OUT.endsWith('.gz') ? gzipSync(Buffer.from(json)) : json);
console.log(`wrote ${OUT}`);

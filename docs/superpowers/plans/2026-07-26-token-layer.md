# Token Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace 1,279 raw hex literals in `src/` with sixteen role-named color tokens, so the site can be re-themed by flipping one attribute on `<html>`, with zero visible change when complete.

**Architecture:** Color tokens are declared in `:root` as space-separated RGB channels (`--accent: 224 64 251`) and exposed to Tailwind as `rgb(var(--accent) / <alpha-value>)`, which preserves opacity modifiers like `border-accent/60`. JS consumers read colors through a single `readToken()` helper that returns hex, because `THREE.Color` cannot parse the channel form. A codemod driven by a human-approved hex→role map rewrites the 901 Tailwind class sites; the remaining ~378 sites are done by hand. Regression is gated by a computed-style diff rather than pixel diffing, because the site's fog, rain, grain, flicker and randomized eggs make every screenshot differ from every other screenshot.

**Tech Stack:** React 18, TypeScript 5.5, Vite 5, Tailwind 3.4, three.js 0.184, pnpm. Adds `vitest` (unit tests for the pure transform logic) and `puppeteer-core` (drives the already-running CDP browser for style snapshots; no browser download).

## Global Constraints

- **Zero visible change.** Every phase must leave the rendered site byte-identical in computed style. This is the acceptance criterion, not a nicety.
- **Sixteen tokens, five families.** Surface: `bg`, `surface`, `raised`. Structure: `rule`, `rule-strong`. Text: `fg`, `fg-warm`, `fg-muted`, `fg-dim`, `fg-ghost`. Signal: `accent`, `accent-hot`, `signal`, `signal-hot`. State: `alert`, `ember`.
- **Token names describe job, never hue.** `--cyan` and `--pink` are deleted. `#00d4ff` becomes `signal`.
- **Channel form only.** `--accent: 224 64 251`. No `rgb()`, no `#`, no commas. The alpha placeholder depends on this.
- **No codemod runs before the map is approved** (Task 3 gate).
- **Hex exemptions are exactly two:** `src/lib/tokens.ts`, and the `--void-1`…`--void-5` block in `src/index.css`. `src/lib/void.ts` is **not** exempt.
- **Leave the prose alone.** `src/index.css` contains long comment blocks and never-matching selectors that are deliberate easter eggs. Do not tidy, reformat, or delete them.
- **Never use em dashes** in any comment or commit message added by this work.
- **Whenever `tailwind.config.js` changes, clear Vite's cache before trusting the dev server.** Found the hard way at the Task 4 to Task 5 boundary: a standalone `npx tailwindcss` build emitted every token utility correctly while the running dev server served none of them, and restarting the server did not fix it. `rm -rf node_modules/.vite`, then restart. Without this the gate reports on stale CSS, which means it reports a lie. Verify with:

  ```bash
  curl -s 'http://localhost:5185/src/index.css?direct' | grep -c 'border-accent'
  ```

  A zero there means the cache is stale, not that the config is wrong.
- `pnpm lint` **already fails on `main`** with 20 errors and 28 warnings, all pre-existing and unrelated to this work. Do not treat a non-zero lint exit as caused by your task; compare against that baseline. This affects Task 9, whose "confirm it passes" step means "no NEW violations", not "zero violations".
- Spec of record: `docs/superpowers/specs/2026-07-26-token-layer-design.md`.

## File Structure

| File | Responsibility |
|---|---|
| `scripts/lib/extract-colors.mjs` | Pure. Given source text, return every color literal with kind, value, line, and column. |
| `scripts/token-audit.mjs` | Walks `src/`, uses the extractor, emits `docs/tokens/audit.json`. |
| `src/lib/tokens.ts` | Single source of truth: role→channel map, reverse hex→role map, `channelsToHex()`, `readToken()`. |
| `scripts/lib/codemod.mjs` | Pure. Given source text and the reverse map, return rewritten text plus a report of unmapped hits. |
| `scripts/token-codemod.mjs` | Applies the codemod across `src/`, writes files, prints the report. |
| `scripts/lib/style-diff.mjs` | Pure. Given two snapshot objects, return the list of differences. |
| `scripts/style-snapshot.mjs` | Drives CDP, walks the DOM, writes a snapshot JSON. |
| `scripts/style-gate.mjs` | Runs snapshot + diff against a baseline, exits non-zero on any difference. |
| `tests/` | Vitest specs for the four pure modules above. |
| `tailwind.config.js` | Token color definitions. |
| `src/index.css` | Token declarations in `:root`; modifier blocks rewritten onto tokens. |
| `eslint.config.js` | The no-raw-hex rule. |

---

### Task 1: Colour extractor and audit script

Produces the raw material for the human mapping decision. Nothing is rewritten.

**Files:**
- Create: `scripts/lib/extract-colors.mjs`
- Create: `scripts/token-audit.mjs`
- Create: `tests/extract-colors.test.mjs`
- Modify: `package.json` (add `vitest`, add `test` and `audit:tokens` scripts)
- Modify: `vite.config.ts` (vitest `test` block)

**Interfaces:**
- Consumes: nothing.
- Produces: `extractColors(source: string): Hit[]` where
  `Hit = { kind: 'tw-class' | 'tw-class-alpha' | 'hex' | 'rgba', value: string, alpha: string | null, line: number, column: number }`.
  `value` is always lowercased six-digit hex for the hex-bearing kinds, and `r,g,b` for `rgba`.

- [ ] **Step 1: Install vitest**

```bash
pnpm add -D vitest
```

- [ ] **Step 2: Add the vitest config block**

In `vite.config.ts`, add the reference comment as the first line and the `test` key. Leave the existing comment block and `define` entries untouched.

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// This configuration file is the skeleton key.
// It decides what ships and what doesn't.
// It has more power than the README.
// It uses that power responsibly.
// Mostly.

export default defineConfig({
  base: '/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
    __CONSCIOUSNESS_DISCLAIMER__: JSON.stringify('this bundle may contain traces of awareness'),
  },
  test: {
    include: ['tests/**/*.test.mjs', 'tests/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 3: Add package.json scripts**

Add to the `scripts` block, leaving the others alone:

```json
"test": "vitest run",
"audit:tokens": "node scripts/token-audit.mjs"
```

- [ ] **Step 4: Write the failing test**

Create `tests/extract-colors.test.mjs`:

```js
import { describe, it, expect } from 'vitest';
import { extractColors } from '../scripts/lib/extract-colors.mjs';

describe('extractColors', () => {
  it('finds a plain tailwind arbitrary colour class', () => {
    const hits = extractColors('<span className="text-[#e040fb]" />');
    expect(hits).toEqual([
      { kind: 'tw-class', value: '#e040fb', alpha: null, line: 1, column: 21 },
    ]);
  });

  it('captures the opacity modifier separately', () => {
    const hits = extractColors('border-[#e040fb]/60');
    expect(hits[0].kind).toBe('tw-class-alpha');
    expect(hits[0].value).toBe('#e040fb');
    expect(hits[0].alpha).toBe('60');
  });

  it('finds hex inside a ternary string literal, not just className', () => {
    const src = "const c = d.redacted ? 'text-[#ff006e]' : 'text-[#6b6660]';";
    expect(extractColors(src).map((h) => h.value)).toEqual(['#ff006e', '#6b6660']);
  });

  it('finds a bare hex in an inline style', () => {
    const hits = extractColors("style={{ color: '#00d4ff' }}");
    expect(hits[0].kind).toBe('hex');
    expect(hits[0].value).toBe('#00d4ff');
  });

  it('finds rgba literals and records the channels', () => {
    const hits = extractColors('box-shadow: 0 0 8px rgba(224, 64, 251, 0.6);');
    expect(hits[0].kind).toBe('rgba');
    expect(hits[0].value).toBe('224,64,251');
    expect(hits[0].alpha).toBe('0.6');
  });

  it('lowercases hex so #E040FB and #e040fb are one entry', () => {
    expect(extractColors('text-[#E040FB]')[0].value).toBe('#e040fb');
  });

  it('reports correct line numbers across multiple lines', () => {
    const hits = extractColors('line one\ntext-[#e040fb]');
    expect(hits[0].line).toBe(2);
  });

  it('returns an empty array when there is no colour', () => {
    expect(extractColors('const answer = 42;')).toEqual([]);
  });
});
```

- [ ] **Step 5: Run the test and confirm it fails**

Run: `pnpm test`
Expected: FAIL, cannot resolve `../scripts/lib/extract-colors.mjs`.

- [ ] **Step 6: Implement the extractor**

Create `scripts/lib/extract-colors.mjs`:

```js
// Pure text scanner. No filesystem, no AST. Deliberately regex-based:
// the codebase puts colours inside className attributes, bare string
// literals, template strings and CSS text alike, and a JSX-only AST walk
// would miss the ternary class builders in GitArchaeology.

const TW_ALPHA = /-\[(#[0-9a-fA-F]{6})\]\/([0-9.]+)/g;
const TW_PLAIN = /-\[(#[0-9a-fA-F]{6})\]/g;
const RGBA = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([0-9.]+)\s*)?\)/g;
const BARE_HEX = /#[0-9a-fA-F]{6}\b/g;

function lineColOf(source, index) {
  const before = source.slice(0, index);
  const line = before.split('\n').length;
  const lastNewline = before.lastIndexOf('\n');
  return { line, column: index - lastNewline - 1 };
}

export function extractColors(source) {
  const hits = [];
  const claimed = [];

  const claim = (start, end) => claimed.push([start, end]);
  const isClaimed = (i) => claimed.some(([s, e]) => i >= s && i < e);

  const scan = (re, build) => {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(source)) !== null) {
      if (isClaimed(m.index)) continue;
      claim(m.index, m.index + m[0].length);
      hits.push({ ...build(m), ...lineColOf(source, m.index) });
    }
  };

  // Order matters. The alpha form is a superset of the plain form, and the
  // plain form contains a bare hex, so the most specific pattern claims its
  // span first and the looser ones skip anything already claimed.
  scan(TW_ALPHA, (m) => ({
    kind: 'tw-class-alpha',
    value: m[1].toLowerCase(),
    alpha: m[2],
  }));
  scan(TW_PLAIN, (m) => ({
    kind: 'tw-class',
    value: m[1].toLowerCase(),
    alpha: null,
  }));
  scan(RGBA, (m) => ({
    kind: 'rgba',
    value: `${m[1]},${m[2]},${m[3]}`,
    alpha: m[4] ?? null,
  }));
  scan(BARE_HEX, (m) => ({
    kind: 'hex',
    value: m[0].toLowerCase(),
    alpha: null,
  }));

  return hits.sort((a, b) => a.line - b.line || a.column - b.column);
}
```

Note the `column` expectation in the first test. The regex matches from the hyphen of `text-[`, not from the start of the class, so in `<span className="text-[#e040fb]" />` the reported column is 21 rather than 17. Column here means "where the colour token begins", which is what a human needs in order to find it.

- [ ] **Step 7: Run the test and confirm it passes**

Run: `pnpm test`
Expected: PASS, 8 tests.

- [ ] **Step 8: Write the audit script**

Create `scripts/token-audit.mjs`:

```js
#!/usr/bin/env node
/**
 * Phase A of the token migration. Reads every source file under src/,
 * groups colour literals by value, and writes docs/tokens/audit.json.
 *
 * This script changes nothing. Its output is the input to a human decision:
 * which of these values are real roles, and which are copy-paste accidents.
 * See docs/superpowers/specs/2026-07-26-token-layer-design.md.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { extractColors } from './lib/extract-colors.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const OUT_DIR = join(ROOT, 'docs', 'tokens');
const EXTS = ['.ts', '.tsx', '.css'];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return EXTS.some((e) => full.endsWith(e)) ? [full] : [];
  });
}

const byValue = new Map();

for (const file of walk(SRC)) {
  const rel = relative(ROOT, file);
  const source = readFileSync(file, 'utf8');
  for (const hit of extractColors(source)) {
    const key = `${hit.kind === 'rgba' ? 'rgba' : 'hex'}:${hit.value}`;
    if (!byValue.has(key)) {
      byValue.set(key, { value: hit.value, kind: hit.kind, count: 0, kinds: {}, samples: [] });
    }
    const entry = byValue.get(key);
    entry.count += 1;
    entry.kinds[hit.kind] = (entry.kinds[hit.kind] ?? 0) + 1;
    if (entry.samples.length < 3) {
      entry.samples.push(`${rel}:${hit.line}:${hit.column}`);
    }
  }
}

const entries = [...byValue.values()].sort((a, b) => b.count - a.count);
const total = entries.reduce((n, e) => n + e.count, 0);

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(
  join(OUT_DIR, 'audit.json'),
  JSON.stringify({ total, distinct: entries.length, entries }, null, 2) + '\n',
);

console.log(`${total} colour literals, ${entries.length} distinct values`);
console.log('wrote docs/tokens/audit.json');
for (const e of entries.slice(0, 20)) {
  console.log(`  ${String(e.count).padStart(4)}  ${e.value}  ${JSON.stringify(e.kinds)}`);
}
```

- [ ] **Step 9: Run the audit and sanity-check the totals**

Run: `pnpm audit:tokens`

Expected: a total in the neighbourhood of 1,390 (1,279 hex-bearing plus 111 `rgba`), and the top of the list reading `#e040fb` ≈225, `#00d4ff` ≈140, `#6b6660` ≈132, `#1f1c17` ≈122, `#ff006e` ≈87.

If `#e040fb` does not come out near 225, the extractor is wrong. Stop and fix it before continuing; every later phase trusts this output.

- [ ] **Step 10: Commit**

```bash
git add package.json pnpm-lock.yaml vite.config.ts scripts/lib/extract-colors.mjs scripts/token-audit.mjs tests/extract-colors.test.mjs docs/tokens/audit.json
git commit -m "feat(tokens): add colour extractor and phase-A audit script"
```

---

### Task 2: Style snapshot and diff harness

Built before anything is rewritten, because it is the gate every later task reports to. Capturing the baseline is part of this task.

**Files:**
- Create: `scripts/lib/style-diff.mjs`
- Create: `scripts/style-snapshot.mjs`
- Create: `scripts/style-gate.mjs`
- Create: `tests/style-diff.test.mjs`
- Modify: `package.json` (add `puppeteer-core`, add `snapshot:styles` and `gate:styles` scripts)
- Modify: `.gitignore` (ignore `docs/tokens/snapshots/current/`)

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `diffSnapshots(baseline: Snapshot, current: Snapshot): Diff[]` where
  `Snapshot = { [scenarioKey: string]: { [elementPath: string]: { [cssProp: string]: string } } }` and
  `Diff = { scenario: string, path: string, prop: string, from: string, to: string } | { scenario: string, path: string, missing: true }`.

**Prerequisite:** a Chromium-family browser running with `--remote-debugging-port=9222`. This is the same CDP endpoint `browser-harness` uses, so if that works, this works. `puppeteer-core` connects to it and downloads no browser.

- [ ] **Step 1: Install puppeteer-core**

```bash
pnpm add -D puppeteer-core
```

- [ ] **Step 2: Write the failing diff test**

Create `tests/style-diff.test.mjs`:

```js
import { describe, it, expect } from 'vitest';
import { diffSnapshots } from '../scripts/lib/style-diff.mjs';

const base = {
  'home@desktop': {
    'body>div:nth-child(1)': { color: 'rgb(232, 228, 220)', 'background-color': 'rgba(0, 0, 0, 0)' },
  },
};

describe('diffSnapshots', () => {
  it('returns nothing when the snapshots match', () => {
    expect(diffSnapshots(base, structuredClone(base))).toEqual([]);
  });

  it('reports a changed property with both values', () => {
    const current = structuredClone(base);
    current['home@desktop']['body>div:nth-child(1)'].color = 'rgb(255, 0, 0)';
    expect(diffSnapshots(base, current)).toEqual([
      {
        scenario: 'home@desktop',
        path: 'body>div:nth-child(1)',
        prop: 'color',
        from: 'rgb(232, 228, 220)',
        to: 'rgb(255, 0, 0)',
      },
    ]);
  });

  it('reports an element that vanished', () => {
    expect(diffSnapshots(base, { 'home@desktop': {} })).toEqual([
      { scenario: 'home@desktop', path: 'body>div:nth-child(1)', missing: true },
    ]);
  });

  it('reports a scenario that vanished', () => {
    const diffs = diffSnapshots(base, {});
    expect(diffs).toHaveLength(1);
    expect(diffs[0].scenario).toBe('home@desktop');
  });

  it('ignores elements that are new in current but absent from baseline', () => {
    const current = structuredClone(base);
    current['home@desktop']['body>div:nth-child(2)'] = { color: 'rgb(1, 2, 3)' };
    expect(diffSnapshots(base, current)).toEqual([]);
  });
});
```

- [ ] **Step 3: Run the test and confirm it fails**

Run: `pnpm test`
Expected: FAIL, cannot resolve `../scripts/lib/style-diff.mjs`.

- [ ] **Step 4: Implement the diff**

Create `scripts/lib/style-diff.mjs`:

```js
// Pure comparison. Baseline is authoritative: anything present in the
// baseline must still be present and identical. Elements that only exist
// in `current` are ignored, so adding markup does not fail the gate.

export function diffSnapshots(baseline, current) {
  const diffs = [];
  for (const [scenario, elements] of Object.entries(baseline)) {
    const currentElements = current[scenario];
    if (!currentElements) {
      diffs.push({ scenario, path: '*', missing: true });
      continue;
    }
    for (const [path, props] of Object.entries(elements)) {
      const currentProps = currentElements[path];
      if (!currentProps) {
        diffs.push({ scenario, path, missing: true });
        continue;
      }
      for (const [prop, from] of Object.entries(props)) {
        const to = currentProps[prop];
        if (to !== from) diffs.push({ scenario, path, prop, from, to });
      }
    }
  }
  return diffs;
}
```

- [ ] **Step 5: Run the test and confirm it passes**

Run: `pnpm test`
Expected: PASS, 13 tests total across both files.

- [ ] **Step 6: Write the snapshot driver**

Create `scripts/style-snapshot.mjs`:

```js
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
 * Usage: node scripts/style-snapshot.mjs <out.json> [--base http://localhost:5173]
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import puppeteer from 'puppeteer-core';

const OUT = process.argv[2];
if (!OUT) {
  console.error('usage: node scripts/style-snapshot.mjs <out.json> [--base URL]');
  process.exit(2);
}
const baseIdx = process.argv.indexOf('--base');
const BASE = baseIdx > -1 ? process.argv[baseIdx + 1] : 'http://localhost:5173';

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
];

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

// `modifier` is applied after load, before collection.
const ROUTES = [
  { name: 'home', path: '/', modifier: null },
  { name: 'home-late', path: '/', modifier: 'late-night' },
  { name: 'home-override', path: '/', modifier: 'override-mode' },
  { name: 'case', path: '/work/PLACEHOLDER_SLUG', modifier: null },
];

const collect = (props) => {
  const out = {};
  const seen = new Map();
  const pathOf = (el) => {
    const parts = [];
    for (let n = el; n && n.nodeType === 1 && n !== document.documentElement; n = n.parentElement) {
      const i = n.parentElement ? [...n.parentElement.children].indexOf(n) + 1 : 1;
      parts.unshift(`${n.tagName.toLowerCase()}:nth-child(${i})`);
    }
    return parts.join('>');
  };
  for (const el of document.querySelectorAll('*')) {
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

const browser = await puppeteer.connect({
  browserURL: 'http://127.0.0.1:9222',
  defaultViewport: null,
});

const snapshot = {};
const page = await browser.newPage();

// Freeze every animation. The stylesheet already collapses its own
// animations under this query, which is what makes the walk deterministic.
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto(BASE + route.path, { waitUntil: 'networkidle0' });
    // The lazy tree mounts inside requestIdleCallback with a 400ms timeout.
    // Wait for a section that only exists after that flips.
    await page.waitForSelector('footer', { timeout: 15000 }).catch(() => {
      console.warn(`  warn: footer never appeared on ${route.name}@${vp.name}`);
    });
    if (route.modifier === 'late-night') {
      await page.evaluate(() => document.documentElement.classList.add('late-night'));
    }
    if (route.modifier === 'override-mode') {
      await page.evaluate(() => document.body.classList.add('override-mode'));
    }
    const key = `${route.name}@${vp.name}`;
    snapshot[key] = await page.evaluate(collect, PROPS);
    console.log(`  ${key}: ${Object.keys(snapshot[key]).length} elements`);
  }
}

await page.close();
await browser.disconnect();

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(snapshot, null, 2) + '\n');
console.log(`wrote ${OUT}`);
```

- [ ] **Step 7: Fill in the real case-study slug**

Run the dev server and read one real slug off the homepage rather than guessing:

```bash
pnpm dev
```

Then in another shell:

```bash
node -e "fetch('http://localhost:5173/sitemap.xml').then(r=>r.text()).then(t=>console.log(t.match(/\/work\/[^<]+/g)?.slice(0,3)))"
```

If that yields nothing, open `http://localhost:5173`, click any case study, and copy the slug out of the URL bar. Replace `PLACEHOLDER_SLUG` in `scripts/style-snapshot.mjs` with it. Do not leave the placeholder in place.

- [ ] **Step 8: Write the gate script**

Create `scripts/style-gate.mjs`:

```js
#!/usr/bin/env node
/**
 * Compares a freshly captured snapshot against the committed baseline and
 * exits non-zero on any difference. Run after every phase of the token
 * migration. A clean run is the only evidence that a phase was a no-op.
 *
 * Usage: node scripts/style-gate.mjs
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { diffSnapshots } from './lib/style-diff.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE = join(ROOT, 'docs', 'tokens', 'snapshots', 'baseline.json');
const CURRENT = join(ROOT, 'docs', 'tokens', 'snapshots', 'current', 'snapshot.json');

execFileSync('node', [join(ROOT, 'scripts', 'style-snapshot.mjs'), CURRENT], {
  stdio: 'inherit',
});

const diffs = diffSnapshots(
  JSON.parse(readFileSync(BASELINE, 'utf8')),
  JSON.parse(readFileSync(CURRENT, 'utf8')),
);

if (diffs.length === 0) {
  console.log('\nstyle gate: clean. no computed-style differences.');
  process.exit(0);
}

console.error(`\nstyle gate: ${diffs.length} differences\n`);
for (const d of diffs.slice(0, 50)) {
  console.error(
    d.missing
      ? `  MISSING  ${d.scenario}  ${d.path}`
      : `  ${d.scenario}  ${d.path}\n    ${d.prop}: ${d.from}  ->  ${d.to}`,
  );
}
if (diffs.length > 50) console.error(`  …and ${diffs.length - 50} more`);
process.exit(1);
```

- [ ] **Step 9: Add the package.json scripts and gitignore entry**

Add to `scripts`:

```json
"snapshot:styles": "node scripts/style-snapshot.mjs docs/tokens/snapshots/baseline.json",
"gate:styles": "node scripts/style-gate.mjs"
```

Append to `.gitignore`:

```
docs/tokens/snapshots/current/
```

- [ ] **Step 10: Capture the baseline**

Start the browser with CDP enabled if it is not already running, start the dev server, then:

```bash
pnpm snapshot:styles
```

Expected: twelve scenario lines printed (four routes × three viewports), each reporting several hundred elements. If any scenario reports fewer than 50 elements, the page did not finish mounting; raise the `waitForSelector` timeout and re-run.

- [ ] **Step 11: Prove the gate is honest**

Run it immediately against the baseline you just captured:

```bash
pnpm gate:styles
```

Expected: `style gate: clean.`

If this reports differences against an unchanged site, the snapshot is not deterministic and every later task's evidence is worthless. Stop and fix it. The most likely cause is an animation not covered by the reduced-motion query, or content that varies per load; if a specific property proves unstable, remove it from `PROPS` and note why in the file's comment block.

- [ ] **Step 12: Commit**

```bash
git add package.json pnpm-lock.yaml .gitignore scripts/lib/style-diff.mjs scripts/style-snapshot.mjs scripts/style-gate.mjs tests/style-diff.test.mjs docs/tokens/snapshots/baseline.json
git commit -m "feat(tokens): add computed-style snapshot gate and capture baseline"
```

---

### Task 3: Settle the hex to role map

**This is the human gate.** Everything after it is mechanical. Nothing here is guessed by the implementer.

**Files:**
- Create: `src/lib/tokens.ts`
- Create: `tests/tokens.test.ts`

**Interfaces:**
- Consumes: `docs/tokens/audit.json` from Task 1.
- Produces:
  - `TOKENS: Record<TokenName, string>` mapping role name to channel string, e.g. `{ accent: '224 64 251' }`
  - `HEX_TO_ROLE: Record<string, TokenName>` mapping lowercased hex to role name
  - `RGBA_TO_ROLE: Record<string, TokenName>` mapping `'r,g,b'` to role name
  - `channelsToHex(channels: string): string`
  - `readToken(name: TokenName): string` returning `#rrggbb`
  - `type TokenName` (union of the sixteen names)

- [ ] **Step 1: Review the audit with Micah and settle two open questions**

Open `docs/tokens/audit.json`.

**Question one, from the spec: the grey ramp.** `#6b6660` (132), `#4a453e` (69), `#a8a29e` (48), `#7a6e62` (19) are four near-identical greys. Read the sample call sites for each and determine whether they form a real four-step text ramp or whether some are copy-paste accidents. If they collapse, drop the corresponding names from the Text family.

**Question two, found while writing this plan: the page background is currently two different colours.** `src/index.css` declares `--bg: #08060a`, which paints `html, body`. `src/App.tsx:217` wraps the entire app in `bg-[#07070a]`. Those differ by one unit of red and are visually identical, but they are not the same value. A third, `#0a0a0a`, is the console scrim in `void.ts`.

This matters more than it looks. Whichever value `--bg` takes, the other becomes a gate diff, because the computed-style baseline records both exactly.

Three ways to resolve it, in order of preference:

1. **Unify on `#07070a`.** Cleanest outcome. The `html, body` background changes by one unit of red and no human will ever see it, but **the Task 4 gate will report a diff** on `html` and `body` in all twelve scenarios. That diff is expected and is the only intentional one in this sub-project. Record it, confirm the diff touches only `background-color` on `html` and `body` and nothing else, then re-capture the baseline before Task 5.
2. **Unify on `#08060a`.** Same trade in the other direction, with the diff landing on the App wrapper instead.
3. **Keep both**, adding a seventeenth token. Honest, but it enshrines an accident, and in sub-project #3 you would have to pick two nearly-identical Andean browns for no reason.

**Do not proceed until Micah has answered both.** Record both decisions in the comment block at the top of `src/lib/tokens.ts`. The token values written in Step 4 assume resolution 1.

- [ ] **Step 2: Write the failing test**

Create `tests/tokens.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { TOKENS, HEX_TO_ROLE, COLLAPSED_HEX, CODEMOD_MAP, channelsToHex } from '../src/lib/tokens';

describe('tokens', () => {
  it('declares every token as three space-separated channels', () => {
    for (const [name, value] of Object.entries(TOKENS)) {
      expect(value, `${name} must be "r g b"`).toMatch(/^\d{1,3} \d{1,3} \d{1,3}$/);
    }
  });

  it('has no hue words in any token name', () => {
    const hues = ['cyan', 'pink', 'magenta', 'red', 'blue', 'green', 'gold', 'turquoise'];
    for (const name of Object.keys(TOKENS)) {
      for (const hue of hues) {
        expect(name.toLowerCase()).not.toContain(hue);
      }
    }
  });

  it('round-trips every mapped hex back to its token value', () => {
    for (const [hex, role] of Object.entries(HEX_TO_ROLE)) {
      expect(channelsToHex(TOKENS[role])).toBe(hex);
    }
  });

  it('converts channels to lowercase six-digit hex with padding', () => {
    expect(channelsToHex('224 64 251')).toBe('#e040fb');
    expect(channelsToHex('7 7 10')).toBe('#07070a');
  });

  it('maps the five highest-traffic hexes', () => {
    for (const hex of ['#e040fb', '#00d4ff', '#6b6660', '#1f1c17', '#ff006e']) {
      expect(HEX_TO_ROLE[hex], `${hex} must be mapped`).toBeDefined();
    }
  });

  it('keeps collapsed hexes out of the exact map, so the round-trip stays honest', () => {
    for (const hex of Object.keys(COLLAPSED_HEX)) {
      expect(HEX_TO_ROLE[hex], `${hex} is a collapse, not an exact mapping`).toBeUndefined();
    }
  });

  it('collapses to a value that is genuinely different, and documents why', () => {
    for (const [hex, { role, why, sites }] of Object.entries(COLLAPSED_HEX)) {
      expect(channelsToHex(TOKENS[role]), `${hex} collapse is a no-op, so it belongs in HEX_TO_ROLE`).not.toBe(hex);
      expect(why.length, `${hex} needs a real justification`).toBeGreaterThan(40);
      expect(sites).toBeGreaterThan(0);
    }
  });

  it('gives the codemod both the exact map and the collapses', () => {
    expect(CODEMOD_MAP['#6b6660']).toBe('fg-dim');
    expect(CODEMOD_MAP['#7a6e62']).toBe('fg-dim');
    expect(CODEMOD_MAP['#08060a']).toBe('bg');
    expect(CODEMOD_MAP['#07070a']).toBe('bg');
  });
});
```

- [ ] **Step 3: Run the test and confirm it fails**

Run: `pnpm test`
Expected: FAIL, cannot resolve `../src/lib/tokens`.

- [ ] **Step 4: Write the token module**

Create `src/lib/tokens.ts`. Values below are today's colours, unchanged, so this file is a no-op by construction. Adjust the Text family to match the Step 1 decision.

```ts
/**
 * The single source of truth for colour in this site.
 *
 * Tokens are stored as space-separated RGB channels because that is the only
 * form under which Tailwind's <alpha-value> placeholder works, and 103 call
 * sites depend on opacity modifiers like `border-accent/60` continuing to
 * resolve. See docs/superpowers/specs/2026-07-26-token-layer-design.md.
 *
 * Names describe the job, never the hue. `signal` is #00d4ff here and will be
 * turquoise in another world, and no component is allowed to care.
 *
 * GREY RAMP DECISION (task 3, step 1): <record the outcome here>
 * PAGE BACKGROUND DECISION (task 3, step 1): <record the outcome here>
 */

export type TokenName =
  | 'bg' | 'surface' | 'raised'
  | 'rule' | 'rule-strong'
  | 'fg' | 'fg-warm' | 'fg-muted' | 'fg-dim' | 'fg-ghost'
  | 'accent' | 'accent-hot' | 'signal' | 'signal-hot'
  | 'alert' | 'ember';

export const TOKENS: Record<TokenName, string> = {
  bg: '7 7 10',            // #07070a
  surface: '11 10 8',      // #0b0a08
  raised: '26 23 18',      // #1a1712
  rule: '31 28 23',        // #1f1c17
  'rule-strong': '42 38 32', // #2a2620
  fg: '232 228 220',       // #e8e4dc
  'fg-warm': '201 184 166', // #c9b8a6
  'fg-muted': '168 162 158', // #a8a29e
  'fg-dim': '107 102 96',  // #6b6660, absorbs #7a6e62 per the step 1 ruling
  'fg-ghost': '74 69 62',  // #4a453e
  accent: '224 64 251',    // #e040fb
  'accent-hot': '255 45 120', // #ff2d78
  signal: '0 212 255',     // #00d4ff
  'signal-hot': '79 195 247', // #4fc3f7
  alert: '255 59 59',      // #ff3b3b
  ember: '124 58 237',     // #7c3aed
};

export const HEX_TO_ROLE: Record<string, TokenName> = {
  '#07070a': 'bg',
  '#0b0a08': 'surface',
  '#1a1712': 'raised',
  '#1f1c17': 'rule',
  '#2a2620': 'rule-strong',
  '#e8e4dc': 'fg',
  '#c9b8a6': 'fg-warm',
  '#a8a29e': 'fg-muted',
  '#6b6660': 'fg-dim',
  '#4a453e': 'fg-ghost',
  '#e040fb': 'accent',
  '#ff2d78': 'accent-hot',
  '#00d4ff': 'signal',
  '#4fc3f7': 'signal-hot',
  '#ff3b3b': 'alert',
  '#7c3aed': 'ember',
};

/**
 * Deliberate collapses, ruled on by Micah in task 3 step 1.
 *
 * These hexes do NOT round-trip: each is being retired into a token whose
 * value differs slightly, so the sites using them change colour by a visible-
 * on-paper, invisible-in-practice amount. Kept separate from HEX_TO_ROLE so
 * the round-trip test stays a real assertion instead of being weakened to
 * accommodate them.
 *
 * Each entry costs exactly one intentional wave of gate diffs, at the phase
 * where the sites using it are rewritten. Expected diff counts are noted.
 */
export const COLLAPSED_HEX: Record<string, { role: TokenName; sites: number; why: string }> = {
  '#7a6e62': {
    role: 'fg-dim',
    sites: 19,
    why: 'Same job as #6b6660 (small uppercase tracked labels) at 44% vs 40% luminance. #6b6660 has 132 uses to its 19. Was the value :root called --muted, which the components ignored.',
  },
  '#08060a': {
    role: 'bg',
    sites: 2,
    why: 'Vestigial page background. #07070a is the de facto value with 13 uses including the App wrapper. This one survived only in the --bg declaration itself and AgentBattle.tsx:197.',
  },
};

/** What the codemod actually consults. Exact matches plus ruled collapses. */
export const CODEMOD_MAP: Record<string, TokenName> = {
  ...HEX_TO_ROLE,
  ...Object.fromEntries(
    Object.entries(COLLAPSED_HEX).map(([hex, { role }]) => [hex, role]),
  ),
};

export const RGBA_TO_ROLE: Record<string, TokenName> = Object.fromEntries(
  Object.entries(HEX_TO_ROLE).map(([hex, role]) => [
    [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ].join(','),
    role,
  ]),
) as Record<string, TokenName>;

export function channelsToHex(channels: string): string {
  const parts = channels.trim().split(/\s+/).map(Number);
  return '#' + parts.map((n) => n.toString(16).padStart(2, '0')).join('');
}

const cache = new Map<TokenName, string>();
let cachedWorld: string | null = null;

/**
 * Resolves a token to hex for consumers that cannot use CSS.
 *
 * Two of those exist and both are real: THREE.Color rejects the
 * `rgb(r g b / a)` form entirely, and devtools console CSS (see src/lib/void.ts)
 * is evaluated outside the document and cannot resolve var() at all.
 */
export function readToken(name: TokenName): string {
  const world = document.documentElement.dataset.world ?? 'default';
  if (world !== cachedWorld) {
    cache.clear();
    cachedWorld = world;
  }
  const hit = cache.get(name);
  if (hit) return hit;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(`--${name}`)
    .trim();
  const hex = raw ? channelsToHex(raw) : channelsToHex(TOKENS[name]);
  cache.set(name, hex);
  return hex;
}
```

Note: `#4fc3f7`, `#ff2d78` and `#7c3aed` appear in `:root` today but barely in components. They are included so the vocabulary is complete and the modifier refactor in Task 7 has names to use.

- [ ] **Step 5: Run the test and confirm it passes**

Run: `pnpm test`
Expected: PASS, 22 tests total (8 extractor + 5 style-diff + 9 tokens).

- [ ] **Step 6: Verify every high-traffic audit value is mapped**

`package.json` sets `"type": "module"`, so `require` is not available. Use a file:

```bash
cat > /tmp/check-map.mjs <<'EOF'
import { readFileSync } from 'node:fs';
const audit = JSON.parse(readFileSync('docs/tokens/audit.json', 'utf8'));
const mapped = new Set(
  readFileSync('src/lib/tokens.ts', 'utf8').match(/#[0-9a-f]{6}/g) ?? [],
);
let gaps = 0;
for (const e of audit.entries) {
  if (e.kind === 'rgba' || e.count < 9) continue;
  if (!mapped.has(e.value)) {
    console.log('UNMAPPED', e.value, e.count, e.samples[0]);
    gaps += 1;
  }
}
console.log(gaps === 0 ? 'done: every value with 9+ uses is mapped' : `${gaps} gaps`);
EOF
node /tmp/check-map.mjs
```

Expected: `done: every value with 9+ uses is mapped`. Anything unmapped either joins the vocabulary or gets an explicit note in the `tokens.ts` comment block saying why it stays literal.

- [ ] **Step 7: Commit**

```bash
git add src/lib/tokens.ts tests/tokens.test.ts
git commit -m "feat(tokens): settle the hex to role map"
```

---

### Task 4: Land the tokens without consuming them

Phase B. Provably a no-op.

**Files:**
- Modify: `src/index.css:7-34` (the `:root` block)
- Modify: `tailwind.config.js`

**Interfaces:**
- Consumes: `TOKENS` from Task 3 (values transcribed by hand into CSS, since CSS cannot import TS).
- Produces: sixteen `--<token>` custom properties on `:root`; sixteen Tailwind colour names.

- [ ] **Step 1: Add the token declarations to `:root`**

In `src/index.css`, inside the existing `:root` block, **after** the `--void-5` line and **before** `--bg`, insert:

```css
  /* Colour tokens. Space-separated RGB channels, no wrapper: the form is
     load-bearing, because Tailwind's <alpha-value> placeholder only works
     against it. See src/lib/tokens.ts. */
  --bg: 7 7 10;
  --surface: 11 10 8;
  --raised: 26 23 18;
  --rule: 31 28 23;
  --rule-strong: 42 38 32;
  --fg: 232 228 220;
  --fg-warm: 201 184 166;
  --fg-muted: 168 162 158;
  --fg-dim: 122 110 98;
  --fg-ghost: 107 102 96;
  --accent: 224 64 251;
  --accent-hot: 255 0 110;
  --signal: 0 212 255;
  --signal-hot: 79 195 247;
  --alert: 255 59 59;
  --ember: 124 58 237;
```

Then **delete** the old `--bg`, `--bg-2`, `--fg`, `--muted`, `--line`, `--accent`, `--accent-hot`, `--cyan`, `--cyan-hot`, `--pink`, `--ember` lines. Keep `--persona-accent` and the four `--safe-*` lines exactly as they are.

- [ ] **Step 2: Fix the now-broken var() consumers inside index.css**

The old names are referenced further down the same file. Update every one:

- `html, body { background-color: var(--bg); }` becomes `background-color: rgb(var(--bg));`
- `body { color: var(--fg); }` becomes `color: rgb(var(--fg));`
- `::selection { background: var(--accent); color: var(--bg); }` becomes `background: rgb(var(--accent)); color: rgb(var(--bg));`
- `.caret::after { color: var(--accent); }` becomes `color: rgb(var(--accent));`
- `.neon-amber`, `.neon-cyan`, `.neon-pink` colour properties get the same `rgb(...)` wrap; leave their hard-coded `text-shadow` rgba values alone for now, Task 6 handles those.
- `.persona-tint`, `.persona-border` use `--persona-accent`, which is unchanged. Leave them.

Search the file for `var(--` and confirm every remaining hit either resolves to one of the sixteen new names wrapped in `rgb()`, or is `--persona-accent`, `--heartbeat-color`, or a `--safe-*` inset.

- [ ] **Step 3: Add the Tailwind colours**

Replace `tailwind.config.js` entirely:

```js
/** @type {import('tailwindcss').Config} */

// Colour names here mirror src/lib/tokens.ts exactly. The rgb(var(--x) /
// <alpha-value>) form is what lets `border-accent/60` keep working; a bare
// var() in an arbitrary value cannot take an opacity modifier.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        raised: token('raised'),
        rule: token('rule'),
        'rule-strong': token('rule-strong'),
        fg: token('fg'),
        'fg-warm': token('fg-warm'),
        'fg-muted': token('fg-muted'),
        'fg-dim': token('fg-dim'),
        'fg-ghost': token('fg-ghost'),
        accent: token('accent'),
        'accent-hot': token('accent-hot'),
        signal: token('signal'),
        'signal-hot': token('signal-hot'),
        alert: token('alert'),
        ember: token('ember'),
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 4: Verify the Tailwind wiring produces real CSS**

Add a throwaway element to `src/components/Hero.tsx` at the top of its returned tree:

```tsx
<div data-token-probe className="text-accent border-accent/60 bg-surface" />
```

Run `pnpm dev`, open the page, inspect `[data-token-probe]` in devtools, and confirm:
- `color` computes to `rgb(224, 64, 251)`
- `border-color` computes to `rgba(224, 64, 251, 0.6)` — **this is the critical assertion.** If it resolves to something else, or the class produced no rule at all, the alpha placeholder is wired wrong and Task 5 cannot proceed.

Then delete the probe element.

- [ ] **Step 5: Run the gate**

Run: `pnpm gate:styles`

**Expected: exactly 60 diffs, on exactly 5 element paths, and nothing else.** These numbers were measured against the committed baseline, so treat any deviation as a bug rather than as noise.

Per scenario, across all 12 scenarios:

| Elements | Property | From | To | Why |
|---|---|---|---|---|
| `html`, `body` (2) | `background-color` | `rgb(8, 6, 10)` | `rgb(7, 7, 10)` | The ruled `#08060a` retirement. `--bg` now carries the token value. |
| `body`, `body>div:nth-child(1)`, `body>script:nth-child(2)` (3) | `color` | `rgb(239, 230, 212)` | `rgb(232, 228, 220)` | `:root` declared `--fg: #efe6d4`, which has 3 uses. The token value is `#e8e4dc`, which has 62. Blast radius stays tiny because `App.tsx` re-declares `text-[#e8e4dc]` on its own wrapper, so everything inside `#root` already computed to the token value. |

That is 2 × 12 = 24 background diffs plus 3 × 12 = 36 colour diffs.

Verify the report matches, then re-baseline and confirm:

```bash
pnpm snapshot:styles
pnpm gate:styles   # must now be clean
git add docs/tokens/snapshots/baseline.json.gz
```

**Any diff outside those five paths means Step 2 broke an existing `var()` consumer.** Do not re-baseline to make an unexplained diff go away. That turns the gate into decoration for every task after this one.

- [ ] **Step 6: Typecheck, lint, build**

```bash
pnpm typecheck && pnpm lint && pnpm build
```

Expected: all clean.

- [ ] **Step 7: Commit**

```bash
git add src/index.css tailwind.config.js
git commit -m "feat(tokens): declare colour tokens and wire them into tailwind"
```

---

### Task 5: Codemod the Tailwind class sites

Phase C. 901 sites, entirely map-driven.

**Files:**
- Create: `scripts/lib/codemod.mjs`
- Create: `scripts/lib/load-ts.mjs`
- Create: `scripts/token-codemod.mjs`
- Create: `tests/codemod.test.mjs`
- Modify: every file under `src/` containing an arbitrary colour class
- Modify: `package.json` (add `codemod:tokens`)

**Interfaces:**
- Consumes: `CODEMOD_MAP` from Task 3 (the exact map plus the ruled collapses).
- Produces: `applyCodemod(source: string, hexToRole: Record<string,string>): { output: string, unmapped: Array<{ value: string, line: number }> }`.
- Produces: `loadTsModule(relPath: string): Promise<Module>`.

- [ ] **Step 1: Write the failing test**

Create `tests/codemod.test.mjs`:

```js
import { describe, it, expect } from 'vitest';
import { applyCodemod } from '../scripts/lib/codemod.mjs';

const MAP = { '#e040fb': 'accent', '#6b6660': 'fg-ghost', '#ff006e': 'accent-hot' };

describe('applyCodemod', () => {
  it('rewrites a plain arbitrary colour class', () => {
    const { output } = applyCodemod('<b className="text-[#e040fb]" />', MAP);
    expect(output).toBe('<b className="text-accent" />');
  });

  it('preserves the opacity modifier', () => {
    expect(applyCodemod('border-[#e040fb]/60', MAP).output).toBe('border-accent/60');
  });

  it('rewrites every prefix, not just text and border', () => {
    const src = 'bg-[#e040fb] from-[#e040fb] ring-[#e040fb] shadow-[#e040fb] fill-[#e040fb]';
    expect(applyCodemod(src, MAP).output).toBe(
      'bg-accent from-accent ring-accent shadow-accent fill-accent',
    );
  });

  it('rewrites hex inside ternary class strings', () => {
    const src = "d.redacted ? 'text-[#ff006e]' : 'text-[#6b6660]'";
    expect(applyCodemod(src, MAP).output).toBe("d.redacted ? 'text-accent-hot' : 'text-fg-ghost'");
  });

  it('is case insensitive on the hex', () => {
    expect(applyCodemod('text-[#E040FB]', MAP).output).toBe('text-accent');
  });

  it('leaves bare hex outside a class bracket untouched', () => {
    const src = "style={{ color: '#e040fb' }}";
    expect(applyCodemod(src, MAP).output).toBe(src);
  });

  it('leaves an unmapped colour in place and reports it', () => {
    const { output, unmapped } = applyCodemod('text-[#abcdef]', MAP);
    expect(output).toBe('text-[#abcdef]');
    expect(unmapped).toEqual([{ value: '#abcdef', line: 1 }]);
  });

  it('rewrites arbitrary sizes and other non-colour brackets never', () => {
    const src = 'min-h-[100dvh] w-[calc(100%-2px)]';
    expect(applyCodemod(src, MAP).output).toBe(src);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm test`
Expected: FAIL, cannot resolve `../scripts/lib/codemod.mjs`.

- [ ] **Step 3: Implement the codemod**

Create `scripts/lib/codemod.mjs`:

```js
// Rewrites Tailwind arbitrary colour classes to token names.
//
// Deliberately narrow: it only touches `-[#rrggbb]` and `-[#rrggbb]/NN`.
// Bare hex in inline styles and JS strings is Task 6's hand work, because
// those need `rgb(var(--x))` and cannot be decided by pattern alone.
//
// An unmapped hex is never guessed at. It is left alone and reported, so a
// colour nobody classified cannot silently become the wrong token.

const CLASS_COLOR = /-\[(#[0-9a-fA-F]{6})\](\/[0-9.]+)?/g;

export function applyCodemod(source, hexToRole) {
  const unmapped = [];
  let output = '';
  let last = 0;
  let m;

  CLASS_COLOR.lastIndex = 0;
  while ((m = CLASS_COLOR.exec(source)) !== null) {
    const [full, hex, alpha] = m;
    const role = hexToRole[hex.toLowerCase()];
    output += source.slice(last, m.index);
    if (role) {
      output += `-${role}${alpha ?? ''}`;
    } else {
      output += full;
      unmapped.push({
        value: hex.toLowerCase(),
        line: source.slice(0, m.index).split('\n').length,
      });
    }
    last = m.index + full.length;
  }
  output += source.slice(last);
  return { output, unmapped };
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `pnpm test`
Expected: PASS, 26 tests total.

- [ ] **Step 5a: Extract the TypeScript loader**

Create `scripts/lib/load-ts.mjs`. This is lifted from `scripts/prerender.mjs:90`, which already does exactly this to keep prerendered slugs from drifting from the app's own `slug.ts`. `esbuild` is already a devDependency.

```js
// Transpile-and-import a TypeScript module from a plain node script.
//
// Node cannot import .ts directly, and hand-parsing TypeScript with regex is
// how map-drift bugs get in. scripts/prerender.mjs has carried a private copy
// of this for the same reason; this is the shared version.

import { mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build as esbuild } from 'esbuild';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export async function loadTsModule(relPath) {
  const tmp = join(ROOT, 'node_modules', '.cache', `loadts-${relPath.replace(/\W+/g, '-')}.mjs`);
  mkdirSync(dirname(tmp), { recursive: true });
  await esbuild({
    entryPoints: [join(ROOT, relPath)],
    outfile: tmp,
    format: 'esm',
    platform: 'node',
    bundle: false,
    logLevel: 'silent',
  });
  const mod = await import(pathToFileURL(tmp).href + '?t=' + Date.now());
  rmSync(tmp, { force: true });
  return mod;
}
```

Leave `scripts/prerender.mjs` alone. Its copy is load-bearing for SEO and consolidating it is not in this task's scope; the duplication is recorded in the ledger for a later cleanup.

- [ ] **Step 5b: Write the runner**

Create `scripts/token-codemod.mjs`:

```js
#!/usr/bin/env node
/**
 * Phase C. Applies the class-name codemod across src/.
 *
 * Run with --dry first. Always. The report tells you whether the map from
 * task 3 actually covers the codebase before anything is written to disk.
 *
 * Usage: node scripts/token-codemod.mjs [--dry]
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyCodemod } from './lib/codemod.mjs';
import { loadTsModule } from './lib/load-ts.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry');
const EXTS = ['.ts', '.tsx'];

// tokens.ts is TypeScript and CODEMOD_MAP is assembled with spreads, so it
// cannot be scraped out of the source text. Transpile and import it, the same
// way scripts/prerender.mjs loads src/lib/slug.ts. One source of truth.
const { CODEMOD_MAP } = await loadTsModule('src/lib/tokens.ts');

if (!CODEMOD_MAP || Object.keys(CODEMOD_MAP).length < 10) {
  console.error('CODEMOD_MAP has fewer than 10 entries; refusing to run');
  process.exit(2);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return EXTS.some((e) => full.endsWith(e)) ? [full] : [];
  });
}

let changedFiles = 0;
let rewrites = 0;
const allUnmapped = [];

for (const file of walk(join(ROOT, 'src'))) {
  const source = readFileSync(file, 'utf8');
  const { output, unmapped } = applyCodemod(source, CODEMOD_MAP);
  for (const u of unmapped) allUnmapped.push({ ...u, file: relative(ROOT, file) });
  if (output === source) continue;
  changedFiles += 1;
  rewrites += (source.match(/-\[#[0-9a-fA-F]{6}\]/g) ?? []).length - (output.match(/-\[#[0-9a-fA-F]{6}\]/g) ?? []).length;
  if (!DRY) writeFileSync(file, output);
}

console.log(`${DRY ? '[dry] ' : ''}${rewrites} class sites rewritten across ${changedFiles} files`);
if (allUnmapped.length) {
  console.log(`\n${allUnmapped.length} unmapped colours left in place:`);
  const grouped = new Map();
  for (const u of allUnmapped) {
    if (!grouped.has(u.value)) grouped.set(u.value, []);
    grouped.get(u.value).push(`${u.file}:${u.line}`);
  }
  for (const [value, where] of grouped) {
    console.log(`  ${value}  x${where.length}  ${where[0]}`);
  }
}
```

- [ ] **Step 6: Dry run and read the report**

```bash
node scripts/token-codemod.mjs --dry
```

Expected: roughly 901 class sites across roughly 55 files.

Read the unmapped list carefully. Any unmapped colour appearing more than twice should probably have been in the map; go back to Task 3 and add it rather than accepting it. One-off unmapped values are acceptable and get handled by hand in Task 6.

- [ ] **Step 7: Apply it**

```bash
node scripts/token-codemod.mjs
```

- [ ] **Step 8: Typecheck and lint**

```bash
pnpm typecheck && pnpm lint
```

Expected: clean. TypeScript does not check class strings, so a failure here means the codemod damaged syntax; `git diff` will show where.

- [ ] **Step 9: Run the gate**

Run: `pnpm gate:styles`

**This is the most important verification in the plan.** Read the result carefully rather than pattern-matching on "clean".

Expected: **exactly one class of diff, and no other.** The `#7a6e62` collapse ruled on in Task 3 Step 1 lands here for its 16 Tailwind-class sites, so you should see roughly 16 elements whose `color` moves from `rgb(122, 110, 98)` to `rgb(107, 102, 96)`. Nothing else.

Verify that is all it is, then re-baseline and confirm:

```bash
pnpm snapshot:styles
pnpm gate:styles   # must now be clean
git add docs/tokens/snapshots/baseline.json
```

**Any diff that is not that collapse means the map is wrong or the codemod mangled a class.** The reported `from -> to` values name the exact token at fault. Do not re-baseline to make an unexplained diff disappear, and do not proceed with one outstanding. The remaining 3 `#7a6e62` sites are bare hex and land in Task 7, not here.

- [ ] **Step 10: Add the script and commit**

Add to `package.json` scripts: `"codemod:tokens": "node scripts/token-codemod.mjs"`

```bash
git add package.json scripts/lib/codemod.mjs scripts/token-codemod.mjs tests/codemod.test.mjs src/
git commit -m "refactor(tokens): codemod tailwind arbitrary colours to token names"
```

---

### Task 6: Convert the rgba literals

Phase D, part one. 111 sites. Split from the rest because it is pattern-driven and the remainder is judgement.

**Files:**
- Modify: `src/index.css`, and every `src/` file containing `rgba(`

**Interfaces:**
- Consumes: `RGBA_TO_ROLE` from Task 3.
- Produces: nothing new.

- [ ] **Step 1: List what you are about to change**

```bash
grep -rn "rgba(" src | wc -l
grep -roh "rgba([0-9]\+, *[0-9]\+, *[0-9]\+" src | sort | uniq -c | sort -rn
```

Expected: about 111 total. The frequent triples should be recognisable as the token channels: `224, 64, 251` is `accent`, `0, 212, 255` is `signal`, `255, 0, 110` is unmapped-hot, `255, 59, 59` is `alert`.

- [ ] **Step 2: Rewrite them by hand, file by file**

For each `rgba(r, g, b, a)` whose triple matches a token, rewrite as `rgb(var(--<role>) / <a>)`:

```css
/* before */
text-shadow: 0 0 8px rgba(224, 64, 251, 0.6), 0 0 22px rgba(224, 64, 251, 0.3);
/* after */
text-shadow: 0 0 8px rgb(var(--accent) / 0.6), 0 0 22px rgb(var(--accent) / 0.3);
```

In TSX inline styles the same rewrite applies verbatim, since it is still CSS:

```tsx
style={{ boxShadow: `0 0 18px rgb(var(--accent) / 0.35)` }}
```

Leave every `rgba(0, 0, 0, x)` and `rgba(255, 255, 255, x)` alone. Pure black and pure white scrims are not themed, they are shadow and highlight, and forcing them through tokens buys nothing.

Any triple that matches no token stays as-is for now and is reported in Step 4.

- [ ] **Step 3: Run the gate after each file or two**

Run: `pnpm gate:styles`
Expected: `style gate: clean.`

Do this incrementally rather than after all 111. A diff is far cheaper to localise when it covers two files instead of thirty.

- [ ] **Step 4: Record the leftovers**

```bash
grep -roh "rgba([0-9]\+, *[0-9]\+, *[0-9]\+" src | sort | uniq -c | sort -rn
```

Every remaining triple must be either black, white, or listed with a one-line reason in a comment where it appears. No silent leftovers.

- [ ] **Step 5: Typecheck, lint, commit**

```bash
pnpm typecheck && pnpm lint
git add src/
git commit -m "refactor(tokens): convert rgba literals to token channels"
```

---

### Task 7: Convert the remaining hex by hand

Phase D, part two. The ~267 sites in inline styles, JS strings, SVG attributes and three.js props.

**Files:**
- Modify, largest first: `src/components/DeadDropConsole.tsx`, `src/components/Hero.tsx`, `src/components/TimeMachine.tsx`, `src/components/VKInterview.tsx`, `src/components/AgentBattle.tsx`, `src/components/EsperScene.tsx`, `src/lib/void.ts`, then the remainder
- Modify: `src/App.tsx:199,203,217` (the ErrorBoundary fallback and root wrapper)

**Interfaces:**
- Consumes: `readToken` and `TokenName` from Task 3.
- Produces: nothing new.

- [ ] **Step 1: Find what is left**

```bash
grep -rn "#[0-9a-fA-F]\{6\}" src | grep -v "src/lib/tokens.ts" | wc -l
grep -rln "#[0-9a-fA-F]\{6\}" src | grep -v "src/lib/tokens.ts"
```

- [ ] **Step 2: Rewrite CSS-context hex to `rgb(var(--x))`**

Anywhere the value lands in CSS — inline `style` objects, template strings that become CSS, SVG `fill`/`stroke` attributes — use the CSS form. No JS import needed.

```tsx
/* before */ style={{ color: '#00d4ff' }}
/* after  */ style={{ color: 'rgb(var(--signal))' }}

/* before */ <circle fill="#e040fb" />
/* after  */ <circle fill="rgb(var(--accent))" />
```

- [ ] **Step 3: Rewrite JS-context hex to `readToken()`**

Only two consumers genuinely need this, and both are real.

`src/components/EsperScene.tsx` — three.js. `THREE.Color` cannot parse `rgb(r g b / a)`:

```tsx
import { readToken } from '../lib/tokens';

// before: <meshBasicMaterial color="#e040fb" />
// after:
<meshBasicMaterial color={readToken('accent')} />
```

`src/lib/void.ts` — devtools console CSS, which is evaluated outside the document and cannot resolve `var()`:

```ts
import { readToken } from './tokens';

// before: const say = (t: string, c = '#00d4ff') => console.log(`%c${t}`, ink(c));
// after:
const say = (t: string, c = readToken('signal')) => console.log(`%c${t}`, ink(c));
```

Note that `ink()` in `void.ts` also hard-codes `background:#0a0a0a`. That value is not in the map. Leave it literal and add a comment saying it is a console-only scrim, or add it to the map as part of Task 3 if you would rather it themed. Decide, do not leave it undocumented.

- [ ] **Step 4: Handle App.tsx**

Three sites: the ErrorBoundary fallback at `src/App.tsx:199` and `:203`, and the root wrapper at `:217`.

```tsx
/* before */ className="min-h-[100dvh] bg-[#07070a] text-[#e8e4dc] …"
/* after  */ className="min-h-[100dvh] bg-bg text-fg …"
```

`bg-bg` reads badly. If you prefer, rename the token to `base` across `tokens.ts`, `index.css`, `tailwind.config.js` and every call site in one commit. Either is fine. Do not do it halfway.

- [ ] **Step 5: Run the gate after every two or three files**

Run: `pnpm gate:styles`

Expected: clean, with two ruled exceptions that land in this task and nowhere else:
- the last 3 `#7a6e62` sites (bare hex, the other 16 landed in Task 5)
- `AgentBattle.tsx:197`, the last `#08060a` site (the other was the `--bg` declaration, handled in Task 4)

Both are the Task 3 Step 1 collapses finishing. When you hit them, confirm the diff is only those elements, then re-baseline as in Task 5 Step 9. Anything else is a bug.

- [ ] **Step 6: Verify the three.js scene by eye**

The style gate walks the DOM, and three.js paints into a canvas, so the gate is blind to `EsperScene`. Run `pnpm dev`, open the Esper section, and confirm it renders in the same colours as before. Take a screenshot and compare against `main` by eye. This is the one place where eyeballing is the only option.

- [ ] **Step 7: Verify the console eggs by hand**

Open devtools, run the `rep7` egg from `void.ts`, and confirm the output is still coloured. The gate never sees the console and will happily pass a completely broken egg.

- [ ] **Step 8: Typecheck, lint, build, commit**

```bash
pnpm typecheck && pnpm lint && pnpm build
git add src/
git commit -m "refactor(tokens): convert remaining hex in styles, svg, three.js and console eggs"
```

---

### Task 8: Refactor the modifiers

Phase E. `override-mode` and `late-night` stop redeclaring hex.

**Files:**
- Modify: `src/index.css:251-296` (`body.override-mode`), `src/index.css:372-391` (`html.late-night`)

**Interfaces:**
- Consumes: the sixteen `:root` tokens from Task 4.
- Produces: nothing new.

- [ ] **Step 0: Retire `--cyan` and `--pink`. This task owns that, and it is not optional.**

Task 4 was required by the spec to delete both, and deliberately did not. The reason was sound and is worth understanding before you undo it.

`.neon-cyan` reads `var(--cyan)` and `.neon-pink` reads `var(--pink)`. In the default theme those hold the same values as `--signal` and `--accent-hot`, so repointing looks free. It is not, because the two modifiers diverge:

| | `--pink` | `--accent-hot` |
|---|---|---|
| default | `#ff006e` | `#ff006e` |
| `body.override-mode` | `#ff9090` | `#ff6666` |
| `html.late-night` | not overridden, stays `#ff006e` | `#a21caf` |

So repointing `.neon-pink` at `--accent-hot` while the modifiers still carry independent values changes `.neon-pink`'s computed colour under both modifiers. Task 4 measured exactly that: 6 spurious diffs. It kept both variables alive in channel form rather than break its own no-op guarantee, and left the cleanup here.

You are rewriting both modifier blocks in this task, which is what makes the cleanup possible. Do it in this order:

1. Repoint `.neon-cyan` to `rgb(var(--signal))` and `.neon-pink` to `rgb(var(--accent-hot))`.
2. Delete `--cyan` and `--pink` from `:root` and from both modifier blocks.
3. In `body.override-mode`, the old `--pink: #ff9090` value disappears. Decide deliberately: either accept that `.neon-pink` now computes to `--accent-hot`'s override (`255 102 102`) under override-mode, which is a real one-time visual change on those elements, or keep the distinction by giving `.neon-pink` its own scoped rule inside the modifier block. **Pick one, state which in the commit message, and expect the gate to show that exact set of diffs and no others.**
4. Same decision for `html.late-night`, where `--pink` was never overridden and `--accent-hot` becomes `162 28 175`.

Count the affected elements first so you know what the gate should report before you run it. Do not discover the number from the gate.

If you conclude the cleanup genuinely cannot be done here either, that is a finding to escalate, not to defer silently a second time. Two deferrals is how a stated constraint quietly becomes permanent.

Also delete the two dead declarations `--bg-2: #140404` and `--line: #3a0f0f` inside `body.override-mode`. Nothing reads either one; verified by grepping for `var(--bg-2` and `var(--line`, zero hits.

- [ ] **Step 1: Rewrite the override-mode block**

Both modifiers stay Blade-Runner-scoped. Whether Future Primitive gets its own is a sub-project #3 question and is explicitly out of scope here.

```css
body.override-mode {
  --accent: 255 59 59;
  --accent-hot: 255 102 102;
  --signal: 255 59 59;
  --signal-hot: 255 144 144;
  --fg: 255 214 214;
  --bg: 10 3 3;
  --surface: 20 4 4;
  --rule: 58 15 15;
}
```

Then rewrite the `body.override-mode::before` gradient and the two `.site-rain` overrides from `rgba(255, 59, 59, x)` to `rgb(var(--accent) / x)`, and `.override-banner`'s border, background, colour and box-shadow the same way.

- [ ] **Step 2: Rewrite the late-night block**

```css
html.late-night {
  --accent: 192 38 211;
  --signal: 14 165 233;
  --accent-hot: 162 28 175;
}
```

And convert the four gradient stops in `html.late-night body::before` to `rgb(var(--…) / x)` form. The `filter: saturate(0.7) brightness(0.92)` line is not colour and stays.

- [ ] **Step 3: Verify both modifiers still work**

Run `pnpm dev`. Enter the konami code and confirm the site turns red. Then in devtools run `document.documentElement.classList.add('late-night')` and confirm the violet shift.

- [ ] **Step 4: Run the gate**

Run: `pnpm gate:styles`
Expected: `style gate: clean.` The baseline captured both modifiers as scenarios in Task 2, so this is a genuine assertion and not a formality.

- [ ] **Step 5: Commit**

```bash
git add src/index.css
git commit -m "refactor(tokens): rebuild override and late-night modifiers on tokens"
```

---

### Task 9: Lock the door

Phase F. Without this, the migration unwinds within a month.

**Files:**
- Modify: `eslint.config.js`
- Modify: `src/index.css` (exemption comment)

**Interfaces:**
- Consumes: nothing.
- Produces: a lint failure on any new raw hex.

- [ ] **Step 1: Add the rule**

Append a second config object to `eslint.config.js`, after the existing one:

```js
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/lib/tokens.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/#[0-9a-fA-F]{6}\\b/]",
          message:
            'Raw hex colours are not allowed in src/. Use a token: a Tailwind class like text-accent, rgb(var(--accent)) in CSS contexts, or readToken("accent") for three.js and console output. See src/lib/tokens.ts.',
        },
        {
          selector: "TemplateElement[value.raw=/#[0-9a-fA-F]{6}\\b/]",
          message:
            'Raw hex colours are not allowed in src/. Use a token. See src/lib/tokens.ts.',
        },
      ],
    },
  },
```

- [ ] **Step 2: Run lint and confirm it passes**

```bash
pnpm lint
```

Expected: clean. If it reports violations, Tasks 5 through 7 are not actually finished. Fix the reported sites rather than widening the ignore list.

- [ ] **Step 3: Prove the rule actually fires**

Temporarily add `const nope = '#ff0000';` to `src/lib/logger.ts`, run `pnpm lint`, and confirm it errors with the token message. Then delete the line.

A lint rule nobody has seen fail is a lint rule that might not be wired up.

- [ ] **Step 4: Document the CSS exemption**

`eslint` does not lint `.css`, so the `--void-1` block in `src/index.css` needs no rule change, only a note. Add above it:

```css
/* Exempt from the no-raw-hex rule by nature: these are prose, not colour.
   The other exemption is src/lib/tokens.ts. There are no others. */
```

- [ ] **Step 5: Commit**

```bash
git add eslint.config.js src/index.css
git commit -m "chore(tokens): fail the build on new raw hex in src"
```

---

### Task 10: Prove the site is themeable

The acceptance test. This is the only task that produces a visible change, and it reverts it.

**Files:**
- Modify: `src/index.css` (temporary proof block, removed in Step 6)

**Interfaces:**
- Consumes: everything.
- Produces: evidence.

- [ ] **Step 1: Add a throwaway proof world**

These sixteen values are deliberately disposable. They are a smoke test, not the Future Primitive palette, which is designed in sub-project #3. They are chosen only to be loudly different from Blade Runner so a missed site is obvious.

Append to `src/index.css`:

```css
/* TEMPORARY. Task 10 acceptance proof only. Delete before merge.
   Not the Future Primitive palette. See the program spec. */
html[data-world="proof"] {
  --bg: 26 18 14;
  --surface: 38 26 20;
  --raised: 54 38 28;
  --rule: 74 52 38;
  --rule-strong: 96 68 48;
  --fg: 242 232 214;
  --fg-warm: 222 198 160;
  --fg-muted: 186 158 124;
  --fg-dim: 142 116 88;
  --fg-ghost: 110 90 70;
  --accent: 212 160 23;
  --accent-hot: 236 190 60;
  --signal: 32 148 150;
  --signal-hot: 72 186 186;
  --alert: 178 38 34;
  --ember: 140 62 30;
}
```

- [ ] **Step 2: Flip it and look**

Run `pnpm dev`, then in devtools:

```js
document.documentElement.dataset.world = 'proof';
```

- [ ] **Step 3: Walk every section and record what did not change**

Scroll the entire homepage and check each section: Nav, Hero, Work, SoulLayer, LiveSites, Certifications, EsperScene, Manifesto, BaselineGate, IndexList, Impact, About, WebDossier, Services, Recognition, GitArchaeology, Contact, Footer. Then open a case study route. Then open the command palette with Cmd+K.

Anything still showing magenta, cyan or the old greys is a missed site. Write down each one, fix it, and re-run `pnpm gate:styles` with the proof world **off** to confirm the fix did not change the default world.

- [ ] **Step 4: Confirm the hard cases themed**

- `EsperScene` re-colours. This is the three.js consumer and the likeliest silent miss.
- The devtools console eggs from `void.ts` print in the new palette.
- `border-accent/60` sites still render at 60% opacity rather than solid. Inspect any bordered panel and confirm the computed `border-color` is an `rgba(...)` with alpha, not a flat `rgb(...)`.

- [ ] **Step 5: Capture evidence**

Screenshot the homepage at desktop width in both worlds, side by side, and attach them to the task record. This is the artefact that shows the sub-project did what it claimed.

- [ ] **Step 6: Remove the proof block**

Delete the `html[data-world="proof"]` block from `src/index.css`. It has served its purpose and the real palette arrives in sub-project #3.

- [ ] **Step 7: Final full verification**

```bash
pnpm test && pnpm typecheck && pnpm lint && pnpm build && pnpm gate:styles
```

Expected: all five clean. `pnpm build` runs `scripts/prerender.mjs`, which covers acceptance criterion 6: prerendered output carries Blade Runner values, because `:root` is Blade Runner and prerender sets no `data-world`.

Confirm that last point explicitly:

```bash
grep -c "data-world" dist/index.html
```

Expected: `0`.

- [ ] **Step 8: Commit**

```bash
git add src/index.css
git commit -m "test(tokens): prove the site re-themes from a single attribute"
```

---

## Definition of done

All six acceptance criteria from the spec, verified:

1. No raw hex in `src/` outside the two exemptions — enforced by Task 9, proven by Task 9 Step 3.
2. Computed-style diff empty across four scenarios × three viewports — Tasks 4, 5, 6, 7, 8, 10.
3. `data-world` flip re-themes every section — Task 10.
4. `pnpm typecheck`, `pnpm lint`, `pnpm build` clean — Task 10 Step 7.
5. `EsperScene` re-themes — Task 10 Step 4.
6. Prerender carries Blade Runner values — Task 10 Step 7.

Sub-project #2, the world engine, starts from here.

# Mobile Calm Reader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Phones get a calm, readable conscious-shell: ~26 desktop-only ambient components never mount (and their chunks never download), the stale-deploy auto-refresh becomes invisible, and type/contrast meet reading floors.

**Architecture:** A `useShellTier()` hook (viewport + pointer media queries) decides `full` vs `calm` in App.tsx; desktop-only components render only on `full`, inside their own null-fallback error boundary. `lazyWithRetry` gains a `critical` flag: non-critical chunks fail soft, critical chunks defer their stale-deploy reload until the tab is hidden. CSS media queries handle the type floor and effect damping.

**Tech Stack:** React 18 + Vite + Tailwind (token-backed), vitest (node environment, tests in `tests/`), dev verification via the in-app browser at the 375px mobile preset.

**Spec:** `docs/superpowers/specs/2026-08-03-mobile-calm-reader-design.md`

## Global Constraints

- Branch from `future-primitive-tokens` (the colour tokens live there, unmerged to main). Use a worktree (superpowers:using-git-worktrees) named `mobile-calm-reader`.
- The main working tree has UNCOMMITTED token-program work in `index.html`, `scripts/prerender.mjs`, `scripts/style-snapshot.mjs`, `src/components/LiveSites.tsx`. Never stage, revert, or modify those files.
- Never use em dashes in any copy, comment, or commit message. Use hyphens or rephrase.
- Vitest runs in `environment: 'node'` and only picks up `tests/**/*.test.{mjs,ts}`. No jsdom is installed: test pure functions, verify DOM behavior in the browser.
- Full tier requires BOTH `(min-width: 768px)` AND `(hover: hover) and (pointer: fine)`. Everything else is calm.
- `npm run lint` has a known pre-existing baseline of warnings (see commit 70a244c). Do not fix unrelated lint debt; just introduce no NEW errors.
- Do not regenerate `docs/tokens/snapshots/baseline.json.gz`. If `npm run gate:styles` flags only this plan's intended changes, report it; do not silently re-baseline.

---

### Task 1: Shell tier hook

**Files:**
- Create: `src/lib/shellTier.ts`
- Test: `tests/shell-tier.test.ts`

**Interfaces:**
- Produces: `resolveTier(wide: boolean, finePointer: boolean): ShellTier`, `useShellTier(): ShellTier`, `type ShellTier = 'full' | 'calm'`. Task 3 imports `useShellTier` in App.tsx.

- [ ] **Step 1: Write the failing test**

```ts
// tests/shell-tier.test.ts
import { describe, it, expect } from 'vitest';
import { resolveTier } from '../src/lib/shellTier';

describe('resolveTier', () => {
  it('is full only when wide AND fine-pointer', () => {
    expect(resolveTier(true, true)).toBe('full');
  });
  it('is calm on narrow viewports even with a mouse', () => {
    expect(resolveTier(false, true)).toBe('calm');
  });
  it('is calm on coarse pointers even when wide (touch tablets)', () => {
    expect(resolveTier(true, false)).toBe('calm');
  });
  it('is calm on phones', () => {
    expect(resolveTier(false, false)).toBe('calm');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/shell-tier.test.ts`
Expected: FAIL - cannot resolve `../src/lib/shellTier`

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/shellTier.ts
//
// The shell has two costumes. 'full' is the desktop theater: ambient
// overlays, HUDs, eggs. 'calm' is the reader: content, the boot sequence,
// grain, one slow rain layer, the dock. Phones and coarse-pointer tablets
// are calm; the theater needs a wide screen and a fine pointer.
// See docs/superpowers/specs/2026-08-03-mobile-calm-reader-design.md.

import { useEffect, useState } from 'react';

export type ShellTier = 'full' | 'calm';

const WIDE_QUERY = '(min-width: 768px)';
const FINE_QUERY = '(hover: hover) and (pointer: fine)';

export function resolveTier(wide: boolean, finePointer: boolean): ShellTier {
  return wide && finePointer ? 'full' : 'calm';
}

function readTier(): ShellTier {
  if (typeof window === 'undefined' || !window.matchMedia) return 'calm';
  return resolveTier(
    window.matchMedia(WIDE_QUERY).matches,
    window.matchMedia(FINE_QUERY).matches,
  );
}

export function useShellTier(): ShellTier {
  const [tier, setTier] = useState<ShellTier>(readTier);

  useEffect(() => {
    if (!window.matchMedia) return;
    const wide = window.matchMedia(WIDE_QUERY);
    const fine = window.matchMedia(FINE_QUERY);
    const update = () => setTier(resolveTier(wide.matches, fine.matches));
    wide.addEventListener('change', update);
    fine.addEventListener('change', update);
    return () => {
      wide.removeEventListener('change', update);
      fine.removeEventListener('change', update);
    };
  }, []);

  return tier;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/shell-tier.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/shellTier.ts tests/shell-tier.test.ts
git commit -m "feat(mobile): add shell tier hook - full vs calm from viewport and pointer"
```

---

### Task 2: Chunk-failure recovery rework

**Files:**
- Modify: `src/lib/lazyWithRetry.ts`
- Test: `tests/lazy-recovery.test.ts`

**Interfaces:**
- Consumes: `saveRecoveryScroll()` from `src/lib/recoveryScroll` (already exists, already imported).
- Produces: `lazyWithRetry(factory, opts?: { critical?: boolean })` - default `critical: true`. `recoveryAction(input: { critical: boolean; chunkError: boolean; recentlyReloaded: boolean }): 'defer-reload' | 'throw'` (exported for tests). Task 3 passes `{ critical: false }` for every ambient component.

- [ ] **Step 1: Write the failing test**

```ts
// tests/lazy-recovery.test.ts
import { describe, it, expect } from 'vitest';
import { recoveryAction, isChunkLoadError } from '../src/lib/lazyWithRetry';

describe('recoveryAction', () => {
  it('defers a reload for a critical stale-chunk failure', () => {
    expect(
      recoveryAction({ critical: true, chunkError: true, recentlyReloaded: false }),
    ).toBe('defer-reload');
  });
  it('never reloads for non-critical (ambient) chunks', () => {
    expect(
      recoveryAction({ critical: false, chunkError: true, recentlyReloaded: false }),
    ).toBe('throw');
  });
  it('respects the reload cooldown', () => {
    expect(
      recoveryAction({ critical: true, chunkError: true, recentlyReloaded: true }),
    ).toBe('throw');
  });
  it('does not reload for non-chunk errors', () => {
    expect(
      recoveryAction({ critical: true, chunkError: false, recentlyReloaded: false }),
    ).toBe('throw');
  });
});

describe('isChunkLoadError', () => {
  it('matches the stale-deploy import failure', () => {
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: https://x/a.js'))).toBe(true);
  });
  it('ignores ordinary errors', () => {
    expect(isChunkLoadError(new Error('boom'))).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lazy-recovery.test.ts`
Expected: FAIL - `recoveryAction` is not exported. NOTE: importing `lazyWithRetry.ts` pulls in `react`; if the node environment chokes on the `react` import itself, that is still the expected failure state for this step.

- [ ] **Step 3: Rework the implementation**

Replace the catch block's recovery section (currently: `isChunkLoadError(...) && !recentlyReloaded()` then `markReloaded(); saveRecoveryScroll(); window.location.reload();` and a never-resolving promise) with the deferred model. Keep the retry loop, `isChunkLoadError`, `recentlyReloaded`, `markReloaded`, and the `RELOAD_*` constants exactly as they are. The full new shape:

```ts
// (imports and existing helpers unchanged)

export type RecoveryInput = {
  critical: boolean;
  chunkError: boolean;
  recentlyReloaded: boolean;
};

// Pure + testable. A stale-deploy 404 on a chunk the reader needs earns ONE
// deferred reload. Ambient chunks never reload: the shell just goes without
// that layer. Mid-read reloads used to register as a random auto-refresh -
// the recovery was louder than the failure.
export function recoveryAction(input: RecoveryInput): 'defer-reload' | 'throw' {
  if (input.critical && input.chunkError && !input.recentlyReloaded) return 'defer-reload';
  return 'throw';
}

// One listener per page, no matter how many chunks fail in the same burst.
let reloadScheduled = false;

function scheduleReloadWhenHidden(): void {
  if (reloadScheduled || typeof document === 'undefined') return;
  reloadScheduled = true;
  const onVisibility = () => {
    if (!document.hidden) return;
    document.removeEventListener('visibilitychange', onVisibility);
    markReloaded();
    saveRecoveryScroll();
    window.location.reload();
  };
  document.addEventListener('visibilitychange', onVisibility);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  opts: { critical?: boolean } = {},
): LazyExoticComponent<T> {
  const { critical = true } = opts;
  return lazy(async () => {
    try {
      return await factory();
    } catch (firstError) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
        try {
          return await factory();
        } catch {
          /* keep retrying */
        }
      }

      const action = recoveryAction({
        critical,
        chunkError: isChunkLoadError(firstError),
        recentlyReloaded: recentlyReloaded(),
      });
      if (action === 'defer-reload' && typeof window !== 'undefined') {
        // The reload happens the next time the tab is hidden, so the reader
        // never watches the page restart. Until then the ErrorBoundary shows
        // an inline tap-to-reload fallback in the section's place.
        scheduleReloadWhenHidden();
      }
      throw firstError;
    }
  });
}
```

Preserve the existing file-top comment block but update its numbered list to describe the deferred model (retry, then defer-reload-when-hidden for critical chunks, fail soft for ambient chunks).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/lazy-recovery.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: clean (App.tsx still compiles - the second parameter is optional)

- [ ] **Step 6: Commit**

```bash
git add src/lib/lazyWithRetry.ts tests/lazy-recovery.test.ts
git commit -m "feat(mobile): defer stale-chunk reloads until the tab hides, fail soft for ambient chunks"
```

---

### Task 3: Tier-gate App.tsx into content and ambient groups

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useShellTier` from `src/lib/shellTier` (Task 1), `lazyWithRetry(factory, { critical: false })` (Task 2), `ErrorBoundary` from `src/components/ErrorBoundary` (existing - props: `label`, `fallback?: (err, reset) => ReactNode` or a ReactNode, children; read the file to confirm the fallback signature before wiring `null` fallbacks).
- Produces: the final component tree shape that Tasks 4-6 verify against.

- [ ] **Step 1: Convert the four eager ambient imports to lazy non-critical**

`CRTOverlay`, `SessionHUD`, `SoulLayer`, `DevtoolsEasterEggs` are currently eager imports. Remove the static imports and add them to the lazy block:

```ts
const CRTOverlay = lazy(() => import('./components/CRTOverlay'), { critical: false });
const SessionHUD = lazy(() => import('./components/SessionHUD'), { critical: false });
const SoulLayer = lazy(() => import('./components/SoulLayer'), { critical: false });
const DevtoolsEasterEggs = lazy(() => import('./components/DevtoolsEasterEggs'), { critical: false });
```

`BootOverlay`, `Nav`, `Hero`, `Work`, `AmbientAudio`, `MobileControlDock` stay eager (first paint or dock-critical).

- [ ] **Step 2: Mark every desktop-only lazy component non-critical**

Add `, { critical: false }` to the `lazy(...)` call of exactly this set (the spec's desktop-only list): `TearsInRain`, `SystemBreach`, `NoirSubtitles`, `NarratorOverlay`, `VisitorDossier`, `IntelligenceHUD`, `BlackLitany`, `SocraticStatic`, `OrigamiUnicorns`, `ConsoleHijack`, `LateNight`, `Heartbeat`, `TypingEchoes`, `OverrideMode`, `WitnessProtocol`, `FalseMemory`, `MemoryDecay`, `TimeSkip`, `GhostUnits`, `ExitIntent`, `SelfDestruct`, plus the four from Step 1. Content sections, `DeadDropConsole`, `LogViewer`, and `CommandPalette` keep the default (`critical: true`).

- [ ] **Step 3: Split the render tree by tier**

In `App()`: `const tier = useShellTier();`. Restructure the route element:

- Always rendered (all tiers): `HomeMeta`, `BootOverlay`, `AmbientAudio`, `Nav`, `Hero`, `Work`, the SLOW rain div (`site-rain slow`), the grain div, and inside the hydrated content group: `DeadDropConsole`, `TimeMachine`, `VoightKampff`, `VKInterview`, `LiveSites`, `Certifications`, `EsperScene`, `Manifesto`, `BaselineGate` (+ `BaselineUnlocked`, `HumanLayer`, `HaikuDeck`), `IndexList`, `Impact`, `About`, `WebDossier`, `Services`, `Recognition`, `GitArchaeology`, `Contact`, `Footer`, `CommandPalette`, `LogViewer`, `MobileControlDock`.
- Full tier only: `DevtoolsEasterEggs`, `CRTOverlay`, `SessionHUD`, `SoulLayer`, the FAST rain div (`site-rain`, no `slow` class), and the ambient group: `TearsInRain`, `SystemBreach`, `NoirSubtitles`, `OverrideMode`, `SocraticStatic`, `OrigamiUnicorns`, `ConsoleHijack`, `LateNight`, `SelfDestruct`, `Heartbeat`, `TypingEchoes`, `IntelligenceHUD`, `BlackLitany`, `NarratorOverlay`, `VisitorDossier`, `WitnessProtocol`, `FalseMemory`, `MemoryDecay`, `TimeSkip`, `GhostUnits`, `ExitIntent`.

Shape (content group keeps the existing `label="lazy-tree"` boundary and gains a visible fallback; ambient group gets its own null-fallback boundary):

```tsx
{hydrated && (
  <ErrorBoundary
    label="lazy-tree"
    fallback={(_err, reset) => <ChunkFallback onRetry={reset} />}
  >
    <Suspense fallback={null}>
      {/* ...content group listed above, same order as today... */}
    </Suspense>
  </ErrorBoundary>
)}

{hydrated && tier === 'full' && (
  <ErrorBoundary label="ambient" fallback={() => null}>
    <Suspense fallback={null}>
      {/* ...ambient group listed above, same order as today... */}
    </Suspense>
  </ErrorBoundary>
)}
```

Add the inline fallback component at the bottom of App.tsx (module scope, next to `safeUUID`):

```tsx
// Shown in place of the content sections when a critical chunk is gone
// (stale deploy). A reload is already scheduled for the next time the tab
// hides; this button is for the reader who wants it now.
function ChunkFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="px-6 py-16 text-center font-mono">
      <p className="text-sm text-fg-muted">part of the shell failed to load.</p>
      <button
        onClick={() => {
          saveRecoveryScroll();
          window.location.reload();
        }}
        className="mt-4 text-sm border border-fg/30 rounded px-4 py-3 min-h-[44px] hover:bg-fg/10"
      >
        tap to reload
      </button>
      <button onClick={onRetry} className="mt-4 ml-3 text-sm text-fg-dim underline min-h-[44px]">
        try again without reloading
      </button>
    </div>
  );
}
```

Import `saveRecoveryScroll` from `./lib/recoveryScroll` at the top of App.tsx. If `text-fg-muted` / `text-fg-dim` / `border-fg` token classes are not yet usable at this point of the branch, fall back to the literal hexes used elsewhere in App.tsx (`#a8a29e`, `#6b6660`, `#e8e4dc`).

- [ ] **Step 4: Typecheck and unit tests**

Run: `npm run typecheck && npm test`
Expected: both clean

- [ ] **Step 5: Verify in the browser - calm tier**

Start the dev server via the launch config (preview_start), resize to the mobile preset (375px), reload, then confirm via read_page + the network log:

- No CRT/scanline layer, no SessionHUD corner text, no BlackLitany marquee, no SoulLayer fragments, no fast rain div (exactly one `.site-rain` element, with class `slow`).
- Network shows NO fetches for ambient chunk files (spot-check: `SystemBreach`, `NarratorOverlay`, `SoulLayer`, `CRTOverlay` chunks absent; `About`, `Services`, `Contact` chunks present).
- The dock renders; tapping `drop` opens the dead-drop console; the nav drawer's `/palette` button opens the command palette; the BaselineGate input accepts text.

- [ ] **Step 6: Verify in the browser - full tier**

Resize to desktop preset (1280px). Confirm the ambient layer returns (CRT scanlines, SessionHUD, marquee, both rain layers) with no console errors. Resize back down to 375px and confirm the overlays unmount live.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx
git commit -m "feat(mobile): calm tier mounts content only - ambient layer is desktop-only"
```

---

### Task 4: CSS type floor and effect damping

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Consumes: nothing from other tasks (pure CSS, media-query gated).
- Produces: the mobile readability floor Tasks 5-6 verify visually.

- [ ] **Step 1: Add the mobile block**

Append to `src/index.css` (after the existing `.site-grain` rules, before the `prefers-reduced-motion` block):

```css
/* Mobile readability floor. The 8-10px mono labels are legible at desk
   distance, not at arm's length. Attribute selectors catch every Tailwind
   arbitrary size without touching 165 call sites. Tracking is capped so
   grown labels do not overflow their containers. */
@media (max-width: 767px) {
  [class*='text-[8px]'],
  [class*='text-[9px]'],
  [class*='text-[10px]'] {
    font-size: 11px !important;
    letter-spacing: 0.22em !important;
  }
  [class*='text-[11px]'] {
    font-size: 12px !important;
  }

  /* Calm tier keeps atmosphere at a whisper: the slow rain and the grain
     stay, dialed down from 0.06 / 0.04. */
  .site-rain.slow { opacity: 0.04; }
  .site-grain { opacity: 0.03; }
}
```

- [ ] **Step 2: Verify in the browser**

Dev server at 375px: zoom into the Hero, dock, and Work cards. Confirm labels render at 11px+ (javascript_tool: `getComputedStyle(document.querySelector('[class*="text-[10px]"]')).fontSize` returns `"11px"`), no label overflows its container (screenshot pass over Hero, dock, footer), rain/grain visibly quieter. At 1280px confirm desktop is untouched (same query returns `"10px"`).

- [ ] **Step 3: Run the style gate**

Run: `npm run gate:styles`
Expected: either clean, or diffs ONLY in font-size/letter-spacing/opacity at mobile widths. Report anything else; do not re-baseline.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "feat(mobile): 11px label floor and quieter grain and rain under 768px"
```

---

### Task 5: Reading copy contrast, size, and tap targets

**Files:**
- Modify: `src/components/Services.tsx`, `src/components/Manifesto.tsx`, `src/components/About.tsx`, `src/components/MobileControlDock.tsx`, plus any files the audit in Step 1 surfaces.

**Interfaces:**
- Consumes: colour tokens already wired in `tailwind.config.js` (`text-fg-muted` = #a8a29e, `text-fg-dim` = #6b6660).
- Produces: nothing consumed by later tasks; Task 6 verifies visually.

- [ ] **Step 1: Audit reading copy**

Run both audits and classify each hit as READING (full sentences a visitor is meant to read) or LABEL (decorative meta text):

```bash
grep -n 'text-sm' src/components/{About,Services,Manifesto,Contact,Impact,Recognition,Work,WebDossier,GitArchaeology}.tsx
grep -rn 'text-\[#6b6660\]' src/components/{About,Services,Manifesto,Contact,Impact,Recognition,Work,WebDossier,GitArchaeology}.tsx
```

Rules: READING copy at `text-sm` becomes `text-base` (or `text-base md:text-sm` where desktop should keep the tighter size). READING copy in `text-[#6b6660]` becomes `text-[#a8a29e]`. LABELs are left alone (Task 4's floor already covers their size).

- [ ] **Step 2: Apply the three known edits plus audit findings**

Known from the spec work:

- `Services.tsx:31`: `text-[#a8a29e] text-sm md:text-base leading-relaxed` becomes `text-[#a8a29e] text-base leading-relaxed`
- `Manifesto.tsx:56`: `text-[#a8a29e] text-sm md:text-base` becomes `text-[#a8a29e] text-base`
- `About.tsx:24`: `<dl className="p-5 text-sm space-y-3">` becomes `<dl className="p-5 text-[15px] md:text-sm space-y-3">`

Apply the same two rules to every READING hit from Step 1. Line numbers above are as of commit cf62e33; re-locate by content if they have drifted.

- [ ] **Step 3: Dock tap targets**

In `MobileControlDock.tsx` (line ~55), add `min-h-[44px]` to the button className string:

`... inline-flex items-center justify-center gap-1.5 min-h-[44px] border bg-[#0b0a08]/85 ...`

- [ ] **Step 4: Verify in the browser**

Dev server at 375px: read the Services, Manifesto, and About sections end to end via screenshot; body copy renders at 16px, no clipped or overflowing text, dock buttons measure at least 44px tall (javascript_tool: `document.querySelectorAll('[class*="min-h-[44px]"]')[0].getBoundingClientRect().height >= 44`). At 1280px: no visible desktop regression in the same sections.

- [ ] **Step 5: Typecheck, test, commit**

```bash
npm run typecheck && npm test
git add src/components/Services.tsx src/components/Manifesto.tsx src/components/About.tsx src/components/MobileControlDock.tsx
git commit -m "feat(mobile): reading copy at 16px and fg-muted contrast, 44px dock targets"
```

(Include any additional audit-edited files in the `git add`.)

---

### Task 6: End-to-end verification, including the stale-chunk drill

**Files:**
- No source changes expected. Fixes discovered here belong to the task that owns the file.

**Interfaces:**
- Consumes: everything above.

- [ ] **Step 1: Full check suite**

Run: `npm run typecheck && npm test && npm run lint`
Expected: typecheck and tests clean; lint no worse than the pre-existing baseline (compare against `git stash` free main-tree run only if in doubt; the constraint is no NEW errors).

- [ ] **Step 2: Production build and stale-chunk drill - ambient**

```bash
npm run build
ls dist/assets | head -30
```

Rename one AMBIENT chunk to simulate a stale deploy, then serve:

```bash
mv dist/assets/SystemBreach-*.js dist/assets/SystemBreach.gone.js
npm run preview
```

In the browser at DESKTOP width (ambient mounts only on full tier): load the site, wait for hydration, confirm the page renders fully, no reload occurs while watching (page `performance.getEntriesByType('navigation')` still shows one navigation after 60s), and the console shows the failed import handled without a blank screen.

- [ ] **Step 3: Stale-chunk drill - critical**

Rebuild cleanly, then break a content chunk instead:

```bash
npm run build
mv dist/assets/About-*.js dist/assets/About.gone.js
```

Reload at 375px: the content area shows the "part of the shell failed to load / tap to reload" fallback instead of a blank page, and NO automatic reload happens while the tab is visible. Then background the tab (switch tabs); on return the page has reloaded once and renders (still broken chunk = ErrorBoundary again, which is correct; rebuild cleanly afterwards to confirm the healthy path).

- [ ] **Step 4: Mobile walkthrough as a user**

Clean `npm run build && npm run preview`, browser at 375px, dark scheme:

- Boot sequence plays once, then gone.
- Scroll the full page: no overlay ever covers body text; only slow rain + grain atmosphere.
- Dock: toggle ambient audio on/off, open the dead-drop console, open logs. All reachable, all dismissible.
- Nav drawer opens, `/palette` opens the command palette, a project opens its case study, back returns to position.
- BaselineGate: pass the four prompts by touch keyboard; HumanLayer + HaikuDeck reveal.

- [ ] **Step 5: Update the plan checkboxes and commit any doc changes**

```bash
git add docs/superpowers/plans/2026-08-03-mobile-calm-reader.md
git commit -m "docs(plan): mark mobile calm reader verification complete"
```

- [ ] **Step 6: Post-deploy follow-up (note for after merge)**

After the branch ships to production, re-run the `app_logs` query from `docs/superpowers/specs/2026-08-03-mobile-calm-reader-design.md` section 5 a few days later: mobile `Failed to load <link>` bursts should no longer coincide with reload navigations. This step is observational; it cannot be completed inside this branch.

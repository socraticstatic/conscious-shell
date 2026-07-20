// Why this file exists:
//
// lazyWithRetry does a hard reload to recover from a stale-deploy chunk 404
// (see that file's header). The recovery works, but main.tsx sets
// history.scrollRestoration = 'manual', so the reload dumps the visitor at the
// top of the page. Scrolling down the homepage, crossing a lazy section whose
// chunk name predates the current deploy, and getting thrown back to the hero
// reads as a random auto-refresh. The recovery was louder than the failure.
//
// So: stash the scroll position on the way out, put it back on the way in.

const SCROLL_KEY = 'cs:recovery-scroll';
// The saved position only makes sense for the reload it was saved for. Anything
// older is a stale entry from an earlier episode (or a restored tab) and would
// yank an unrelated page load down the page.
const MAX_AGE_MS = 15_000;

type Saved = { y: number; path: string; at: number };

export function saveRecoveryScroll(): void {
  try {
    const entry: Saved = {
      y: window.scrollY,
      path: window.location.pathname + window.location.search,
      at: Date.now(),
    };
    sessionStorage.setItem(SCROLL_KEY, JSON.stringify(entry));
  } catch {
    /* storage blocked — we just lose the position, the reload still recovers */
  }
}

function read(): Saved | null {
  try {
    const raw = sessionStorage.getItem(SCROLL_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(SCROLL_KEY); // one-shot: consume on read
    const parsed = JSON.parse(raw) as Saved;
    if (typeof parsed?.y !== 'number' || !Number.isFinite(parsed.y)) return null;
    if (typeof parsed.at !== 'number' || Date.now() - parsed.at > MAX_AGE_MS) return null;
    if (parsed.path !== window.location.pathname + window.location.search) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function restoreRecoveryScroll(): void {
  const saved = read();
  if (!saved || saved.y <= 0) return;

  // A #hash in the URL means useScrollToHash owns the scroll position. Two
  // systems re-asserting different targets on overlapping intervals fight and
  // the loser wins at random. Defer.
  if (window.location.hash) return;

  // Two things fight a single scrollTo here, so we clear and re-assert on an
  // interval for the whole settle window instead:
  //
  //   1. App.tsx clamps body.style.height to its measured content height, and
  //      that measurement lags while lazy sections below the fold mount. The
  //      document literally isn't tall enough yet, so the scroll lands short.
  //      Clearing the clamp each tick works around it; App.tsx's ResizeObserver
  //      reapplies a correct value on its next real resize.
  //   2. This module runs before React hydrates. Tick one scrolls the tall
  //      *prerendered* DOM and hits the target exactly - then hydration swaps
  //      the content, the document briefly collapses, and the browser clamps
  //      scroll down to whatever still fits (measured: a 3000px target ended up
  //      at 392px). Stopping at the first successful landing congratulates
  //      itself right before the layout moves out from under it.
  //
  // useScrollToHash settles the same way, for the same reasons.
  const deadline = Date.now() + 4000;
  const tick = () => {
    document.body.style.height = '';
    document.documentElement.style.height = '';
    window.scrollTo(0, saved.y);
    if (Date.now() >= deadline) cancel();
  };

  const cancel = () => {
    clearInterval(timer);
    window.removeEventListener('wheel', cancel);
    window.removeEventListener('touchstart', cancel);
  };

  const timer = setInterval(tick, 100);
  window.addEventListener('wheel', cancel, { passive: true, once: true });
  window.addEventListener('touchstart', cancel, { passive: true, once: true });
  tick();
}

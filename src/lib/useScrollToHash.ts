import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router doesn't auto-scroll to a URL's #hash the way a native
// document navigation does. Several sections that anchor-links point at
// (e.g. #contact, #work) are lazy-loaded well below the fold and deferred
// until the browser is idle (see App.tsx), so the target element can take
// longer than a short fixed-count poll to mount — watch the DOM instead of
// guessing a timeout, with a generous bound in case the id never shows up.
//
// App.tsx also runs an effect that clamps `body.style.height` to the
// measured height of its content wrapper (to stop fixed/animated overlays
// inflating documentElement.scrollHeight on mobile). That measurement can
// lag well behind reality right after a route change — verified directly:
// with lazy sections still mounting below the fold, body.style.height can
// get stuck several thousand pixels short of the real content height, which
// caps how far the page can physically scroll regardless of how many times
// scrollIntoView is called. Clear the clamp before each scroll attempt here;
// App.tsx's own ResizeObserver reapplies a correct value on its next real
// resize, so this doesn't reintroduce the phantom-space bug that clamp fixes.
function clearHeightClamp() {
  document.body.style.height = '';
  document.documentElement.style.height = '';
}

// 'instant', not 'smooth': a smooth scroll animates over several frames,
// and a reflow from a lazy section mounting mid-animation can interrupt
// it partway. Re-asserting an instant jump on every settle tick below is
// more reliable here than trusting one smooth animation to survive a
// layout that's still settling.
function jumpTo(el: Element) {
  clearHeightClamp();
  el.scrollIntoView({ behavior: 'instant', block: 'start' });
}

export function useScrollToHash() {
  const { hash, key } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);

    let settleTimer: ReturnType<typeof setInterval> | null = null;
    let observer: MutationObserver | null = null;
    let giveUp: ReturnType<typeof setTimeout> | null = null;

    const startSettling = () => {
      const deadline = Date.now() + 3000;
      settleTimer = setInterval(() => {
        const el = document.getElementById(id);
        if (el) jumpTo(el);
        if (Date.now() >= deadline && settleTimer) {
          clearInterval(settleTimer);
          settleTimer = null;
        }
      }, 150);
    };

    const tryScroll = () => {
      const el = document.getElementById(id);
      if (!el) return false;
      jumpTo(el);
      startSettling();
      return true;
    };

    if (!tryScroll()) {
      observer = new MutationObserver(() => {
        if (tryScroll()) {
          observer?.disconnect();
          observer = null;
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      giveUp = setTimeout(() => {
        observer?.disconnect();
        observer = null;
      }, 10_000);
    }

    return () => {
      observer?.disconnect();
      if (giveUp) clearTimeout(giveUp);
      if (settleTimer) clearInterval(settleTimer);
    };
    // `key` changes on every navigation (including a click back to the same
    // hash), so re-run even when `hash` itself is unchanged.
  }, [hash, key]);
}

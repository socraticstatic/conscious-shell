import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router doesn't auto-scroll to a URL's #hash the way a native
// document navigation does. Several sections that anchor-links point at
// (e.g. #contact, #work) are lazy-loaded well below the fold and deferred
// until the browser is idle (see App.tsx), so the target element can take
// longer than a short fixed-count poll to mount — watch the DOM instead of
// guessing a timeout, with a generous bound in case the id never shows up.
export function useScrollToHash() {
  const { hash, key } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);

    const tryScroll = () => {
      const el = document.getElementById(id);
      if (!el) return false;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    };

    if (tryScroll()) return;

    const observer = new MutationObserver(() => {
      if (tryScroll()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const giveUp = setTimeout(() => observer.disconnect(), 10_000);
    return () => {
      observer.disconnect();
      clearTimeout(giveUp);
    };
    // `key` changes on every navigation (including a click back to the same
    // hash), so re-run even when `hash` itself is unchanged.
  }, [hash, key]);
}

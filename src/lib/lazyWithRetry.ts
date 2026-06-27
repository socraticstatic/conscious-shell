import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

// Why this file exists:
//
// App.tsx splits ~50 components into their own chunks with React.lazy(). On a
// flaky mobile connection — or for any visitor whose tab was open across a
// redeploy (the hashed chunk names change, so the old ones 404) — a single
// dynamic import() can reject. A rejected import inside <Suspense> throws
// during render. With no error boundary, that unmounts the ENTIRE app: blank
// screen, and iOS Safari's "A problem repeatedly occurred" reload loop.
//
// This helper makes the import resilient:
//   1. Retry the import a couple of times (handles transient network blips).
//   2. If it still fails and looks like a stale-deploy chunk 404, do ONE
//      hard reload to pull fresh HTML + correct chunk names — but only if we
//      haven't just reloaded (a cooldown), or we'd recreate the very loop
//      we're trying to kill.
//   3. If even that fails, rethrow so the ErrorBoundary can degrade gracefully
//      instead of taking the whole page down.

const RELOAD_KEY = 'cs:chunk-reload-at';
// After a recovery reload, suppress further reloads for this long. If a chunk
// is still failing inside this window the deploy is genuinely broken (or the
// network is down), so we fall through to the ErrorBoundary instead of looping.
// Outside the window, a fresh failure is treated as a new episode and gets its
// own single reload attempt.
const RELOAD_COOLDOWN_MS = 30_000;

export function isChunkLoadError(err: unknown): boolean {
  const msg =
    err instanceof Error ? `${err.name}: ${err.message}` : String(err ?? '');
  return /dynamically imported module|importing a module script failed|chunkloaderror|failed to fetch|error loading|module script failed/i.test(
    msg,
  );
}

function recentlyReloaded(): boolean {
  try {
    const at = Number(sessionStorage.getItem(RELOAD_KEY));
    return Number.isFinite(at) && at > 0 && Date.now() - at < RELOAD_COOLDOWN_MS;
  } catch {
    // Storage blocked: assume we already reloaded so we never loop.
    return true;
  }
}

function markReloaded(): void {
  try {
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    /* storage blocked — the recentlyReloaded() guard already returns true */
  }
}

// Mirrors React.lazy's own signature (ComponentType<any>) so prop types on the
// wrapped components are preserved through inference.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await factory();
    } catch (firstError) {
      // Transient? Give the network two more chances with a short backoff.
      for (let attempt = 1; attempt <= 2; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
        try {
          return await factory();
        } catch {
          /* keep retrying */
        }
      }

      // Still failing. If the chunk is genuinely missing (stale deploy), a
      // fresh page load fixes it — but only if we haven't reloaded recently,
      // or we'd recreate the crash loop.
      if (isChunkLoadError(firstError) && typeof window !== 'undefined' && !recentlyReloaded()) {
        markReloaded();
        window.location.reload();
        // Hang until the reload takes over so React never renders a
        // half-broken state in the meantime.
        return new Promise<{ default: T }>(() => {});
      }

      // Out of options: let the nearest ErrorBoundary handle it.
      throw firstError;
    }
  });
}

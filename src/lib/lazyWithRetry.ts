import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { saveRecoveryScroll } from './recoveryScroll';

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
//   2. For critical chunks: if it still fails and looks like a stale-deploy
//      chunk 404, schedule a hard reload to pull fresh HTML + correct chunk
//      names (but only when the tab hides, so the reader never watches the
//      page restart). If we reloaded recently, skip to avoid looping.
//   3. For ambient (non-critical) chunks: fail soft - let the ErrorBoundary
//      show an inline tap-to-reload fallback in the section's place.
//   4. If even retries fail, rethrow so the ErrorBoundary can degrade
//      gracefully instead of taking the whole page down.

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

// Mirrors React.lazy's own signature (ComponentType<any>) so prop types on the
// wrapped components are preserved through inference.
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

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

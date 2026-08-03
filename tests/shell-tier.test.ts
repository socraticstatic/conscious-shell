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

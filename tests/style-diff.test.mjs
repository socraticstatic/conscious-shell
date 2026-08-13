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

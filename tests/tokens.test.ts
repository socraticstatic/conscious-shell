import { describe, it, expect } from 'vitest';
import { TOKENS, HEX_TO_ROLE, COLLAPSED_HEX, CODEMOD_MAP, RGBA_TO_ROLE, channelsToHex } from '../src/lib/tokens';

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

  it('derives RGBA_TO_ROLE as comma-joined decimal channels from HEX_TO_ROLE', () => {
    for (const [hex, role] of Object.entries(HEX_TO_ROLE)) {
      const rgba = [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
      ].join(',');
      expect(RGBA_TO_ROLE[rgba], `${hex} -> ${rgba} must be in RGBA_TO_ROLE`).toBe(role);
    }
  });
});

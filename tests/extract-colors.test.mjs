import { describe, it, expect } from 'vitest';
import { extractColors } from '../scripts/lib/extract-colors.mjs';

describe('extractColors', () => {
  it('finds a plain tailwind arbitrary colour class', () => {
    const hits = extractColors('<span className="text-[#e040fb]" />');
    expect(hits).toEqual([
      { kind: 'tw-class', value: '#e040fb', alpha: null, line: 1, column: 21 },
    ]);
  });

  it('captures the opacity modifier separately', () => {
    const hits = extractColors('border-[#e040fb]/60');
    expect(hits[0].kind).toBe('tw-class-alpha');
    expect(hits[0].value).toBe('#e040fb');
    expect(hits[0].alpha).toBe('60');
  });

  it('finds hex inside a ternary string literal, not just className', () => {
    const src = "const c = d.redacted ? 'text-[#ff006e]' : 'text-[#6b6660]';";
    expect(extractColors(src).map((h) => h.value)).toEqual(['#ff006e', '#6b6660']);
  });

  it('finds a bare hex in an inline style', () => {
    const hits = extractColors("style={{ color: '#00d4ff' }}");
    expect(hits[0].kind).toBe('hex');
    expect(hits[0].value).toBe('#00d4ff');
  });

  it('finds rgba literals and records the channels', () => {
    const hits = extractColors('box-shadow: 0 0 8px rgba(224, 64, 251, 0.6);');
    expect(hits[0].kind).toBe('rgba');
    expect(hits[0].value).toBe('224,64,251');
    expect(hits[0].alpha).toBe('0.6');
  });

  it('lowercases hex so #E040FB and #e040fb are one entry', () => {
    expect(extractColors('text-[#E040FB]')[0].value).toBe('#e040fb');
  });

  it('reports correct line numbers across multiple lines', () => {
    const hits = extractColors('line one\ntext-[#e040fb]');
    expect(hits[0].line).toBe(2);
  });

  it('returns an empty array when there is no colour', () => {
    expect(extractColors('const answer = 42;')).toEqual([]);
  });
});

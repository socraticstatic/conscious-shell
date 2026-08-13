#!/usr/bin/env node
/**
 * Phase A of the token migration. Reads every source file under src/,
 * groups colour literals by value, and writes docs/tokens/audit.json.
 *
 * This script changes nothing. Its output is the input to a human decision:
 * which of these values are real roles, and which are copy-paste accidents.
 * See docs/superpowers/specs/2026-07-26-token-layer-design.md.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { extractColors } from './lib/extract-colors.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const OUT_DIR = join(ROOT, 'docs', 'tokens');
const EXTS = ['.ts', '.tsx', '.css'];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return EXTS.some((e) => full.endsWith(e)) ? [full] : [];
  });
}

const byValue = new Map();

for (const file of walk(SRC)) {
  const rel = relative(ROOT, file);
  const source = readFileSync(file, 'utf8');
  for (const hit of extractColors(source)) {
    const key = `${hit.kind === 'rgba' ? 'rgba' : 'hex'}:${hit.value}`;
    if (!byValue.has(key)) {
      byValue.set(key, { value: hit.value, kind: hit.kind, count: 0, kinds: {}, samples: [] });
    }
    const entry = byValue.get(key);
    entry.count += 1;
    entry.kinds[hit.kind] = (entry.kinds[hit.kind] ?? 0) + 1;
    if (entry.samples.length < 3) {
      entry.samples.push(`${rel}:${hit.line}:${hit.column}`);
    }
  }
}

const entries = [...byValue.values()].sort((a, b) => b.count - a.count);
const total = entries.reduce((n, e) => n + e.count, 0);

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(
  join(OUT_DIR, 'audit.json'),
  JSON.stringify({ total, distinct: entries.length, entries }, null, 2) + '\n',
);

console.log(`${total} colour literals, ${entries.length} distinct values`);
console.log('wrote docs/tokens/audit.json');
for (const e of entries.slice(0, 20)) {
  console.log(`  ${String(e.count).padStart(4)}  ${e.value}  ${JSON.stringify(e.kinds)}`);
}

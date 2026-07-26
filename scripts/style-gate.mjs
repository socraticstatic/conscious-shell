#!/usr/bin/env node
/**
 * Compares a freshly captured snapshot against the committed baseline and
 * exits non-zero on any difference. Run after every phase of the token
 * migration. A clean run is the only evidence that a phase was a no-op.
 *
 * Usage: node scripts/style-gate.mjs
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { diffSnapshots } from './lib/style-diff.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE = join(ROOT, 'docs', 'tokens', 'snapshots', 'baseline.json');
const CURRENT = join(ROOT, 'docs', 'tokens', 'snapshots', 'current', 'snapshot.json');

execFileSync('node', [join(ROOT, 'scripts', 'style-snapshot.mjs'), CURRENT], {
  stdio: 'inherit',
});

const diffs = diffSnapshots(
  JSON.parse(readFileSync(BASELINE, 'utf8')),
  JSON.parse(readFileSync(CURRENT, 'utf8')),
);

if (diffs.length === 0) {
  console.log('\nstyle gate: clean. no computed-style differences.');
  process.exit(0);
}

console.error(`\nstyle gate: ${diffs.length} differences\n`);
for (const d of diffs.slice(0, 50)) {
  console.error(
    d.missing
      ? `  MISSING  ${d.scenario}  ${d.path}`
      : `  ${d.scenario}  ${d.path}\n    ${d.prop}: ${d.from}  ->  ${d.to}`,
  );
}
if (diffs.length > 50) console.error(`  …and ${diffs.length - 50} more`);
process.exit(1);

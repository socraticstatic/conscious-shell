#!/usr/bin/env node
// Applies SQL files in supabase/migrations/2026052518*.sql via the
// Supabase Management API. Reads SUPABASE_ACCESS_TOKEN from env.

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = 'dilmngykgewoysydkagu';
const PATTERN = process.argv[2] || '2026052518';

if (!TOKEN) { console.error('SUPABASE_ACCESS_TOKEN not set'); process.exit(1); }

const MIG_DIR = join(process.cwd(), 'supabase', 'migrations');
const files = readdirSync(MIG_DIR).filter(f => f.startsWith(PATTERN) && f.endsWith('.sql')).sort();
console.log('Applying:', files);

for (const f of files) {
  const sql = readFileSync(join(MIG_DIR, f), 'utf8');
  console.log(`\n→ ${f} (${(sql.length/1024).toFixed(1)} KB)`);
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`  FAIL ${res.status}: ${text.slice(0, 800)}`);
    process.exit(1);
  }
  console.log('  OK');
}

// Verify counts
const verifySql = `SELECT 'linkedin_recommendations' AS tbl, COUNT(*)::int AS rows FROM linkedin_recommendations UNION ALL SELECT 'linkedin_articles', COUNT(*)::int FROM linkedin_articles;`;
const v = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: verifySql }),
});
console.log('\nRow counts:', await v.text());

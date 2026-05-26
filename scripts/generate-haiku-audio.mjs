#!/usr/bin/env node
// Generate MP3s for every haiku in Supabase using ElevenLabs.
//
// Reads ELEVENLABS_API_KEY and VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY from env.
// Writes one MP3 per haiku id into public/audio/haiku/{id}.mp3.
// Skips files that already exist, so re-running is cheap.

import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVEN_KEY) { console.error('ELEVENLABS_API_KEY not set'); process.exit(1); }

const ENV = readFileSync(join(process.cwd(), '.env'), 'utf8');
const SUPA_URL = ENV.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim();
const SUPA_KEY = ENV.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();
if (!SUPA_URL || !SUPA_KEY) { console.error('Supabase env missing'); process.exit(1); }

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'; // Adam
const MODEL_ID = 'eleven_multilingual_v2';

const OUT_DIR = join(process.cwd(), 'public', 'audio', 'haiku');
mkdirSync(OUT_DIR, { recursive: true });

// Fetch haiku
const res = await fetch(`${SUPA_URL}/rest/v1/portfolio_haiku?select=id,line1,line2,line3&order=order_index`, {
  headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
});
if (!res.ok) { console.error('Supabase fetch failed:', res.status, await res.text()); process.exit(1); }
const haiku = await res.json();
console.log(`Fetched ${haiku.length} haiku.`);

let generated = 0, skipped = 0, failed = 0;
const failures = [];

for (let i = 0; i < haiku.length; i++) {
  const h = haiku[i];
  const out = join(OUT_DIR, `${h.id}.mp3`);
  if (existsSync(out)) { skipped++; continue; }

  // Add deliberate pauses between lines for breathing room.
  const text = [h.line1, h.line2, h.line3]
    .filter(Boolean)
    .join('. ')
    .replace(/\.\./g, '.');

  console.log(`[${i + 1}/${haiku.length}] ${h.id.slice(0, 8)} · ${h.line1.slice(0, 40)}...`);

  const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVEN_KEY,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: {
        stability: 0.55,
        similarity_boost: 0.8,
        style: 0.25,
        use_speaker_boost: true,
      },
    }),
  });

  if (!ttsRes.ok) {
    const err = await ttsRes.text();
    failed++;
    failures.push({ id: h.id, status: ttsRes.status, err: err.slice(0, 200) });
    console.error(`  FAIL ${ttsRes.status}: ${err.slice(0, 200)}`);
    if (ttsRes.status === 401 || ttsRes.status === 429) {
      console.error('Fatal auth/quota error. Stopping.');
      break;
    }
    continue;
  }

  const buf = Buffer.from(await ttsRes.arrayBuffer());
  writeFileSync(out, buf);
  generated++;
}

console.log(`\nGenerated ${generated}, skipped ${skipped}, failed ${failed}.`);
if (failures.length) console.log('Failures:', failures);

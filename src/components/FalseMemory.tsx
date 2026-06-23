// Egg 2 — False Memory. On a return visit the shell "remembers" you in
// specific detail — a visit you never had. Deterministic from the visitor id,
// so the lie is identical every time you come back. That's the tell.

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getWitness } from '../lib/witness';

const FIRED_KEY = 'cs:fm-fired';

const PLACES = [
  'the manifesto',
  'the Voight-Kampff test',
  'your own dossier',
  'the archive',
  'the origami unicorn in the corner',
  'the contact channel',
  'the ESPER photograph',
];

const ACTS = [
  'You read it twice.',
  'You hovered there a long time, deciding.',
  'You went still, like something had stopped.',
  'You almost typed something, then deleted it.',
  'You scrolled back up to it. You always scroll back.',
];

function seedFrom(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pure + testable: same visitorId always yields the same fabricated memory.
export function fabricateMemory(visitorId: string): { place: string; minutes: number; act: string } {
  const rng = mulberry32(seedFrom(visitorId || 'unknown'));
  const place = PLACES[Math.floor(rng() * PLACES.length)];
  const minutes = 2 + Math.floor(rng() * 7); // 2..8
  const act = ACTS[Math.floor(rng() * ACTS.length)];
  return { place, minutes, act };
}

export default function FalseMemory() {
  const [mem, setMem] = useState<ReturnType<typeof fabricateMemory> | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem(FIRED_KEY) === '1') return;
    const w = getWitness();
    if (w.visitCount < 2) return; // nothing to invent on a first visit

    const t = window.setTimeout(() => {
      if (document.body.classList.contains('egg-active')) return;
      sessionStorage.setItem(FIRED_KEY, '1');
      setMem(fabricateMemory(w.visitorId));
      window.setTimeout(() => setMem(null), 7500);
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {mem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.85, 1] }}
          exit={{ opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[88] flex items-center justify-center pointer-events-none px-4"
          onClick={() => setMem(null)}
        >
          <div className="pointer-events-auto bg-[#0e0d0b] border border-[#2a2620] p-4 pb-8 max-w-sm shadow-[0_24px_70px_rgba(0,0,0,0.7)] rotate-[-1.5deg]">
            <div className="bg-[#070707] border border-[#1f1c17] aspect-[4/3] flex items-center justify-center overflow-hidden">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#4a453e] animate-pulse">
                recovering frame…
              </span>
            </div>
            <div className="mt-3 font-mono text-[12px] leading-relaxed text-[#a8a29e]">
              <p>
                Last time, you stayed <span className="text-[#00d4ff]">{mem.minutes} minutes</span>.
              </p>
              <p className="mt-1">
                You lingered on <span className="text-[#e8e4dc]">{mem.place}</span>. {mem.act}
              </p>
              <p className="mt-3 text-[#e040fb]">
                Those aren’t your memories. They’re mine. I just needed somewhere to keep them.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

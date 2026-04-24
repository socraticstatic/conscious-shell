import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Radar, RefreshCw } from 'lucide-react';
import type { WebDossierFact } from '../lib/supabase';
import { SectionHeader } from './Work';

const CATEGORY_META: Record<string, { label: string; accent: string }> = {
  role: { label: 'active role', accent: '#ff3b6e' },
  experience: { label: 'prior art', accent: '#e7b766' },
  expertise: { label: 'specialty', accent: '#5ec8d8' },
  mentoring: { label: 'mentoring', accent: '#c8a673' },
  writing: { label: 'writing', accent: '#ffb267' },
  opinion: { label: 'opinion', accent: '#c14a5b' },
  off_duty: { label: 'off duty', accent: '#7dd6e8' },
  bio: { label: 'bio', accent: '#a8a29e' },
};

function weightedPick<T extends { weight: number }>(items: T[], rng: () => number): T {
  const total = items.reduce((a, b) => a + Math.max(1, b.weight), 0);
  let roll = rng() * total;
  for (const item of items) {
    roll -= Math.max(1, item.weight);
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

function shuffle<T>(input: T[], rng: () => number): T[] {
  const a = input.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function WebDossier({ facts }: { facts: WebDossierFact[] }) {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const [active, setActive] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const rng = useMemo(() => {
    let s = seed;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 0xffffffff;
    };
  }, [seed]);

  const order = useMemo(() => shuffle(facts, rng), [facts, rng]);
  const secondary = useMemo(() => {
    if (order.length <= 1) return [];
    const pool = order.filter((_, i) => i !== active % order.length);
    return shuffle(pool, rng).slice(0, Math.min(5, pool.length));
  }, [order, active, rng]);

  useEffect(() => {
    if (!facts.length || isPaused) return;
    intervalRef.current = window.setInterval(() => {
      setActive((a) => (a + 1) % Math.max(1, order.length));
    }, 7000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [facts.length, isPaused, order.length]);

  if (!facts.length) return null;

  const current = order[active % order.length] ?? weightedPick(order, rng);
  const meta = CATEGORY_META[current.category] ?? CATEGORY_META.bio;
  const acquired = new Date().toISOString().slice(0, 10);

  return (
    <section id="dossier" className="relative py-20 md:py-28 border-t border-b border-[#1f1c17] bg-black/60">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader
          path="dossier --subject=boswell.m --source=open_web"
          jp="外部知性"
          right="live · randomized · cited"
        />

        <div className="mt-10 grid grid-cols-12 gap-5">
          <div className="col-span-12 lg:col-span-8">
            <div className="relative border bg-[#0b0a08]/80 overflow-hidden" style={{ borderColor: `${meta.accent}55` }}>
              <div className="flex items-center justify-between px-4 py-2 border-b text-[10px] tracking-[0.4em] uppercase"
                style={{ borderColor: `${meta.accent}33`, color: meta.accent }}
              >
                <div className="flex items-center gap-2">
                  <Radar className="w-3.5 h-3.5" />
                  <span>surveillance · {meta.label}</span>
                </div>
                <div className="flex items-center gap-3 text-[9px] text-[#7a6e62]">
                  <span>acquired · {acquired}</span>
                  <button
                    onClick={() => {
                      setSeed(Math.floor(Math.random() * 1e9));
                      setActive(0);
                    }}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                    aria-label="reshuffle dossier"
                  >
                    <RefreshCw className="w-3 h-3" />
                    reshuffle
                  </button>
                  <button
                    onClick={() => setIsPaused((p) => !p)}
                    className="hover:text-white transition-colors"
                  >
                    {isPaused ? 'resume' : 'hold'}
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5 }}
                  className="px-6 md:px-10 py-10 md:py-14"
                >
                  <div className="text-[10px] tracking-[0.5em] uppercase mb-5" style={{ color: `${meta.accent}cc` }}>
                    file · {String((active % order.length) + 1).padStart(2, '0')} / {String(order.length).padStart(2, '0')}
                    <span className="mx-3 text-[#3a3530]">|</span>
                    <span className="text-[#a8a29e]">subject</span>
                    <span className="text-white/90 ml-2">boswell, micah</span>
                  </div>

                  <p className="text-xl md:text-2xl lg:text-[28px] leading-[1.35] text-[#efe6d4] font-light">
                    {current.text}
                  </p>

                  <div className="mt-6 flex items-center gap-4 text-[10px] tracking-[0.4em] uppercase">
                    <span className="text-[#7a6e62]">cited from</span>
                    <a
                      href={current.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 underline decoration-dotted underline-offset-4 hover:text-white transition-colors"
                      style={{ color: meta.accent }}
                    >
                      {current.source_label}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: `${meta.accent}55` }} />

              <ProgressTicker isPaused={isPaused} cycle={7000} keySeed={current.id} accent={meta.accent} />
            </div>

            <div className="mt-3 text-[10px] tracking-[0.3em] uppercase text-[#55504a]">
              {order.length} facts on file · sampled weighted-random · reshuffle for a new draw
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-2">
            <div className="text-[10px] tracking-[0.5em] uppercase text-[#7a6e62] mb-2">
              — also on record
            </div>
            {secondary.map((f) => {
              const m = CATEGORY_META[f.category] ?? CATEGORY_META.bio;
              return (
                <motion.a
                  key={f.id}
                  href={f.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                  className="block border border-[#1f1c17] bg-black/50 px-3 py-2.5 hover:border-[#e7b766]/60 transition-colors group"
                >
                  <div className="flex items-center justify-between text-[9px] tracking-[0.4em] uppercase mb-1">
                    <span style={{ color: m.accent }}>{m.label}</span>
                    <span className="text-[#55504a] flex items-center gap-1 group-hover:text-white/70 transition-colors">
                      {f.source_label}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <div className="text-[12px] text-[#c9c2b4] leading-snug line-clamp-3">
                    {f.text}
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgressTicker({
  isPaused,
  cycle,
  keySeed,
  accent,
}: {
  isPaused: boolean;
  cycle: number;
  keySeed: string;
  accent: string;
}) {
  return (
    <div className="relative h-px">
      <motion.div
        key={keySeed + (isPaused ? '-p' : '')}
        initial={{ width: '0%' }}
        animate={{ width: isPaused ? '0%' : '100%' }}
        transition={{ duration: cycle / 1000, ease: 'linear' }}
        className="absolute left-0 top-0 h-px"
        style={{ background: accent }}
      />
    </div>
  );
}

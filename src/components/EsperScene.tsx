import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ScanSearch, RotateCcw } from 'lucide-react';
import type { EsperHotspot } from '../lib/supabase';

type Phase = 'idle' | 'track' | 'enhance' | 'resolve';

export default function EsperScene({ hotspots }: { hotspots: EsperHotspot[] }) {
  const [active, setActive] = useState<EsperHotspot | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [typed, setTyped] = useState<string[]>([]);
  const timers = useRef<number[]>([]);

  const photo = hotspots[0]?.photo_url ?? '';
  const caption = hotspots[0]?.photo_caption ?? '';
  const credit = hotspots[0]?.photo_credit ?? '';

  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => () => clearAll(), []);

  const reset = () => {
    clearAll();
    setActive(null);
    setPhase('idle');
    setTyped([]);
  };

  const run = (h: EsperHotspot) => {
    clearAll();
    setActive(h);
    setPhase('track');
    setTyped([]);

    const lines = [
      `> load bradbury.frame.${String(h.order_index).padStart(3, '0')}`,
      `> ${h.track_cmd}`,
      `> ${h.enhance_cmd}`,
      `> analyse · descreen · unmatte`,
      `> isolate ...`,
      `> reveal.`,
    ];

    lines.forEach((l, i) => {
      const id = window.setTimeout(() => {
        setTyped((t) => [...t, l]);
        if (i === 1) setPhase('enhance');
        if (i === lines.length - 1) setPhase('resolve');
      }, 280 * (i + 1));
      timers.current.push(id);
    });
  };

  const zoomStyle = useMemo(() => {
    if (!active) return { transform: 'scale(1) translate(0%,0%)' };
    const cx = active.x + active.w / 2;
    const cy = active.y + active.h / 2;
    const scale = phase === 'idle' ? 1 : phase === 'track' ? 1.35 : 2.2;
    const tx = (0.5 - cx) * 100;
    const ty = (0.5 - cy) * 100;
    return {
      transform: `translate(${tx}%, ${ty}%) scale(${scale})`,
      transformOrigin: '50% 50%',
    };
  }, [active, phase]);

  if (!hotspots.length) return null;

  return (
    <section id="esper" className="relative py-24 px-6 md:px-10 bg-[#05060a]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <div className="text-[10px] tracking-[0.5em] uppercase text-[#5ec8d8]/80 mb-3">
              — esper machine · photo enhancement unit
            </div>
            <h2 className="text-4xl md:text-5xl font-mono font-light tracking-tight">
              enhance. enhance. <span className="text-[#ff7a5c]">enhance.</span>
            </h2>
            <p className="mt-3 text-[#8a837a] text-sm max-w-xl leading-relaxed">
              an interactive recreation of the esper session. pick a target on the frame. the machine will track, enhance, and reveal what the photograph has been hiding.
            </p>
          </div>

          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[#a8a29e] hover:text-[#5ec8d8] border border-[#1f1c17] hover:border-[#5ec8d8]/50 px-3 py-2 transition-colors"
            aria-label="reset esper"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            reset frame
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
          <div className="relative border border-[#1f1c17] bg-black overflow-hidden aspect-[16/10] select-none">
            <motion.div
              className="absolute inset-0"
              animate={zoomStyle}
              transition={{ duration: phase === 'resolve' ? 1.4 : 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <img
                src={photo}
                alt="esper frame"
                className="w-full h-full object-cover"
                draggable={false}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.35) 2px 3px)',
                  mixBlendMode: 'multiply',
                  opacity: 0.55,
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.7) 100%)',
                }}
              />

              {hotspots.map((h) => {
                const isActive = active?.id === h.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => run(h)}
                    className={`absolute border transition-all duration-300 ${
                      isActive
                        ? 'border-[#ff7a5c]'
                        : 'border-[#5ec8d8]/60 hover:border-[#5ec8d8]'
                    }`}
                    style={{
                      left: `${h.x * 100}%`,
                      top: `${h.y * 100}%`,
                      width: `${h.w * 100}%`,
                      height: `${h.h * 100}%`,
                      boxShadow: isActive ? '0 0 20px rgba(255,122,92,0.6)' : undefined,
                    }}
                    aria-label={`enhance region ${h.order_index}`}
                  >
                    <span
                      className={`absolute -top-6 left-0 text-[9px] tracking-[0.3em] uppercase whitespace-nowrap ${
                        isActive ? 'text-[#ff7a5c]' : 'text-[#5ec8d8]'
                      }`}
                    >
                      node·{String(h.order_index).padStart(2, '0')}
                    </span>
                    {isActive && (
                      <>
                        <span className="absolute -left-[3px] -top-[3px] w-2 h-2 bg-[#ff7a5c]" />
                        <span className="absolute -right-[3px] -top-[3px] w-2 h-2 bg-[#ff7a5c]" />
                        <span className="absolute -left-[3px] -bottom-[3px] w-2 h-2 bg-[#ff7a5c]" />
                        <span className="absolute -right-[3px] -bottom-[3px] w-2 h-2 bg-[#ff7a5c]" />
                      </>
                    )}
                  </button>
                );
              })}
            </motion.div>

            <div className="absolute left-3 top-3 right-3 flex items-center justify-between pointer-events-none">
              <div className="text-[9px] tracking-[0.4em] uppercase text-[#5ec8d8]/80 bg-black/50 px-2 py-1 backdrop-blur-sm">
                {caption}
              </div>
              <div className="text-[9px] tracking-[0.4em] uppercase text-[#5ec8d8]/80 bg-black/50 px-2 py-1 tabular-nums backdrop-blur-sm">
                esper · v9 · {phase}
              </div>
            </div>

            {credit && (
              <div className="absolute left-3 bottom-3 right-3 flex items-center justify-between pointer-events-none">
                <a
                  href="https://unsplash.com/@micahboswell"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto text-[9px] tracking-[0.4em] uppercase text-[#5ec8d8]/70 hover:text-[#5ec8d8] bg-black/50 px-2 py-1 backdrop-blur-sm transition-colors"
                >
                  {credit}
                </a>
              </div>
            )}

            <AnimatePresence>
              {phase !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(94,200,216,0.04), transparent 15%, transparent 85%, rgba(255,122,92,0.06))',
                  }}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="border border-[#1f1c17] bg-[#0a0a0d] p-5 flex flex-col min-h-[360px]">
            <div className="flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase text-[#5ec8d8] mb-4">
              <ScanSearch className="w-3.5 h-3.5" />
              operator terminal
            </div>

            <div className="flex-1 font-mono text-[11.5px] leading-relaxed text-[#c9b8a6] space-y-0.5 min-h-[180px]">
              {typed.map((l, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ color: i === typed.length - 1 && phase !== 'resolve' ? '#5ec8d8' : '#c9b8a6' }}
                >
                  {l}
                </motion.div>
              ))}
              {!typed.length && (
                <div className="text-[#4a453e]">awaiting selection. click a node on the frame.</div>
              )}
              {phase !== 'idle' && phase !== 'resolve' && (
                <span className="inline-block w-2 h-3 align-middle bg-[#5ec8d8] animate-pulse" />
              )}
            </div>

            <AnimatePresence mode="wait">
              {phase === 'resolve' && active && (
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mt-5 border-t border-[#1f1c17] pt-4"
                >
                  <div className="text-[9px] tracking-[0.4em] uppercase text-[#ff7a5c] mb-2">
                    // reveal · node-{String(active.order_index).padStart(2, '0')}
                  </div>
                  <p className="font-serif text-base md:text-lg text-[#e8e4dc] leading-snug">
                    {active.reveal}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-5 pt-4 border-t border-[#1f1c17] flex flex-wrap gap-2">
              {hotspots.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => run(h)}
                  className={`text-[10px] tracking-[0.3em] uppercase border px-2.5 py-1.5 transition-colors ${
                    active?.id === h.id
                      ? 'border-[#ff7a5c] text-[#ff7a5c]'
                      : 'border-[#1f1c17] text-[#a8a29e] hover:border-[#5ec8d8]/50 hover:text-[#5ec8d8]'
                  }`}
                >
                  node·{String(h.order_index).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

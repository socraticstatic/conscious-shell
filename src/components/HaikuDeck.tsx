import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { SectionHeader } from './Work';
import ScrambleText from './ScrambleText';
import type { Haiku } from '../lib/supabase';

const INTERVAL_MS = 7000;

export default function HaikuDeck({ haiku }: { haiku: Haiku[] }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const startedAt = useRef<number>(performance.now());
  const [progress, setProgress] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  const current = useMemo(() => haiku[idx], [haiku, idx]);

  useEffect(() => {
    if (!haiku.length) return;
    startedAt.current = performance.now();
    setProgress(0);

    let raf = 0;
    const tick = (now: number) => {
      if (paused) {
        startedAt.current = now - progress * INTERVAL_MS;
        raf = requestAnimationFrame(tick);
        return;
      }
      const p = Math.min(1, (now - startedAt.current) / INTERVAL_MS);
      setProgress(p);
      if (p >= 1) {
        setIdx((i) => (i + 1) % haiku.length);
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [idx, haiku.length, paused]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = () => {
    if (!('speechSynthesis' in window) || !current) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    if (speaking) {
      setSpeaking(false);
      return;
    }
    const text = [current.line1, current.line2, current.line3].join('. ');
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.82;
    u.pitch = 0.9;
    u.volume = 0.95;
    const voices = synth.getVoices();
    const preferred =
      voices.find((v) => /en-US/i.test(v.lang) && /male|neutral|david|daniel|fred/i.test(v.name)) ??
      voices.find((v) => /en/i.test(v.lang));
    if (preferred) u.voice = preferred;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    setPaused(true);
    synth.speak(u);
  };

  if (!haiku.length || !current) return null;

  const count = haiku.length;

  return (
    <section
      id="haiku"
      className="relative py-20 md:py-28 border-b border-[#1f1c17] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 30%, #e7b766 0%, transparent 40%), radial-gradient(circle at 70% 70%, #8b7ea3 0%, transparent 45%)',
          }}
        />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 relative">
        <SectionHeader
          path="cat /etc/haiku | shuf | head -1"
          jp="俳句"
          right={`${String(idx + 1).padStart(2, '0')}/${String(count).padStart(2, '0')} · ${paused ? 'paused' : 'auto'}`}
        />

        <div className="mt-10 grid grid-cols-12 gap-6 items-start">
          <div className="col-span-12 md:col-span-9">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={current.id}
                initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
                transition={{ duration: 0.55, ease: [0.22, 0.9, 0.3, 1] }}
                className="relative"
              >
                <div className="absolute -left-6 md:-left-10 top-2 text-[#e7b766]/30 text-5xl md:text-7xl leading-none select-none">
                  “
                </div>
                <p className="text-2xl md:text-5xl leading-tight md:leading-[1.15] text-[#e8e4dc] tracking-tight">
                  <ScrambleText text={current.line1} trigger={current.id} durationMs={650} hoverRescramble={false} />
                </p>
                <p className="mt-2 md:mt-3 text-2xl md:text-5xl leading-tight md:leading-[1.15] text-[#e7b766] tracking-tight">
                  <ScrambleText text={current.line2} trigger={current.id} durationMs={800} hoverRescramble={false} />
                </p>
                <p className="mt-2 md:mt-3 text-2xl md:text-5xl leading-tight md:leading-[1.15] text-[#a8a29e] tracking-tight">
                  <ScrambleText text={current.line3} trigger={current.id} durationMs={950} hoverRescramble={false} />
                </p>
                <div className="mt-8 flex items-center gap-4 text-[11px] uppercase tracking-[0.25em] text-[#6b6660] flex-wrap">
                  <span>— {current.source}</span>
                  <span className="text-[#4a453e]">/</span>
                  <span><span className="text-[#4a453e]">mood:</span> {current.mood || 'n/a'}</span>
                  <button
                    type="button"
                    onClick={speak}
                    className={`inline-flex items-center gap-2 px-2.5 py-1 border text-[10px] tracking-[0.2em] transition-colors ${
                      speaking
                        ? 'border-[#e7b766] text-[#e7b766]'
                        : 'border-[#1f1c17] text-[#6b6660] hover:border-[#e7b766]/50 hover:text-[#e7b766]'
                    }`}
                    aria-label={speaking ? 'stop reading' : 'read haiku aloud'}
                  >
                    {speaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    {speaking ? 'silence' : 'read aloud'}
                  </button>
                </div>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <aside className="col-span-12 md:col-span-3">
            <div className="text-[11px] uppercase tracking-widest text-[#6b6660] mb-3">
              # deck
            </div>
            <ul className="border-t border-[#1f1c17]">
              {haiku.map((h, i) => (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => setIdx(i)}
                    className={`w-full text-left py-3 px-1 border-b border-dashed border-[#1f1c17] flex items-baseline gap-3 text-sm transition-colors ${
                      i === idx
                        ? 'text-[#e7b766]'
                        : 'text-[#6b6660] hover:text-[#e8e4dc]'
                    }`}
                  >
                    <span className="tabular-nums text-[10px] text-[#4a453e]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="truncate">{h.mood || h.line1}</span>
                    {i === idx && (
                      <span className="ml-auto inline-block w-1.5 h-1.5 rounded-full bg-[#e7b766] animate-pulse" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <div className="mt-10 h-[2px] bg-[#1f1c17] relative overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-[#e7b766]"
            style={{ width: `${Math.round(progress * 100)}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>
        <div className="mt-2 text-[10px] text-[#4a453e] flex justify-between tabular-nums items-center gap-4">
          <span>hover to pause · click a row to jump</span>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('memorial:open'))}
            className="text-[#6b6660] hover:text-[#ff7a5c] transition-colors tracking-[0.3em] uppercase"
            aria-label="play memorial sequence"
          >
            play memorial
          </button>
          <span>{String(Math.round(progress * 100)).padStart(3, ' ')}%</span>
        </div>
      </div>
    </section>
  );
}

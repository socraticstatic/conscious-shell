// Egg 3 — Memory Decay (showpiece). Arm with `forget`. Sections you scroll
// past rot behind you: scroll back up and they've been overwritten, lost like
// tears in rain. Visual-only — overlays sit on top of the real content, which
// is never mutated. Disarm with `remember` or Esc; everything restores clean.

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTypedWord } from '../lib/eggTriggers';

const GLYPHS = 'アカサタナハマヤラ01//<>█▓▒░#%&@*';

function scramble(len: number, seed: number): string {
  let s = '';
  let a = seed;
  for (let i = 0; i < len; i++) {
    a = (a * 1103515245 + 12345) & 0x7fffffff;
    s += GLYPHS[a % GLYPHS.length];
  }
  return s;
}

type Rect = { id: string; top: number; left: number; width: number; height: number };

export default function MemoryDecay() {
  const [armed, setArmed] = useState(false);
  const [decayed, setDecayed] = useState<string[]>([]);
  const [rects, setRects] = useState<Rect[]>([]);
  const passed = useRef<Set<string>>(new Set());
  const reduced = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const disarm = useCallback(() => {
    setArmed(false);
    setDecayed([]);
    setRects([]);
    passed.current = new Set();
  }, []);

  useTypedWord('forget', () => setArmed(true));
  useTypedWord('remember', disarm);

  useEffect(() => {
    if (!armed) return;

    const recompute = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>('section[id]'));
      // mark sections whose bottom has passed above the viewport top
      sections.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.bottom < 0) passed.current.add(s.id);
      });
      const order = sections.map((s) => s.id).filter((id) => passed.current.has(id));
      setDecayed(order);

      // only render overlays for decayed sections currently on screen
      const vh = window.innerHeight || document.documentElement.clientHeight || 0;
      const visible: Rect[] = [];
      for (const s of sections) {
        if (!passed.current.has(s.id)) continue;
        const r = s.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) {
          visible.push({ id: s.id, top: r.top, left: r.left, width: r.width, height: r.height });
        }
      }
      setRects(visible);
    };
    // Time-throttled, not rAF-gated: rAF is paused in background tabs, which
    // would freeze the decay. A timestamp throttle keeps it running anywhere.
    let last = 0;
    let trailing: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      const now = Date.now();
      if (now - last >= 80) {
        last = now;
        recompute();
      } else if (!trailing) {
        trailing = setTimeout(() => {
          trailing = undefined;
          last = Date.now();
          recompute();
        }, 80);
      }
    };

    recompute();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') disarm();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      if (trailing) clearTimeout(trailing);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('keydown', onKey);
    };
  }, [armed, disarm]);

  if (!armed) return null;

  const total = document.querySelectorAll('section[id]').length || 1;
  const integrity = Math.max(0, Math.round(100 - (decayed.length / total) * 100));

  return (
    <>
      {/* corruption overlays over decayed sections, positioned in viewport space */}
      {rects.map((r, i) => (
        <div
          key={r.id}
          aria-hidden
          className="fixed z-[40] pointer-events-none overflow-hidden"
          style={{ top: r.top, left: r.left, width: r.width, height: r.height }}
        >
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(7,7,10,0.86)' }}
          />
          {!reduced && (
            <div
              className="absolute inset-0 font-mono text-[#e040fb]/30 text-[11px] leading-[1.15] break-all select-none"
              style={{ animation: 'none' }}
            >
              {scramble(Math.min(1400, Math.floor((r.width * r.height) / 90)), i * 7919 + r.id.length)}
            </div>
          )}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-mono text-[10px] tracking-[0.3em] uppercase text-[#ff006e]/70">
            // memory corrupted — {r.id}
          </div>
        </div>
      ))}

      {/* integrity readout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-4 right-4 z-[50] font-mono text-[11px] pointer-events-none"
      >
        <span className={integrity < 40 ? 'text-[#ff006e]' : 'text-[#6b6660]'}>
          {`// memory integrity: ${integrity}%`}
        </span>
        <div className="text-[10px] text-[#4a453e] mt-0.5">type “remember” to restore</div>
      </motion.div>

      <AnimatePresence>
        {integrity === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed bottom-12 right-4 z-[50] font-mono text-[10px] text-[#ff006e]/80 pointer-events-none"
          >
            …lost, like tears in rain.
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

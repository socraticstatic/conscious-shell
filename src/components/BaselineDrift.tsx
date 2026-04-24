import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Eye, ShieldAlert, X } from 'lucide-react';

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

const FLAGS = [
  'tortoise on its back in the sun',
  'mother describe: most pleasant memory',
  'yellow jacket on your wrist',
  'empty restaurant, waiter alone',
  'child with a butterfly in a jar',
  'you are watching television alone',
  'describe in single words only',
  'the owl was artificial, wasn\'t it?',
];

export default function BaselineDrift() {
  const [override, setOverride] = useState(false);
  const [drift, setDrift] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [idleSec, setIdleSec] = useState(0);
  const [scrollPct, setScrollPct] = useState(0);
  const [flag, setFlag] = useState<string | null>(null);
  const lastMove = useRef<{ t: number; x: number; y: number }>({ t: performance.now(), x: 0, y: 0 });
  const lastActivity = useRef(performance.now());
  const konamiBuf = useRef<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      konamiBuf.current = [...konamiBuf.current, k].slice(-KONAMI.length);
      if (konamiBuf.current.join('|') === KONAMI.join('|')) {
        setOverride((v) => !v);
        window.dispatchEvent(new CustomEvent('override:toggle')); // connects OverrideMode
        konamiBuf.current = [];
      }
      if (e.key === 'Escape') setOverride(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('override-mode', override);
    return () => document.body.classList.remove('override-mode');
  }, [override]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      const { t, x, y } = lastMove.current;
      const dt = Math.max(1, now - t);
      const dx = e.clientX - x;
      const dy = e.clientY - y;
      const v = Math.sqrt(dx * dx + dy * dy) / dt;
      setVelocity((prev) => prev * 0.78 + v * 0.22);
      lastMove.current = { t: now, x: e.clientX, y: e.clientY };
      lastActivity.current = now;
    };
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setScrollPct(max > 0 ? h.scrollTop / max : 0);
      lastActivity.current = performance.now();
    };
    const onAny = () => { lastActivity.current = performance.now(); };
    onScroll();
    window.addEventListener('mousemove', onMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onAny);
    window.addEventListener('click', onAny);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onAny);
      window.removeEventListener('click', onAny);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const idle = (performance.now() - lastActivity.current) / 1000;
      setIdleSec(idle);

      const vNorm = Math.min(1, velocity / 2.5);
      const sNorm = scrollPct;
      const iNorm = Math.min(1, idle / 30);
      const base = 0.35 + vNorm * 0.25 + sNorm * 0.15 + iNorm * 0.35;
      const noise = (Math.sin(performance.now() / 700) + 1) / 2;
      const next = Math.min(100, Math.max(0, base * 100 + (noise - 0.5) * 8));

      setDrift((prev) => prev * 0.7 + next * 0.3);
    }, 200);
    return () => clearInterval(id);
  }, [velocity, scrollPct]);

  useEffect(() => {
    const id = setInterval(() => {
      if (flag) return;
      if (drift > 78 && Math.random() < 0.35) {
        setFlag(FLAGS[Math.floor(Math.random() * FLAGS.length)]);
      }
    }, 6000);
    return () => clearInterval(id);
  }, [drift, flag]);

  const state = drift < 40 ? 'nominal' : drift < 70 ? 'watching' : 'flag';
  const stateColor =
    state === 'nominal' ? '#5ec8d8' : state === 'watching' ? '#e7b766' : '#ff7a5c';
  const Icon = state === 'nominal' ? Activity : state === 'watching' ? Eye : ShieldAlert;

  return (
    <>
      {override && (
        <div className="override-banner">
          ▲ override active · esc to dismiss ▲
        </div>
      )}

      <div className="pointer-events-none fixed right-3 md:right-5 top-1/2 -translate-y-1/2 z-40 select-none hidden md:flex flex-col items-end gap-3">
        <div
          className="pointer-events-auto border bg-[#0b0a08]/90 backdrop-blur-sm px-3 py-3 w-[200px]"
          style={{ borderColor: stateColor + '55' }}
          aria-label="baseline drift meter"
        >
          <div className="flex items-center gap-2 mb-2">
            <Icon className="w-3.5 h-3.5" style={{ color: stateColor }} />
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#6b6660]">
              baseline_drift
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span
              className="text-3xl tabular-nums leading-none"
              style={{ color: stateColor }}
            >
              {String(Math.round(drift)).padStart(3, '0')}
            </span>
            <span className="text-[10px] tabular-nums uppercase tracking-wider" style={{ color: stateColor }}>
              {state}
            </span>
          </div>

          <div className="mt-3 h-[3px] bg-[#1f1c17] relative overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0"
              style={{ width: `${drift}%`, background: stateColor, boxShadow: `0 0 6px ${stateColor}` }}
            />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-[9px] text-[#4a453e] tabular-nums">
            <div>
              <div className="uppercase tracking-wider">vel</div>
              <div className="text-[#a8a29e]">{velocity.toFixed(2)}</div>
            </div>
            <div>
              <div className="uppercase tracking-wider">scr</div>
              <div className="text-[#a8a29e]">{Math.round(scrollPct * 100)}%</div>
            </div>
            <div>
              <div className="uppercase tracking-wider">idl</div>
              <div className="text-[#a8a29e]">{Math.min(99, Math.round(idleSec))}s</div>
            </div>
          </div>

          <div className="mt-3 text-[9px] text-[#4a453e] leading-3">
            {override ? '# OVERRIDE engaged — empathy bypassed' : '# input: konami for override'}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {flag && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="fixed right-3 md:right-5 bottom-20 z-50 max-w-[360px] border border-[#ff7a5c]/50 bg-[#0b0a08]/95 backdrop-blur-sm p-4 pointer-events-auto"
            role="status"
          >
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-[#ff7a5c] shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-[0.25em] text-[#ff7a5c] mb-1">
                  baseline flag
                </div>
                <div className="text-[#e8e4dc] text-sm leading-snug">
                  {flag}
                </div>
                <div className="text-[10px] text-[#6b6660] mt-2">
                  # scenario logged · respond when ready
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFlag(null)}
                className="text-[#6b6660] hover:text-[#e8e4dc]"
                aria-label="dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

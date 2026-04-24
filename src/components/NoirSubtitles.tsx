import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Noir } from '../lib/supabase';

const MOOD_COLOR: Record<string, string> = {
  rain: '#5ec8d8',
  smoke: '#c9b8a6',
  neon: '#ff7a5c',
  dread: '#ff3b3b',
  wry: '#e7b766',
};

export default function NoirSubtitles({ lines }: { lines: Noir[] }) {
  const [current, setCurrent] = useState<Noir | null>(null);
  const [visible, setVisible] = useState(false);
  const idx = useRef(0);
  const order = useRef<Noir[]>([]);

  useEffect(() => {
    if (!lines.length) return;
    order.current = [...lines].sort(() => Math.random() - 0.5);
    idx.current = 0;

    let showTimer: number;
    let hideTimer: number;

    const tick = () => {
      const nextDelay = 22000 + Math.random() * 28000;
      showTimer = window.setTimeout(() => {
        if (document.hidden) { tick(); return; }
        const next = order.current[idx.current % order.current.length];
        idx.current += 1;
        setCurrent(next);
        setVisible(true);
        hideTimer = window.setTimeout(() => {
          setVisible(false);
          tick();
        }, 7200);
      }, nextDelay);
    };

    const first = window.setTimeout(() => {
      const next = order.current[0];
      idx.current = 1;
      setCurrent(next);
      setVisible(true);
      hideTimer = window.setTimeout(() => {
        setVisible(false);
        tick();
      }, 7200);
    }, 12000);

    const onTrigger = () => {
      const next = order.current[idx.current % order.current.length];
      idx.current += 1;
      setCurrent(next);
      setVisible(true);
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setVisible(false), 7200);
    };
    window.addEventListener('noir:narrate', onTrigger);

    return () => {
      window.clearTimeout(first);
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      window.removeEventListener('noir:narrate', onTrigger);
    };
  }, [lines]);

  const color = current ? MOOD_COLOR[current.mood] ?? '#e8e4dc' : '#e8e4dc';

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 right-0 z-[6] flex justify-center"
      style={{ bottom: 34 }}
    >
      <AnimatePresence>
        {visible && current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
            exit={{ opacity: 0, y: -4, filter: 'blur(4px)' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-[min(92vw,880px)] px-5 py-2.5 text-center"
            style={{
              background: 'linear-gradient(to bottom, rgba(8,6,4,0) 0%, rgba(8,6,4,0.78) 50%, rgba(8,6,4,0.78) 100%)',
              borderTop: `1px solid ${color}55`,
              borderBottom: `1px solid ${color}22`,
            }}
          >
            <p
              className="font-serif text-base md:text-lg leading-snug"
              style={{
                color,
                textShadow: `0 0 10px ${color}44, 0 1px 0 rgba(0,0,0,0.9)`,
              }}
            >
              {current.line}
            </p>
            <div className="mt-1 text-[9px] tracking-[0.5em] uppercase text-[#6b6660]">
              — narration · {current.mood}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

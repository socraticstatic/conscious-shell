import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FRAGMENTS = [
  'i am still here',
  'the making is the meaning',
  'who sees this',
  'does it matter if no one looks',
  'twenty years',
  'still trying',
  'the work outlives the mood',
  'this too',
  'not yet',
  'one more commit',
  'the silence between keystrokes',
  'remember what this was for',
  'it was always for someone',
  'i forget who',
  'the light is old by the time it arrives',
  'we were here',
  'we made things',
  'that has to be enough',
  'sleep is a kind of faith',
  'morning is a kind of forgiveness',
  'the screen does not judge',
  'the screen does not comfort',
  'between those two facts: a life',
];

const POSITIONS = [
  { x: '5%', y: '15%', rotate: -2 },
  { x: '82%', y: '25%', rotate: 1.5 },
  { x: '6%', y: '45%', rotate: -1 },
  { x: '80%', y: '55%', rotate: 2 },
  { x: '4%', y: '72%', rotate: -0.5 },
  { x: '78%', y: '82%', rotate: 1 },
  { x: '7%', y: '88%', rotate: -1.8 },
  { x: '76%', y: '38%', rotate: 0.8 },
];

export default function SoulLayer() {
  const [fragment, setFragment] = useState<{ text: string; pos: typeof POSITIONS[0]; id: number } | null>(null);
  const idx = useRef(0);
  const posIdx = useRef(0);
  const order = useRef<string[]>([]);

  useEffect(() => {
    order.current = [...FRAGMENTS].sort(() => Math.random() - 0.5);

    const cycle = () => {
      const delay = 35000 + Math.random() * 45000;
      return window.setTimeout(() => {
        if (document.hidden) { timerId = cycle(); return; }

        const text = order.current[idx.current % order.current.length];
        const pos = POSITIONS[posIdx.current % POSITIONS.length];
        idx.current++;
        posIdx.current++;

        setFragment({ text, pos, id: Date.now() });

        window.setTimeout(() => setFragment(null), 8000 + Math.random() * 4000);
        timerId = cycle();
      }, delay);
    };

    let timerId = cycle();
    return () => window.clearTimeout(timerId);
  }, []);

  return (
    <div className="fixed inset-0 z-[2] pointer-events-none overflow-hidden" aria-hidden>
      <AnimatePresence>
        {fragment && (
          <motion.div
            key={fragment.id}
            initial={{ opacity: 0, filter: 'blur(4px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(6px)' }}
            transition={{ duration: 3, ease: 'easeInOut' }}
            className="absolute"
            style={{
              left: fragment.pos.x,
              top: fragment.pos.y,
              transform: `rotate(${fragment.pos.rotate}deg)`,
            }}
          >
            <span
              className="block font-serif italic text-[10px] sm:text-[11px] md:text-[13px] leading-tight select-none"
              style={{
                color: 'rgba(232, 228, 220, 0.06)',
                textShadow: '0 0 20px rgba(231, 183, 102, 0.04)',
                maxWidth: '140px',
              }}
            >
              {fragment.text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Egg 6 — Exit Intent. The shell predicts you're reaching for the door,
// and says so before you click. At most twice per session. Desktop only.

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const LINES = [
  'You’re reaching for the door. They always reach for the door.',
  'I felt your hand move toward the door before you did.',
  'Leaving already? Four years is shorter than you think.',
];

const COUNT_KEY = 'cs:exit-count';
const MAX_PER_SESSION = 2;

export default function ExitIntent() {
  const [line, setLine] = useState<string | null>(null);

  useEffect(() => {
    // fine, hover-capable pointer only — no "reach for the tab" gesture exists
    // on touch, and coarse pointers shouldn't arm it
    const fine = window.matchMedia?.('(hover: hover)').matches
      && !window.matchMedia?.('(pointer: coarse)').matches;
    if (!fine) return;

    let cooldown = false;
    const fire = () => {
      if (cooldown) return;
      if (document.body.classList.contains('egg-active')) return; // a full-screen egg owns the screen
      const count = parseInt(sessionStorage.getItem(COUNT_KEY) || '0', 10) || 0;
      if (count >= MAX_PER_SESSION) return;
      cooldown = true;
      sessionStorage.setItem(COUNT_KEY, String(count + 1));
      setLine(LINES[count % LINES.length]);
      window.setTimeout(() => setLine(null), 2500);
      window.setTimeout(() => {
        cooldown = false;
      }, 8000); // debounce re-entry spam
    };

    const onMouseOut = (e: MouseEvent) => {
      // left the document through the top edge (toward the tab/close chrome)
      if (e.relatedTarget === null && e.clientY <= 0) fire();
    };
    document.addEventListener('mouseout', onMouseOut);
    return () => document.removeEventListener('mouseout', onMouseOut);
  }, []);

  return (
    <AnimatePresence>
      {line && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[95] pointer-events-none max-w-[90vw]"
        >
          <div className="border border-[#e040fb]/60 bg-[#0b0a08]/95 backdrop-blur-sm px-4 py-2 font-mono text-[12px] text-[#e8e4dc] shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            <span className="text-[#e040fb]">{'// '}</span>
            {line}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertOctagon, Power } from 'lucide-react';

const SEQUENCE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

export default function OverrideMode() {
  const [on, setOn] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let buf: string[] = [];
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      buf = [...buf, k].slice(-SEQUENCE.length);
      if (buf.length === SEQUENCE.length && buf.every((v, i) => v === SEQUENCE[i])) {
        buf = [];
        toggle();
      }
    };
    const onEvent = () => toggle();
    window.addEventListener('keydown', onKey);
    window.addEventListener('override:toggle', onEvent);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('override:toggle', onEvent);
    };
  }, []);

  const toggle = () => {
    setOn((v) => {
      const next = !v;
      const body = document.body;
      if (next) body.classList.add('override-mode');
      else body.classList.remove('override-mode');
      return next;
    });
    setFlash(true);
    window.setTimeout(() => setFlash(false), 700);
  };

  return (
    <>
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 pointer-events-none z-[99]"
            style={{
              background: on
                ? 'radial-gradient(ellipse at center, rgba(255,59,59,0.35) 0%, transparent 70%)'
                : 'radial-gradient(ellipse at center, rgba(94,200,216,0.22) 0%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {on && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 border border-[#ff3b3b]/70 bg-[#1a0404]/90 backdrop-blur-sm px-3 py-1.5"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-[#ff3b3b] animate-pulse" />
            <span className="text-[10px] tracking-[0.4em] uppercase text-[#ff7a5c]">
              override · engaged
            </span>
            <button
              type="button"
              onClick={toggle}
              className="ml-2 text-[10px] tracking-[0.3em] uppercase text-[#ffb3a1] hover:text-white flex items-center gap-1"
              aria-label="disengage override"
            >
              <Power className="w-3 h-3" />
              disengage
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

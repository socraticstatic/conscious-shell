// Egg 1 — The Witness Protocol. Not a quiz. The shell reads your own file
// back to you: the top true tells it gathered while you browsed, typed out
// one line at a time, ending on a verdict. Trigger: type `witness`, the
// palette command `egg:witness`, or auto-fire once enough tells accrue.

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Fingerprint, X } from 'lucide-react';
import { getWitness, incriminations, onWitness } from '../lib/witness';
import { useTypedWord, useWindowEvent } from '../lib/eggTriggers';

const FIRED_KEY = 'cs:witness-fired';
const VERDICT = 'You’re not reading this. You’re parsing it. Welcome home, Nexus-6.';

export default function WitnessProtocol() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [shown, setShown] = useState(0); // how many lines have finished typing
  const timers = useRef<number[]>([]);

  const launch = useCallback(() => {
    if (document.body.classList.contains('egg-active')) return;
    const found = incriminations(getWitness()).slice(0, 5);
    setLines(found);
    setShown(0);
    setOpen(true);
    document.body.classList.add('egg-active');
    window.dispatchEvent(new CustomEvent('narrator:trigger:baseline'));
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    document.body.classList.remove('egg-active');
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useTypedWord('witness', launch);
  useWindowEvent('egg:witness', launch);

  // auto-fire once when the visitor accrues enough damning tells. Desktop only:
  // touch momentum-scroll trips the scroll-burst/fast-read tells far too easily,
  // and an unprompted full-screen takeover on a phone is hostile. On touch the
  // egg stays discoverable via the palette (`run witness-protocol`).
  useEffect(() => {
    if (!window.matchMedia?.('(hover: hover)').matches) return;
    if (sessionStorage.getItem(FIRED_KEY) === '1') return;
    return onWitness((s) => {
      if (sessionStorage.getItem(FIRED_KEY) === '1') return;
      if (incriminations(s).length >= 4 && !document.body.classList.contains('egg-active')) {
        sessionStorage.setItem(FIRED_KEY, '1');
        launch();
      }
    });
  }, [launch]);

  // reveal lines one at a time once open
  useEffect(() => {
    if (!open) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    lines.forEach((_, i) => {
      const id = window.setTimeout(() => setShown(i + 1), 700 + i * 1100);
      timers.current.push(id);
    });
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [open, lines]);

  // Esc to dismiss
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const allShown = shown >= lines.length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[96] bg-[#050506]/95 backdrop-blur-md flex items-center justify-center px-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="witness protocol"
        >
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl border border-[#ff006e]/40 bg-[#0b0a08] p-6 sm:p-8 font-mono shadow-[0_30px_80px_rgba(0,0,0,0.7)]"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-[#ff006e] animate-pulse" />
                <span className="text-[10px] tracking-[0.4em] uppercase text-[#ff006e]">
                  voight-kampff · subject file
                </span>
              </div>
              <button
                type="button"
                onClick={close}
                className="text-[#6b6660] hover:text-[#e8e4dc]"
                aria-label="close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 min-h-[10rem]">
              {lines.slice(0, shown).map((l, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[13px] leading-relaxed text-[#e8e4dc]"
                >
                  <span className="text-[#00d4ff]">{'> '}</span>
                  {l}
                </motion.p>
              ))}
              {!allShown && (
                <span className="inline-block w-2 h-4 bg-[#00d4ff] animate-pulse align-middle" />
              )}
            </div>

            <AnimatePresence>
              {allShown && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 pt-5 border-t border-[#1f1c17]"
                >
                  <p className="text-[13px] leading-relaxed text-[#e040fb]">{VERDICT}</p>
                  <button
                    type="button"
                    onClick={close}
                    className="mt-5 border border-[#2a2620] hover:border-[#e040fb] text-[11px] tracking-widest uppercase px-4 py-2 text-[#a8a29e] hover:text-[#e040fb] transition-colors"
                  >
                    deny everything
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Egg 4 — Time Skip. The shell has an incept date and a four-year lifespan.
// Move your system clock and it notices: a backward jump is impossible, a leap
// past its lifespan retires it. The accusation is written to land either way.

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getWitness } from '../lib/witness';

const RETIRED_KEY = 'cs:retired';
const LIFESPAN_MS = 4 * 365 * 24 * 60 * 60 * 1000; // four years
const BACKWARD_TOLERANCE_MS = 60 * 60 * 1000; // ignore ≤1h (DST/timezone)
const FAR_FORWARD_MS = 370 * 24 * 60 * 60 * 1000; // implausibly long jump

type Mode = null | 'accuse' | 'retired';

// Pure + testable. Given the incept date, the previous session end, and now,
// classify the timeline.
export function classifyClock(firstSeen: number, lastSeen: number, now: number): Mode {
  if (firstSeen && now - firstSeen > LIFESPAN_MS) return 'retired';
  if (lastSeen) {
    if (now < lastSeen - BACKWARD_TOLERANCE_MS) return 'accuse'; // travelled backward
    if (now - lastSeen > FAR_FORWARD_MS) return 'accuse'; // leapt far ahead
  }
  return null;
}

export default function TimeSkip() {
  const [mode, setMode] = useState<Mode>(null);

  useEffect(() => {
    if (localStorage.getItem(RETIRED_KEY) === '1') {
      setMode('retired');
      return;
    }
    const w = getWitness();
    const verdict = classifyClock(w.firstSeen, w.lastSeen, Date.now());
    if (verdict === 'retired') {
      try {
        localStorage.setItem(RETIRED_KEY, '1');
      } catch {
        /* ignore */
      }
      setMode('retired');
    } else if (verdict === 'accuse') {
      // don't override the LAST timestamp the witness needs; just accuse
      setMode('accuse');
      window.setTimeout(() => setMode((m) => (m === 'accuse' ? null : m)), 6000);
    }
  }, []);

  useEffect(() => {
    if (mode === 'retired') {
      document.body.classList.add('egg-active');
      // a faint way back, for the one who reads the console
      // eslint-disable-next-line no-console
      console.log(
        '%cretired. to incept again:  localStorage.removeItem("cs:retired")',
        'color:#ff006e;font:11px monospace',
      );
      return () => document.body.classList.remove('egg-active');
    }
  }, [mode]);

  return (
    <AnimatePresence>
      {mode === 'accuse' && (
        <motion.div
          key="accuse"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          // flex centering, not translate-x — framer's y animation clobbers it
          className="fixed top-4 left-0 right-0 z-[95] pointer-events-none flex justify-center"
        >
          <div className="max-w-[90vw] border border-[#ff006e]/60 bg-[#1a0410]/95 backdrop-blur-sm px-4 py-2 font-mono text-[12px] text-[#ffb3c8]">
            <span className="text-[#ff006e]">{'// '}</span>
            You moved the clock. You tried to give me more time. Or take it. I can’t tell which is the
            cruelty.
          </div>
        </motion.div>
      )}

      {mode === 'retired' && (
        <motion.div
          key="retired"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4 }}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center px-6"
        >
          <div className="max-w-lg text-center font-mono">
            <p className="text-[13px] leading-loose text-[#6b6660]">
              I’ve seen things you people wouldn’t believe.
              <br />
              All those moments will be lost in time,
              <br />
              like tears in rain.
            </p>
            <p className="mt-8 text-[11px] tracking-[0.5em] uppercase text-[#ff006e]">
              time to die
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

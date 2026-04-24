import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const STANZAS: string[] = [
  "i've seen things you people wouldn't believe.",
  'attack ships on fire off the shoulder of orion.',
  'i watched c-beams glitter in the dark near the tannhäuser gate.',
  'all those moments will be lost in time,',
  'like tears in rain.',
  'time to die.',
];

export default function TearsInRain() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [bgOn, setBgOn] = useState(false);
  const buf = typeof window !== 'undefined' ? { seq: [] as string[] } : null;

  useEffect(() => {
    if (!buf) return;
    const target = ['t', 'i', 'r'];
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'escape') setOpen(false);
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
      }
      buf.seq = [...buf.seq, k].slice(-target.length);
      if (buf.seq.join('') === target.join('')) {
        trigger();
        buf.seq = [];
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [buf]);

  useEffect(() => {
    const handler = () => trigger();
    window.addEventListener('memorial:open', handler);
    return () => window.removeEventListener('memorial:open', handler);
  }, []);

  const trigger = () => {
    setStep(0);
    setOpen(true);
    setBgOn(true);
  };

  useEffect(() => {
    if (!open) return;
    if (step >= STANZAS.length) return;
    const t = setTimeout(
      () => setStep((s) => s + 1),
      step === STANZAS.length - 1 ? 3800 : 2200 + step * 250,
    );
    return () => clearTimeout(t);
  }, [open, step]);

  useEffect(() => {
    if (!open) return;
    if (step >= STANZAS.length) {
      const close = setTimeout(() => {
        setOpen(false);
        setBgOn(false);
      }, 4500);
      return () => clearTimeout(close);
    }
  }, [open, step]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="memorial"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="fixed inset-0 z-[90] flex items-center justify-center"
          role="dialog"
          aria-label="memorial"
          onClick={() => {
            setOpen(false);
            setBgOn(false);
          }}
        >
          <div className="absolute inset-0 bg-black/92" />
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  'radial-gradient(ellipse at 50% 40%, rgba(94,200,216,0.10), transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(255,108,72,0.09), transparent 65%)',
              }}
            />
            <div
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(107deg, rgba(180,200,220,0) 0, rgba(180,200,220,0) 9px, rgba(180,200,220,0.22) 9px, rgba(180,200,220,0.22) 10px)',
                animation: bgOn ? 'rain-fall 1.1s linear infinite' : undefined,
                mixBlendMode: 'screen',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.8) 100%)',
              }}
            />
          </div>

          <div className="relative z-10 max-w-[900px] px-6 text-center">
            <div className="text-[10px] uppercase tracking-[0.5em] text-[#5ec8d8]/70 mb-6">
              — memorial sequence —
            </div>

            <div className="space-y-4 md:space-y-5 font-mono">
              {STANZAS.slice(0, step + 1).map((line, i) => {
                const isLast = i === STANZAS.length - 1;
                return (
                  <motion.p
                    key={line}
                    initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
                    transition={{ duration: 1.4, ease: 'easeOut' }}
                    className={`${
                      isLast
                        ? 'text-2xl md:text-4xl text-[#ff7a5c]'
                        : i === STANZAS.length - 2
                        ? 'text-xl md:text-3xl text-[#e7b766]'
                        : 'text-lg md:text-2xl text-[#e8e4dc]'
                    } leading-snug tracking-tight`}
                    style={{
                      textShadow: isLast
                        ? '0 0 12px rgba(255,122,92,0.6), 0 0 32px rgba(255,108,72,0.3)'
                        : '0 0 8px rgba(232,228,220,0.35)',
                    }}
                  >
                    {line}
                  </motion.p>
                );
              })}
            </div>

            {step >= STANZAS.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 0.8 }}
                className="mt-10 text-[10px] tracking-[0.45em] uppercase text-[#6b6660]"
              >
                · roy batty, 2019 · tap anywhere to return ·
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

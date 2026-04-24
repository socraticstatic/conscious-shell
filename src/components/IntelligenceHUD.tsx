import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, ChevronDown, Sparkles } from 'lucide-react';
import {
  recordCommand,
  recordDwell,
  recordOverride,
  recordScrollDepth,
  recordSkylinePointer,
  recordVkAnswer,
  startSessionTick,
  useIntelligence,
  flush,
} from '../lib/intelligence';
import { PERSONA_META, scorePersona, type Persona } from '../lib/persona';

function useBodyObservers() {
  useEffect(() => {
    startSessionTick();

    const sections = Array.from(document.querySelectorAll<HTMLElement>('section[id]'));
    const visible = new Map<string, number>();
    let rafId = 0;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const id = (e.target as HTMLElement).id;
          if (!id) return;
          if (e.isIntersecting && e.intersectionRatio > 0.3) {
            if (!visible.has(id)) visible.set(id, performance.now());
          } else {
            const start = visible.get(id);
            if (start) {
              recordDwell(id, performance.now() - start);
              visible.delete(id);
            }
          }
        });
      },
      { threshold: [0, 0.3, 0.6] },
    );
    sections.forEach((s) => io.observe(s));

    const flushDwell = () => {
      const now = performance.now();
      visible.forEach((start, id) => {
        recordDwell(id, now - start);
        visible.set(id, now);
      });
    };
    const dwellTimer = window.setInterval(flushDwell, 4000);

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (max > 0) recordScrollDepth(window.scrollY / max);
        rafId = 0;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const onCmd = () => recordCommand();
    const onVk = () => recordVkAnswer();
    const onOverride = () => recordOverride();
    const onSky = () => recordSkylinePointer();
    window.addEventListener('intel:command', onCmd);
    window.addEventListener('intel:vk_answer', onVk);
    window.addEventListener('intel:override', onOverride);
    window.addEventListener('intel:skyline', onSky);

    const bodyWatcher = new MutationObserver(() => {
      if (document.body.classList.contains('override-mode')) recordOverride();
    });
    bodyWatcher.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    const onBeforeUnload = () => {
      flushDwell();
      flush();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('pagehide', onBeforeUnload);

    return () => {
      io.disconnect();
      clearInterval(dwellTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('intel:command', onCmd);
      window.removeEventListener('intel:vk_answer', onVk);
      window.removeEventListener('intel:override', onOverride);
      window.removeEventListener('intel:skyline', onSky);
      bodyWatcher.disconnect();
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('pagehide', onBeforeUnload);
    };
  }, []);
}

function fmt(ms: number) {
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s`;
  return `${Math.floor(ms / 60_000)}m${String(Math.floor((ms % 60_000) / 1000)).padStart(2, '0')}s`;
}

export default function IntelligenceHUD() {
  useBodyObservers();
  const { persona, confidence, signals } = useIntelligence();
  const [open, setOpen] = useState(false);
  const [autoOpened, setAutoOpened] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const meta = PERSONA_META[persona];
  const scores = useMemo(() => scorePersona(signals), [signals]);

  useEffect(() => {
    const el = document.documentElement;
    if (persona === 'unknown') {
      el.removeAttribute('data-persona');
    } else {
      el.setAttribute('data-persona', persona);
      el.style.setProperty('--persona-accent', meta.accent);
    }
  }, [persona, meta.accent]);

  useEffect(() => {
    if (persona !== 'unknown' && !autoOpened && !dismissed) {
      const t = setTimeout(() => setOpen(true), 600);
      setAutoOpened(true);
      return () => clearTimeout(t);
    }
  }, [persona, autoOpened, dismissed]);

  if (dismissed) return null;

  const topSignals: Array<[string, number]> = Object.entries(signals.sectionDwell)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4) as Array<[string, number]>;

  const scoreEntries = (Object.entries(scores) as Array<[Exclude<Persona, 'unknown'>, number]>)
    .sort((a, b) => b[1] - a[1]);
  const maxScore = Math.max(1.5, ...scoreEntries.map(([, v]) => v));

  return (
    <div className="fixed bottom-4 right-4 z-[70] font-mono select-none pointer-events-none">
      <motion.div layout className="pointer-events-auto">
        <button
          onClick={() => setOpen((v) => !v)}
          className="group flex items-center gap-2 px-3 py-2 border bg-black/70 backdrop-blur-sm text-[10px] tracking-[0.4em] uppercase transition-colors"
          style={{ borderColor: `${meta.accent}66`, color: meta.accent }}
        >
          <Brain className="w-3.5 h-3.5" />
          <span className="text-white/90">intel</span>
          <span>·</span>
          <span>{meta.label}</span>
          <span className="text-white/50">
            {persona === 'unknown' ? '...' : `${Math.round(confidence * 100)}%`}
          </span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-1 opacity-60"
          >
            <ChevronDown className="w-3 h-3" />
          </motion.span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="absolute bottom-full right-0 mb-2 w-[340px] border bg-black/85 backdrop-blur-md p-4"
              style={{ borderColor: `${meta.accent}55` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[9px] tracking-[0.5em] uppercase text-[#7a6e62]">
                    persona signature
                  </div>
                  <div
                    className="text-2xl font-light tracking-tight mt-1"
                    style={{ color: meta.accent }}
                  >
                    {meta.label}
                  </div>
                </div>
                <button
                  onClick={() => setDismissed(true)}
                  className="text-[9px] tracking-[0.4em] uppercase text-white/40 hover:text-white/80"
                >
                  dismiss
                </button>
              </div>

              <div className="text-[11px] italic text-white/70 mt-2 leading-snug">
                &ldquo;{meta.tagline}&rdquo;
              </div>

              <div className="mt-4 space-y-1.5">
                {scoreEntries.map(([k, v]) => {
                  const m = PERSONA_META[k];
                  const w = (v / maxScore) * 100;
                  const isCurrent = k === persona;
                  return (
                    <div key={k} className="flex items-center gap-2">
                      <div
                        className="w-20 text-[9px] tracking-[0.3em] uppercase"
                        style={{ color: isCurrent ? m.accent : '#7a6e62' }}
                      >
                        {m.label}
                      </div>
                      <div className="flex-1 h-1.5 bg-white/5 overflow-hidden">
                        <motion.div
                          animate={{ width: `${Math.max(2, w)}%` }}
                          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full"
                          style={{ background: m.accent, opacity: isCurrent ? 1 : 0.5 }}
                        />
                      </div>
                      <div className="w-8 text-right text-[9px] tabular-nums text-white/50">
                        {v.toFixed(1)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5">
                <div className="text-[9px] tracking-[0.4em] uppercase text-[#7a6e62] mb-2">
                  strongest signals
                </div>
                <ul className="text-[10px] space-y-1">
                  {topSignals.length === 0 && (
                    <li className="text-white/40 italic">gathering...</li>
                  )}
                  {topSignals.map(([k, v]) => (
                    <li key={k} className="flex items-center justify-between">
                      <span className="text-white/70 truncate">{k}</span>
                      <span className="text-white/40 tabular-nums ml-2">
                        {Math.round(v)}s
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-4 mt-2 pt-2 border-t border-white/5 text-[9px] tracking-[0.3em] uppercase text-white/50">
                  <span>session {fmt(signals.sessionMs)}</span>
                  <span>scroll {Math.round(signals.scrollDepth * 100)}%</span>
                  <span>visits {signals.returnVisits + 1}</span>
                </div>
              </div>

              {meta.targetId && (
                <a
                  href={`#${meta.targetId}`}
                  onClick={() => setOpen(false)}
                  className="mt-4 flex items-center gap-2 px-3 py-2 border text-[10px] tracking-[0.4em] uppercase transition-colors"
                  style={{
                    borderColor: `${meta.accent}88`,
                    color: meta.accent,
                    background: `${meta.accent}0d`,
                  }}
                >
                  <Sparkles className="w-3 h-3" />
                  <span className="text-white/90">for you · </span>
                  <span>{meta.targetLabel}</span>
                </a>
              )}

              <div className="mt-3 text-[9px] tracking-[0.3em] uppercase text-[#55504a]">
                anonymous · stored as random id · no account required
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

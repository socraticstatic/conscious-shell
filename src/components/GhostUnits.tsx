// Egg 5 — The Other Units. Other visitors in the shell right now, rendered as
// ghost cursors via Supabase Realtime. Type `who`. When one leaves, it's a
// retirement. Nothing is persisted server-side; the channel is ephemeral.

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { getWitness } from '../lib/witness';
import { useTypedWord, useWindowEvent } from '../lib/eggTriggers';

type Ghost = { x: number; y: number };
const MAX_RENDERED = 12;

export default function GhostUnits() {
  const [on, setOn] = useState(false);
  const [ghosts, setGhosts] = useState<Record<string, Ghost>>({});
  const [others, setOthers] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const reduced = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const unitNums = useRef<Record<string, number>>({});
  const nextUnit = useRef(1);
  const numberFor = (id: string) => {
    if (!unitNums.current[id]) unitNums.current[id] = nextUnit.current++;
    return unitNums.current[id];
  };

  const toggle = useCallback(() => setOn((v) => !v), []);
  useTypedWord('who', toggle);
  useWindowEvent('egg:who', toggle);

  useEffect(() => {
    if (!on) return;
    const vid = getWitness().visitorId || 'anon';
    let lastSend = 0;

    const channel = supabase.channel('shell-presence', {
      config: { presence: { key: vid }, broadcast: { self: false } },
    });

    const syncOthers = () => {
      const state = channel.presenceState() as Record<string, unknown[]>;
      const count = Math.max(0, Object.keys(state).length - 1); // exclude self
      setOthers(count);
    };

    channel
      .on('presence', { event: 'sync' }, syncOthers)
      .on('presence', { event: 'join' }, syncOthers)
      .on('presence', { event: 'leave' }, ({ key }: { key: string }) => {
        if (key === vid) return;
        const n = numberFor(key);
        setGhosts((g) => {
          const next = { ...g };
          delete next[key];
          return next;
        });
        setToast(`Unit ${n} went dark.`);
        window.setTimeout(() => setToast(null), 3000);
        syncOthers();
      })
      .on('broadcast', { event: 'cursor' }, ({ payload }: { payload: { id: string; x: number; y: number } }) => {
        if (!payload || payload.id === vid) return;
        numberFor(payload.id);
        setGhosts((g) => ({ ...g, [payload.id]: { x: payload.x, y: payload.y } }));
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          channel.track({ id: vid, at: Date.now() });
          syncOthers();
        }
      });

    const onMove = (e: PointerEvent) => {
      const now = Date.now();
      if (now - lastSend < 100) return; // ~10Hz
      lastSend = now;
      channel.send({
        type: 'broadcast',
        event: 'cursor',
        payload: { id: vid, x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      supabase.removeChannel(channel);
      setGhosts({});
      setOthers(0);
    };
  }, [on]);

  if (!on) return null;

  const entries = Object.entries(ghosts).slice(0, MAX_RENDERED);

  return (
    <>
      {entries.map(([id, g]) => (
        <motion.div
          key={id}
          className="fixed z-[92] pointer-events-none"
          initial={false}
          animate={{ left: `${g.x * 100}%`, top: `${g.y * 100}%` }}
          transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 90, damping: 18 }}
          style={{ left: `${g.x * 100}%`, top: `${g.y * 100}%` }}
        >
          <div className="relative -translate-x-1 -translate-y-1">
            <div className="w-3 h-3 rotate-45 border-l border-t border-[#00d4ff]/70 shadow-[0_0_8px_rgba(0,212,255,0.5)]" />
            <span className="absolute left-3 top-2 text-[9px] font-mono text-[#00d4ff]/60 whitespace-nowrap">
              unit {unitNums.current[id] ?? '·'}
            </span>
          </div>
        </motion.div>
      ))}

      {/* lg lane 6.5rem: the slot between SessionHUD (ends ~102px) and the ambient-audio button (starts ~128px) */}
      <div className="fixed bottom-24 lg:bottom-[6.5rem] left-4 z-[92] font-mono text-[11px] text-[#6b6660] pointer-events-none">
        {others > 0 ? (
          <span className="text-[#00d4ff]">{`// ${others} unit${others > 1 ? 's' : ''} active in this shell`}</span>
        ) : (
          <span>{'// you’re alone in here. that’s worse.'}</span>
        )}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            // centering via flex, not translate-x — framer's inline transform
            // (the y animation) erases Tailwind translates
            className="fixed bottom-24 lg:bottom-8 left-0 right-0 flex justify-center z-[93] font-mono text-[11px] text-[#ff006e] pointer-events-none"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ScanSearch } from 'lucide-react';
import type { EsperFrame } from './EsperScene';
import type { EsperFrameRow } from '../lib/supabase';

// Esper for one thumb.
//
// The desktop machine is a control panel: frame, terminal, node chips, a
// pager. Three attempts to compress that onto a phone failed, because a
// phone is not a smaller control panel — it is a screen you hold. So the
// calm tier gets two native shapes instead:
//
//   1. The GRID — all frames visible at once, an archive you can see.
//   2. The SESSION — tap a frame and it takes the whole screen like a
//      film still. Tap anywhere to enhance. The machine zooms, types its
//      three lines, and lays the reveal over the photograph on a scrim.
//      Nodes run in order, so the session always ends at the buried line.
//      X returns to the grid exactly where you left it.
//
// Palette law holds: cyan is tracking, magenta is what has been revealed.

const ESPER_EASE = [0.22, 1, 0.36, 1] as const;

const BURIED_FALLBACK = [
  '> [UNLOGGED] this region was not in the case file.',
  '> you enhanced everything. you found the thing under the thing.',
  '> purge this line. it was never here.',
];

type SessionStep =
  | { kind: 'title' }
  | { kind: 'node'; index: number }
  | { kind: 'buried' };

export default function EsperMobile({
  frames,
  frameLines = [],
}: {
  frames: EsperFrame[];
  frameLines?: EsperFrameRow[];
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [step, setStep] = useState<SessionStep>({ kind: 'title' });
  const [typedCount, setTypedCount] = useState(0);
  const timers = useRef<number[]>([]);

  const reduced = useRef(
    typeof window !== 'undefined' &&
      !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  ).current;

  const frame = openIdx === null ? null : frames[openIdx];
  const nodes = frame?.hotspots ?? [];
  const activeNode = step.kind === 'node' ? nodes[step.index] : null;

  const buriedLines = useMemo(() => {
    const row = frameLines.find((f) => f.photo_id === frame?.photoId);
    const text = row?.buried_line?.trim();
    return text ? text.split('\n') : BURIED_FALLBACK;
  }, [frameLines, frame?.photoId]);

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  // Session open/close owns the page scroll, like the article reader.
  useEffect(() => {
    if (openIdx === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [openIdx]);

  useEffect(() => () => clearAll(), [clearAll]);

  const openSession = (i: number) => {
    clearAll();
    setStep({ kind: 'title' });
    setTypedCount(0);
    setOpenIdx(i);
  };

  const closeSession = () => {
    clearAll();
    setOpenIdx(null);
  };

  // The single verb. Tap: title → node 0 → node 1 → ... → buried → next frame.
  const advance = () => {
    if (!frame) return;
    clearAll();
    if (step.kind === 'title') {
      if (!nodes.length) return closeSession();
      beginNode(0);
    } else if (step.kind === 'node') {
      const next = step.index + 1;
      if (next < nodes.length) beginNode(next);
      else setStep({ kind: 'buried' });
    } else {
      // buried → the next frame's session, seamless. Wraps at the end.
      const nextFrame = (openIdx! + 1) % frames.length;
      setStep({ kind: 'title' });
      setTypedCount(0);
      setOpenIdx(nextFrame);
    }
  };

  const beginNode = (index: number) => {
    setStep({ kind: 'node', index });
    setTypedCount(0);
    // Three machine lines, then the reveal (typedCount 4 shows prose).
    [1, 2, 3, 4].forEach((n, i) => {
      const id = window.setTimeout(() => setTypedCount(n), 260 * (i + 1));
      timers.current.push(id);
    });
  };

  // Zoom toward the active node, exactly like the desktop machine.
  const zoomStyle = useMemo(() => {
    if (!activeNode || reduced) return { transform: 'scale(1) translate(0%, 0%)' };
    const cx = activeNode.x + activeNode.w / 2;
    const cy = activeNode.y + activeNode.h / 2;
    const tx = (0.5 - cx) * 60;
    const ty = (0.5 - cy) * 60;
    return { transform: `translate(${tx}%, ${ty}%) scale(1.6)`, transformOrigin: '50% 50%' };
  }, [activeNode, reduced]);

  const machineLines = activeNode
    ? [`> ${activeNode.track_cmd}`, `> ${activeNode.enhance_cmd}`, '> reveal.']
    : [];

  return (
    <>
      {/* ------------------------------------------------ the grid */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        {frames.map((f, i) => (
          <motion.button
            key={f.photoId}
            type="button"
            onClick={() => openSession(i)}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35, delay: (i % 2) * 0.06 }}
            className="group text-left"
            aria-label={`open esper session: ${f.caption || `frame ${i + 1}`}`}
          >
            <div className="relative aspect-square overflow-hidden border border-[#1f1c17] bg-black">
              <img
                src={f.url}
                alt={f.caption || `esper frame ${i + 1}`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
                // Thumbnails only: several frames are true noir and read as
                // dead black at 170px square. The session shows the photograph
                // honestly; the grid gets a lift so the archive is visible.
                style={{ objectPosition: f.pos ?? '50% 50%', filter: 'brightness(1.35) saturate(1.05)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <span className="absolute left-2 top-2 text-[9px] font-mono tracking-[0.25em] text-[#00d4ff]/90 bg-black/50 px-1.5 py-0.5">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
            <div className="mt-1.5 min-h-[2.25rem] text-[11px] font-mono lowercase leading-snug text-[#8a837a] group-active:text-[#00d4ff]">
              {f.caption || `frame ${String(i + 1).padStart(2, '0')}`}
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-4 text-[11px] font-mono text-[#605a52]">
        # {frames.length} frames on file · tap any frame to run the session
      </div>

      {/* ------------------------------------------------ the session */}
      <AnimatePresence>
        {frame && (
          <motion.div
            key="esper-session"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] bg-black select-none"
            role="dialog"
            aria-modal="true"
            aria-label={frame.caption || 'esper session'}
          >
            {/* full-bleed photograph, zooming toward the active node */}
            <motion.div
              className="absolute inset-0"
              animate={zoomStyle}
              transition={{ duration: reduced ? 0 : 1.1, ease: ESPER_EASE }}
            >
              <img
                key={frame.photoId}
                src={frame.url}
                alt={frame.caption || 'esper frame'}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: frame.pos ?? '50% 50%' }}
                draggable={false}
              />
              {/* scanlines, same optics as the desktop unit */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.35) 2px 3px)',
                  mixBlendMode: 'multiply',
                  opacity: 0.45,
                }}
              />
            </motion.div>

            {/* readable ground for every word on the image */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/90 via-black/25 to-black/60" />

            {/* full-screen advance surface — the one verb */}
            <button
              type="button"
              onClick={advance}
              className="absolute inset-0 w-full h-full"
              aria-label="advance esper session"
            />

            {/* top chrome: progress, caption, exit */}
            <div className="absolute top-0 inset-x-0 pt-[calc(10px+env(safe-area-inset-top,0px))] px-4 pointer-events-none">
              <div className="flex gap-1.5">
                {nodes.map((n, i) => {
                  const filled =
                    step.kind === 'buried' ||
                    (step.kind === 'node' && i <= step.index);
                  return (
                    <div key={n.id} className="h-0.5 flex-1 bg-white/15 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          filled ? 'w-full bg-[#e040fb]' : 'w-0'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="text-[9px] font-mono tracking-[0.3em] uppercase text-[#00d4ff]/90 leading-relaxed max-w-[75%]">
                  {frame.caption}
                </div>
                <button
                  type="button"
                  onClick={closeSession}
                  aria-label="close esper session"
                  className="pointer-events-auto -mr-2 -mt-2 inline-flex items-center justify-center w-11 h-11 text-[#e8e4dc]/90 active:text-[#e040fb]"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* bottom: the machine speaks over the photograph */}
            <div className="absolute bottom-0 inset-x-0 px-5 pb-[calc(20px+env(safe-area-inset-bottom,0px))] pointer-events-none">
              <AnimatePresence mode="wait">
                {step.kind === 'title' && (
                  <motion.div
                    key="title"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.35em] uppercase text-[#00d4ff]">
                      <ScanSearch className="w-3.5 h-3.5" />
                      esper · {nodes.length} nodes on file
                    </div>
                    <div className="mt-2 text-[#e8e4dc] font-mono text-[13px]">
                      tap to enhance
                    </div>
                  </motion.div>
                )}

                {step.kind === 'node' && activeNode && (
                  <motion.div
                    key={activeNode.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="font-mono text-[11px] leading-relaxed text-[#7fd9ec] space-y-0.5">
                      {machineLines.slice(0, Math.min(typedCount, 3)).map((l, i) => (
                        <div key={i}>{l}</div>
                      ))}
                    </div>
                    {typedCount >= 4 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mt-3"
                      >
                        <div className="text-[9px] font-mono tracking-[0.35em] uppercase text-[#e040fb] mb-1.5">
                          // reveal · node-{String(activeNode.order_index).padStart(2, '0')}
                        </div>
                        <p className="font-serif text-[17px] leading-[1.6] text-[#f0ece3] [text-shadow:0_1px_8px_rgba(0,0,0,0.9)]">
                          {activeNode.reveal}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {step.kind === 'buried' && (
                  <motion.div
                    key="buried"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.95 }}
                    transition={{ duration: 0.9 }}
                    className="font-mono text-[12.5px] leading-relaxed text-[#9a8f83] space-y-1"
                    style={{ textShadow: '0 0 10px rgba(224,64,251,0.3)' }}
                  >
                    {buriedLines.map((l, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 * i }}
                        className={i >= 1 && i <= buriedLines.length - 2 ? 'text-[#d6cabb]' : undefined}
                      >
                        {l}
                      </motion.div>
                    ))}
                    <div className="pt-2 text-[10px] tracking-[0.3em] uppercase text-[#00d4ff]/70">
                      tap for the next frame
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

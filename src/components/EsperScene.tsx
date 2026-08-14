import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useShellTier } from '../lib/shellTier';
import EsperMobile from './EsperMobile';
import { ChevronLeft, ChevronRight, ScanSearch, RotateCcw } from 'lucide-react';
import type { EsperHotspot, EsperFrameRow } from '../lib/supabase';

type Phase = 'idle' | 'track' | 'enhance' | 'resolve';

// One shared easing for every esper motion on the site. The panel in Work uses
// the same curve. Two machines, one hand on the dial.
const ESPER_EASE = [0.22, 1, 0.36, 1] as const;

// Every frame is Micah's own photograph, published on Unsplash as
// @micahboswell. A 2026-07-06 pass asserted this handle was fictional and
// substituted @greyharbor7; that was wrong. Corroborated by his author bio in
// the vault and by supabase/migrations/20260422102044_create_web_dossier.sql.
export type EsperFrame = {
  photoId: string;
  url: string;
  caption: string;
  credit: string;
  pos?: string;
  hotspots: EsperHotspot[];
};

/**
 * Group hotspot rows into frames.
 *
 * The frame list used to be a hardcoded 9-entry array in this file while the
 * table held 13, which stranded 4 frames and 12 reveal passages. Deriving the
 * list from the data means a new frame is an INSERT, not a code change, and the
 * caption on screen is the caption in the database.
 *
 * Frame order comes from `photo_order`, not from first appearance: every row
 * carries order_index 10/20/30, so `order by order_index` ties on all thirteen
 * frames and leaves their sequence to whatever the heap hands back. Rows with no
 * photo_order sort last, alphabetically, so a freshly inserted frame shows up at
 * the end instead of disappearing. Nodes inside a frame keep order_index.
 */
function buildFrames(hotspots: EsperHotspot[]): EsperFrame[] {
  const byPhoto = new Map<string, EsperFrame>();
  const rank = new Map<string, number>();

  for (const h of hotspots) {
    if (!h.photo_id) continue;
    let frame = byPhoto.get(h.photo_id);
    if (!frame) {
      frame = {
        photoId: h.photo_id,
        url:
          h.photo_url ||
          `https://images.unsplash.com/${h.photo_id}?fm=jpg&q=75&w=1600&auto=format&fit=crop`,
        caption: h.photo_caption || '',
        credit: h.photo_credit || '',
        pos: h.photo_pos || undefined,
        hotspots: [],
      };
      byPhoto.set(h.photo_id, frame);
      rank.set(h.photo_id, h.photo_order ?? Number.MAX_SAFE_INTEGER);
    }
    frame.hotspots.push(h);
  }

  const frames = [...byPhoto.values()];
  frames.sort((a, b) => {
    const d = (rank.get(a.photoId) ?? 0) - (rank.get(b.photoId) ?? 0);
    return d !== 0 ? d : a.photoId.localeCompare(b.photoId);
  });
  for (const f of frames) f.hotspots.sort((a, b) => a.order_index - b.order_index);
  return frames;
}

// The buried line. It is not in any case file. The machine surfaces it only when
// someone enhances every node on a single frame, in order — the patient, the ones
// who finish what they start. Then it says the one true thing and asks to be purged.
// (A boy on a rooftop in Chiclayo. He grew up. He built the machine so he could
// look at the light leaving without flinching. He is fine. He is fine.)
const BURIED_FALLBACK = [
  '> [UNLOGGED] this region was not in the case file.',
  '> you enhanced everything. you found the thing under the thing.',
  '> it is a boy on a rooftop in the dry season, watching the light go,',
  '> learning that everything you love you will one day hand back.',
  '> he is fine. he grew up. he built this machine so he could look at it',
  '> again without flinching. he still flinches. purge this line.',
  '> it was never here.',
];

export default function EsperScene({
  hotspots,
  frameLines = [],
}: {
  hotspots: EsperHotspot[];
  frameLines?: EsperFrameRow[];
}) {
  const [active, setActive] = useState<EsperHotspot | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [typed, setTyped] = useState<string[]>([]);
  const [buried, setBuried] = useState(false);
  const timers = useRef<number[]>([]);
  // In-order progress through the current frame's nodes. Reaching the end unlocks
  // the buried line. Any out-of-order click resets the streak.
  const seqRef = useRef(0);

  const sectionRef = useRef<HTMLElement | null>(null);

  // framer-motion writes transforms in JS, so the @media (prefers-reduced-motion)
  // block in index.css never reaches them — the 1.6s zoom ran at full length for
  // people who had asked for less. Read at mount, like GhostUnits and MemoryDecay.
  const reduced = useRef(
    typeof window !== 'undefined' &&
      !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  ).current;

  // Thirteen frames, from the table. Nine used to be hardcoded here.
  const frames = useMemo(() => buildFrames(hotspots), [hotspots]);

  const [frameIdx, setFrameIdx] = useState(0);

  // Calm tier renders EsperMobile (grid + full-screen story session) —
  // this component is the desktop control panel only.
  const tier = useShellTier();
  const terminalRef = useRef<HTMLDivElement | null>(null);

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  // Manual by default. The frame used to advance on a 25s setInterval and wipe
  // all state with it, so a reader partway through a reveal lost the reveal.
  // Reading is the point of this component; it does not get interrupted.
  const goToFrame = useCallback(
    (next: number) => {
      setFrameIdx((prev) => {
        const n = frames.length;
        if (n === 0) return prev;
        return ((next % n) + n) % n;
      });
    },
    [frames.length],
  );

  // Frame change resets the terminal, exactly as before. The streak resets too:
  // a streak is per-frame by definition.
  useEffect(() => {
    clearAll();
    setActive(null);
    setPhase('idle');
    setTyped([]);
    setBuried(false);
    seqRef.current = 0;
  }, [frameIdx, clearAll]);

  // Left/right step frames when focus is inside the section. Scoped to the
  // section so it cannot hijack arrow keys for the rest of the page.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goToFrame(frameIdx - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goToFrame(frameIdx + 1); }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [frameIdx, goToFrame]);

  const frame = frames[Math.min(frameIdx, Math.max(frames.length - 1, 0))];

  // The buried line for THIS frame. Every frame used to surface the same
  // passage — the boy on the Chiclayo rooftop — so finding it a second time
  // told you nothing you had not already been told. Now each photograph
  // answers for itself. The hardcoded array survives only as a fallback for a
  // frame with no row yet, so a new INSERT never renders an empty reveal.
  const buriedLines = useMemo(() => {
    const row = frameLines.find(f => f.photo_id === frame?.photoId);
    const text = row?.buried_line?.trim();
    return text ? text.split('\n') : BURIED_FALLBACK;
  }, [frameLines, frame?.photoId]);
  const photo = frame?.url ?? '';
  const caption = frame?.caption ?? '';
  // The byline is not painted on the frame — these are his. It lives in
  // photo_credit so the record is unambiguous, not so the visitor reads it.

  // Already grouped and sorted by buildFrames; the second name is kept because
  // the streak logic reads specifically as "the nodes, in order".
  const activeHotspots = useMemo(() => frame?.hotspots ?? [], [frame]);
  const orderedHotspots = activeHotspots;

  useEffect(() => () => clearAll(), [clearAll]);

  const reset = () => {
    clearAll();
    setActive(null);
    setPhase('idle');
    setTyped([]);
    setBuried(false);
    seqRef.current = 0;
  };

  /**
   * @param deliberate — true only when the reader chose this node themselves.
   *   The buried line is meant to be found, not handed over. Frame stepping and
   *   any future autoplay must pass false, or the payoff is free.
   */
  const run = (h: EsperHotspot, deliberate = true) => {
    clearAll();
    setActive(h);
    setPhase('track');
    setTyped([]);

    // Track the in-order streak. If this node is the next one expected, advance;
    // otherwise the streak collapses (to 1 if they just started over at the top).
    if (deliberate) {
      const idx = orderedHotspots.findIndex((n) => n.id === h.id);
      if (idx === seqRef.current) seqRef.current += 1;
      else seqRef.current = idx === 0 ? 1 : 0;
    }
    const completesFrame =
      deliberate && orderedHotspots.length > 0 && seqRef.current === orderedHotspots.length;

    const lines = [
      `> load bradbury.frame.${String(h.order_index).padStart(3, '0')}`,
      `> ${h.track_cmd}`,
      `> ${h.enhance_cmd}`,
      `> analyse · descreen · unmatte`,
      `> isolate ...`,
      `> reveal.`,
    ];

    lines.forEach((l, i) => {
      const id = window.setTimeout(() => {
        setTyped((t) => [...t, l]);
        if (i === 1) setPhase('enhance');
        if (i === lines.length - 1) {
          setPhase('resolve');
          // The machine surfaces what it wasn't asked for, a beat after the reveal
          // lands — only for the ones who finished the frame in order.
          if (completesFrame) {
            const b = window.setTimeout(() => setBuried(true), 1400);
            timers.current.push(b);
          }
        }
      }, 300 * (i + 1));
      timers.current.push(id);
    });
  };

  const zoomStyle = useMemo(() => {
    if (!active) return { transform: 'scale(1) translate(0%,0%)' };
    const cx = active.x + active.w / 2;
    const cy = active.y + active.h / 2;
    // Softer than it was. 2.2× used to snap; 1.9 settles.
    const scale = phase === 'idle' ? 1 : phase === 'track' ? 1.25 : 1.9;
    const tx = (0.5 - cx) * 100;
    const ty = (0.5 - cy) * 100;
    return {
      transform: `translate(${tx}%, ${ty}%) scale(${scale})`,
      transformOrigin: '50% 50%',
    };
  }, [active, phase]);

  if (!frames.length || !frame) return null;

  // Phones and coarse-pointer tablets get the archive as a gallery with a
  // full-screen tap-through session — not a shrunken control panel.
  if (tier === 'calm') {
    return (
      <section id="esper" className="relative py-20 px-5 bg-[#05060a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-[10px] tracking-[0.5em] uppercase text-[#00d4ff]/80 mb-3">
            — esper machine · photo archive
          </div>
          <h2 className="text-4xl font-mono font-light tracking-tight">
            enhance. enhance. <span className="text-[#e040fb]">enhance.</span>
          </h2>
          <p className="mt-3 text-[#8a837a] text-[15px] max-w-xl leading-relaxed">
            {frames.length} photographs and renders on file. open one and the
            machine will run the session: track, enhance, reveal.
          </p>
          <EsperMobile frames={frames} frameLines={frameLines} />
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} id="esper" className="relative py-24 px-6 md:px-10 bg-[#05060a]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <div className="text-[10px] tracking-[0.5em] uppercase text-[#00d4ff]/80 mb-3 flex items-center gap-3 flex-wrap">
              <span>— esper machine · photo enhancement unit</span>
              <span className="text-[#e040fb] tabular-nums tracking-[0.3em]">
                {String(frameIdx + 1).padStart(2, '0')}/{String(frames.length).padStart(2, '0')}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-mono font-light tracking-tight">
              enhance. enhance. <span className="text-[#e040fb]">enhance.</span>
            </h2>
            <p className="mt-3 text-[#8a837a] text-[15px] md:text-sm max-w-xl leading-relaxed">
              an interactive recreation of the esper session. pick a target on the frame. the machine will track, enhance, and reveal what the photograph has been hiding.
            </p>
          </div>

          <button
            type="button"
            onClick={reset}
            className="min-h-[44px] inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[#a8a29e] hover:text-[#00d4ff] border border-[#1f1c17] hover:border-[#00d4ff]/50 px-3 py-2 transition-colors"
            aria-label="reset esper"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            reset frame
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
          <div className="flex flex-col scroll-mt-16 lg:col-start-1 lg:row-start-1">
          <div className="relative border border-[#1f1c17] bg-black overflow-hidden aspect-[16/10] select-none">
            <motion.div
              className="absolute inset-0"
              animate={zoomStyle}
              transition={{
                duration: reduced ? 0 : phase === 'resolve' ? 1.6 : 1.1,
                ease: ESPER_EASE,
              }}
            >
              {/* Cross-fade, not mode="wait". mode="wait" holds the incoming
                  frame until the outgoing one has finished leaving, and a second
                  step landing inside that window desynced it — the counter and
                  caption read 06 while the photograph was still 05. Both images
                  are absolute inset-0, so overlapping them dissolves correctly
                  and every step lands on the frame it says it landed on. */}
              <AnimatePresence>
                <motion.img
                  key={frame.photoId}
                  src={photo}
                  alt={caption || 'esper frame'}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: frame.pos ?? '50% 50%' }}
                  draggable={false}
                  initial={{ opacity: 0, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(6px)' }}
                  transition={{ duration: reduced ? 0 : 0.45, ease: ESPER_EASE }}
                />
              </AnimatePresence>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.35) 2px 3px)',
                  mixBlendMode: 'multiply',
                  opacity: 0.55,
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.7) 100%)',
                }}
              />

              {activeHotspots.map((h) => {
                const isActive = active?.id === h.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => run(h)}
                    className={`absolute border transition-all duration-500 ${
                      isActive
                        ? 'border-[#e040fb]'
                        : 'border-[#00d4ff]/60 hover:border-[#00d4ff]'
                    }`}
                    style={{
                      left: `${h.x * 100}%`,
                      top: `${h.y * 100}%`,
                      width: `${h.w * 100}%`,
                      height: `${h.h * 100}%`,
                      boxShadow: isActive ? '0 0 20px rgba(224,64,251,0.55)' : undefined,
                    }}
                    aria-label={`enhance region ${h.order_index}`}
                  >
                    <span
                      className={`absolute left-0 text-[9px] tracking-[0.3em] uppercase whitespace-nowrap ${
                        // A node near the frame's top edge would push its label
                        // into the corner captions — hang it below instead.
                        h.y < 0.14 ? 'top-full mt-1.5' : '-top-6'
                      } ${isActive ? 'text-[#e040fb]' : 'text-[#00d4ff]'}`}
                    >
                      node·{String(h.order_index).padStart(2, '0')}
                    </span>
                    {isActive && (
                      <>
                        <span className="absolute -left-[3px] -top-[3px] w-2 h-2 bg-[#e040fb]" />
                        <span className="absolute -right-[3px] -top-[3px] w-2 h-2 bg-[#e040fb]" />
                        <span className="absolute -left-[3px] -bottom-[3px] w-2 h-2 bg-[#e040fb]" />
                        <span className="absolute -right-[3px] -bottom-[3px] w-2 h-2 bg-[#e040fb]" />
                      </>
                    )}
                  </button>
                );
              })}
            </motion.div>

            <div className="absolute left-3 top-3 right-3 flex items-center justify-between pointer-events-none">
              <div className="text-[9px] tracking-[0.4em] uppercase text-[#00d4ff]/80 bg-black/50 px-2 py-1 backdrop-blur-sm">
                {caption}
              </div>
              <div className="text-[9px] tracking-[0.4em] uppercase text-[#00d4ff]/80 bg-black/50 px-2 py-1 tabular-nums backdrop-blur-sm">
                esper · v9 · {phase}
              </div>
            </div>

            <AnimatePresence>
              {phase !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(0,212,255,0.05), transparent 15%, transparent 85%, rgba(224,64,251,0.06))',
                  }}
                />
              )}
            </AnimatePresence>
          </div>

          </div>

          <div ref={terminalRef} className="border border-[#1f1c17] bg-[#0a0a0d] p-5 flex flex-col min-h-[280px] md:min-h-[360px] scroll-mt-20 lg:col-start-2 lg:row-start-1 lg:row-span-2">
            <div className="flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase text-[#00d4ff] mb-4">
              <ScanSearch className="w-3.5 h-3.5" />
              operator terminal
            </div>

            <div className="flex-1 font-mono text-[13px] md:text-[11.5px] leading-relaxed text-[#c9b8a6] space-y-0.5 min-h-[120px] md:min-h-[180px]">
              {typed.map((l, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ color: i === typed.length - 1 && phase !== 'resolve' ? '#00d4ff' : '#c9b8a6' }}
                >
                  {l}
                </motion.div>
              ))}
              {!typed.length && (
                <div className="text-[#605a52]">
                  awaiting selection. click a node on the frame.
                </div>
              )}
              {phase !== 'idle' && phase !== 'resolve' && (
                <span className="inline-block w-2 h-3 align-middle bg-[#00d4ff] animate-pulse" />
              )}
            </div>

            <AnimatePresence mode="wait">
              {phase === 'resolve' && active && (
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mt-5 border-t border-[#1f1c17] pt-4"
                >
                  <div className="text-[9px] tracking-[0.4em] uppercase text-[#e040fb] mb-2">
                    // reveal · node-{String(active.order_index).padStart(2, '0')}
                  </div>
                  <p className="font-serif text-[17px] md:text-lg text-[#e8e4dc] leading-[1.65] md:leading-snug">
                    {active.reveal}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {buried && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.92 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2 }}
                  className="mt-4 border-t border-[#e040fb]/20 pt-4 font-mono text-[12.5px] md:text-[10.5px] leading-relaxed text-[#6b6660] space-y-0.5"
                  style={{ textShadow: '0 0 8px rgba(224,64,251,0.25)' }}
                >
                  {buriedLines.map((l, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.25 * i }}
                      className={i >= 2 && i <= 4 ? 'text-[#c9b8a6]' : undefined}
                    >
                      {l}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-5 pt-4 border-t border-[#1f1c17] flex flex-wrap gap-2">
              {activeHotspots.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => run(h)}
                  className={`min-h-[44px] text-[10px] tracking-[0.3em] uppercase border px-3 py-1.5 transition-colors ${
                    active?.id === h.id
                      ? 'border-[#e040fb] text-[#e040fb]'
                      : 'border-[#1f1c17] text-[#a8a29e] hover:border-[#00d4ff]/50 hover:text-[#00d4ff]'
                  }`}
                >
                  node·{String(h.order_index).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

          {/* Manual only. On phones the pager sits BELOW the output — frame, button,
              reveal, then navigation. Reading beats steering. */}
          <div className="flex items-center justify-between gap-4 font-mono text-[10px] tracking-[0.3em] uppercase lg:col-start-1 lg:row-start-2">
            <button
              type="button"
              onClick={() => goToFrame(frameIdx - 1)}
              aria-label="Previous frame"
              className="min-h-[44px] flex items-center gap-2 px-4 py-2 border border-[#1f1c17] text-[#00d4ff] hover:border-[#00d4ff] transition-colors"
            >
              <ChevronLeft size={14} /> prev
            </button>

            <div className="flex items-center gap-2 flex-wrap justify-center" role="tablist" aria-label="Esper frames">
              {frames.map((f, i) => (
                <button
                  key={f.photoId}
                  type="button"
                  role="tab"
                  aria-selected={i === frameIdx}
                  aria-label={`Frame ${i + 1}: ${f.caption || f.photoId}`}
                  onClick={() => goToFrame(i)}
                  className="min-h-[44px] min-w-[24px] flex items-center justify-center group/dot"
                >
                  {/* visual bar stays slim; the button supplies the 44px hit area */}
                  <span
                    aria-hidden
                    className={`h-1.5 transition-all ${
                      i === frameIdx ? 'w-6 bg-[#e040fb]' : 'w-1.5 bg-[#605a52] group-hover/dot:bg-[#00d4ff]'
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => goToFrame(frameIdx + 1)}
              aria-label="Next frame"
              className="min-h-[44px] flex items-center gap-2 px-4 py-2 border border-[#1f1c17] text-[#00d4ff] hover:border-[#00d4ff] transition-colors"
            >
              next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

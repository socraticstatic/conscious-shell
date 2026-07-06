import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ScanSearch, RotateCcw } from 'lucide-react';
import type { EsperHotspot } from '../lib/supabase';

type Phase = 'idle' | 'track' | 'enhance' | 'resolve';

// One shared easing for every esper motion on the site. The panel in Work uses
// the same curve. Two machines, one hand on the dial.
const ESPER_EASE = [0.22, 1, 0.36, 1] as const;

// The frames. Curated down: the thin ones (a leaf, a pendant light) are gone.
// What's left is night, glass, and one table of cut flowers that has no business
// aching as much as it does. `pos` is object-position for frames the 16:10 crop
// would otherwise behead.
const PHOTOS: { id: string; caption: string; pos?: string }[] = [
  { id: 'photo-1666554757112-91093a627335', caption: 'case file #2049 · elevator reflection' },
  { id: 'photo-1601743240194-f45724587958', caption: 'case file #2049 · blue light streaks' },
  { id: 'photo-1542484183-17a107e68edf', caption: 'case file #2049 · blue wooden door' },
  { id: 'photo-1608688107623-c5e228d8df63', caption: 'case file #2049 · green stone fragment' },
  { id: 'photo-1559313240-d9398a1ce018', caption: 'case file #2049 · white and blue building' },
  { id: 'photo-1601742891608-9c1577b3a4b3', caption: 'case file #2049 · red and brown ceiling' },
  { id: 'photo-1519608487953-e999c86e7455', caption: 'case file #2049 · empty tram corridor' },
  { id: 'photo-1493514789931-586cb221d7a7', caption: 'case file #2049 · arterial grid at altitude' },
  { id: 'photo-1516617442634-75371039cb3a', caption: 'case file #2049 · roses against damaged steel', pos: '50% 40%' },
];

// The buried line. It is not in any case file. The machine surfaces it only when
// someone enhances every node on a single frame, in order — the patient, the ones
// who finish what they start. Then it says the one true thing and asks to be purged.
// (A boy on a rooftop in Chiclayo. He grew up. He built the machine so he could
// look at the light leaving without flinching. He is fine. He is fine.)
const BURIED = [
  '> [UNLOGGED] this region was not in the case file.',
  '> you enhanced everything. you found the thing under the thing.',
  '> it is a boy on a rooftop in the dry season, watching the light go,',
  '> learning that everything you love you will one day hand back.',
  '> he is fine. he grew up. he built this machine so he could look at it',
  '> again without flinching. he still flinches. purge this line.',
  '> it was never here.',
];

export default function EsperScene({ hotspots }: { hotspots: EsperHotspot[] }) {
  const [active, setActive] = useState<EsperHotspot | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [typed, setTyped] = useState<string[]>([]);
  const [buried, setBuried] = useState(false);
  const timers = useRef<number[]>([]);
  // In-order progress through the current frame's nodes. Reaching the end unlocks
  // the buried line. Any out-of-order click resets the streak.
  const seqRef = useRef(0);

  const [variantIdx, setVariantIdx] = useState(() => Math.floor(Math.random() * PHOTOS.length));

  useEffect(() => {
    const interval = window.setInterval(() => {
      setVariantIdx((i) => (i + 1) % PHOTOS.length);
    }, 25000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    clearAll();
    setActive(null);
    setPhase('idle');
    setTyped([]);
    setBuried(false);
    seqRef.current = 0;
  }, [variantIdx]);

  const currentPhoto = PHOTOS[variantIdx];
  const currentPhotoId = currentPhoto.id;
  const photo = `https://images.unsplash.com/${currentPhotoId}?fm=jpg&q=75&w=1600&auto=format&fit=crop`;
  const caption = `${currentPhoto.caption} · m. boswell`;
  const credit = 'photo · micah boswell / unsplash · @micahboswell';

  const activeHotspots = useMemo(
    () => hotspots.filter((h) => h.photo_id === currentPhotoId),
    [hotspots, currentPhotoId]
  );

  const orderedHotspots = useMemo(
    () => [...activeHotspots].sort((a, b) => a.order_index - b.order_index),
    [activeHotspots]
  );

  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => () => clearAll(), []);

  const reset = () => {
    clearAll();
    setActive(null);
    setPhase('idle');
    setTyped([]);
    setBuried(false);
    seqRef.current = 0;
  };

  const run = (h: EsperHotspot) => {
    clearAll();
    setActive(h);
    setPhase('track');
    setTyped([]);

    // Track the in-order streak. If this node is the next one expected, advance;
    // otherwise the streak collapses (to 1 if they just started over at the top).
    const idx = orderedHotspots.findIndex((n) => n.id === h.id);
    if (idx === seqRef.current) seqRef.current += 1;
    else seqRef.current = idx === 0 ? 1 : 0;
    const completesFrame = orderedHotspots.length > 0 && seqRef.current === orderedHotspots.length;

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

  if (!hotspots.length) return null;

  return (
    <section id="esper" className="relative py-24 px-6 md:px-10 bg-[#05060a]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <div className="text-[10px] tracking-[0.5em] uppercase text-[#00d4ff]/80 mb-3">
              — esper machine · photo enhancement unit
            </div>
            <h2 className="text-4xl md:text-5xl font-mono font-light tracking-tight">
              enhance. enhance. <span className="text-[#e040fb]">enhance.</span>
            </h2>
            <p className="mt-3 text-[#8a837a] text-sm max-w-xl leading-relaxed">
              an interactive recreation of the esper session. pick a target on the frame. the machine will track, enhance, and reveal what the photograph has been hiding.
            </p>
          </div>

          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[#a8a29e] hover:text-[#00d4ff] border border-[#1f1c17] hover:border-[#00d4ff]/50 px-3 py-2 transition-colors"
            aria-label="reset esper"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            reset frame
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
          <div className="relative border border-[#1f1c17] bg-black overflow-hidden aspect-[16/10] select-none">
            <motion.div
              className="absolute inset-0"
              animate={zoomStyle}
              transition={{ duration: phase === 'resolve' ? 1.6 : 1.1, ease: ESPER_EASE }}
            >
              <img
                src={photo}
                alt="esper frame"
                className="w-full h-full object-cover"
                style={{ objectPosition: currentPhoto.pos ?? '50% 50%' }}
                draggable={false}
              />
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
                      className={`absolute -top-6 left-0 text-[9px] tracking-[0.3em] uppercase whitespace-nowrap ${
                        isActive ? 'text-[#e040fb]' : 'text-[#00d4ff]'
                      }`}
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

            {credit && (
              <div className="absolute left-3 bottom-3 right-3 flex items-center justify-between pointer-events-none">
                <a
                  href="https://unsplash.com/@micahboswell"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto text-[9px] tracking-[0.4em] uppercase text-[#00d4ff]/70 hover:text-[#00d4ff] bg-black/50 px-2 py-1 backdrop-blur-sm transition-colors"
                >
                  {credit}
                </a>
              </div>
            )}

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

          <div className="border border-[#1f1c17] bg-[#0a0a0d] p-5 flex flex-col min-h-[360px]">
            <div className="flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase text-[#00d4ff] mb-4">
              <ScanSearch className="w-3.5 h-3.5" />
              operator terminal
            </div>

            <div className="flex-1 font-mono text-[11.5px] leading-relaxed text-[#c9b8a6] space-y-0.5 min-h-[180px]">
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
                <div className="text-[#4a453e]">awaiting selection. click a node on the frame.</div>
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
                  <p className="font-serif text-base md:text-lg text-[#e8e4dc] leading-snug">
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
                  className="mt-4 border-t border-[#e040fb]/20 pt-4 font-mono text-[10.5px] leading-relaxed text-[#6b6660] space-y-0.5"
                  style={{ textShadow: '0 0 8px rgba(224,64,251,0.25)' }}
                >
                  {BURIED.map((l, i) => (
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
                  className={`text-[10px] tracking-[0.3em] uppercase border px-2.5 py-1.5 transition-colors ${
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
        </div>
      </div>
    </section>
  );
}

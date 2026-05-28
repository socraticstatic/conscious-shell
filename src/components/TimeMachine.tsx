import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeader } from './Work';

type Plate = {
  year: number;
  era_label: string;
  captured_at: string;
  note: string;
  src: string;
};

// Six hand-picked snapshots of conscious-shell across the years. Lives
// in /public/archive so it ships with the build — no Archive.org wait,
// no temporal-plate "developing" state, no missing frames.
const PLATES: Plate[] = [
  {
    year: 2000,
    era_label: 'tables & gifs',
    captured_at: '2000-10-24',
    note: 'online galleries · usability consulting · personal information feed',
    src: `${import.meta.env.BASE_URL}archive/2000.png`,
  },
  {
    year: 2002,
    era_label: 'post-dotcom',
    captured_at: '2002-09-16',
    note: 'grey grid · mp3 jukebox · poems on the homepage',
    src: `${import.meta.env.BASE_URL}archive/2002.png`,
  },
  {
    year: 2005,
    era_label: 'tenth anniversary',
    captured_at: '2005-01-25',
    note: 'celebration redesign · ten years online · the portal',
    src: `${import.meta.env.BASE_URL}archive/2005.png`,
  },
  {
    year: 2006,
    era_label: 'gradients & glass',
    captured_at: '2006-11-28',
    note: 'cs mark · wave + sepia · peer testimonials',
    src: `${import.meta.env.BASE_URL}archive/2006.png`,
  },
  {
    year: 2009,
    era_label: 'golden mean',
    captured_at: '2009-03-12',
    note: 'orange spiral · photo grid · kabbalah notes',
    src: `${import.meta.env.BASE_URL}archive/2009.png`,
  },
  {
    year: 2014,
    era_label: 'social era',
    captured_at: '2014-05-17',
    note: 'flat design · cs serif · twitter, vimeo, pinterest, g+',
    src: `${import.meta.env.BASE_URL}archive/2014.png`,
  },
];

export default function TimeMachine() {
  const sorted = useMemo(() => [...PLATES].sort((a, b) => a.year - b.year), []);
  const [idx, setIdx] = useState(0);

  const current = sorted[idx];
  const minYear = sorted[0].year;
  const maxYear = sorted[sorted.length - 1].year;
  const pct = ((current.year - minYear) / Math.max(1, maxYear - minYear)) * 100;

  const step = (dir: number) =>
    setIdx((i) => Math.max(0, Math.min(sorted.length - 1, i + dir)));

  return (
    <section id="time" className="relative py-20 md:py-28 border-b border-[#1f1c17]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">
        <SectionHeader
          path="archive --local /conscious-shell"
          jp="時間旅行"
          count={sorted.length}
          right={`t=${current.captured_at}`}
        />

        <div className="mt-8 grid grid-cols-12 gap-4">
          {/* Year marquee / scrubber */}
          <div className="col-span-12 border border-[#1f1c17] bg-[#0b0a08]/60">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#1f1c17] text-[10px]">
              <span className="flex items-center gap-2 text-[#e7b766]">
                <span className="w-1.5 h-1.5 bg-[#e7b766] animate-pulse" />
                TEMPORAL ARCHIVE — {sorted.length} SNAPSHOTS OF CONSCIOUS-SHELL
              </span>
              <span className="text-[#5ec8d8] font-jp hidden md:inline">自分の過去</span>
            </div>

            <div className="px-4 pt-4 pb-2">
              <div className="flex items-end justify-between mb-3">
                <div className="flex items-baseline gap-4">
                  <motion.div
                    key={current.year}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl sm:text-5xl md:text-7xl text-[#e7b766] tabular-nums leading-none chroma"
                  >
                    {current.year}
                  </motion.div>
                  <div className="text-xs text-[#6b6660]">
                    <div>era: <span className="text-[#e8e4dc]">{current.era_label}</span></div>
                    <div>captured: <span className="text-[#5ec8d8]">{current.captured_at}</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => step(-1)}
                    disabled={idx === 0}
                    className="px-2 py-1 border border-[#2a2620] text-[#a8a29e] hover:border-[#e7b766] hover:text-[#e7b766] active:border-[#e7b766] active:text-[#e7b766] disabled:opacity-30 disabled:hover:border-[#2a2620] disabled:hover:text-[#a8a29e] transition-colors text-[10px] sm:text-xs"
                  >
                    <span className="hidden sm:inline">← rewind</span>
                    <span className="sm:hidden">←</span>
                  </button>
                  <button
                    onClick={() => step(1)}
                    disabled={idx === sorted.length - 1}
                    className="px-2 py-1 border border-[#2a2620] text-[#a8a29e] hover:border-[#e7b766] hover:text-[#e7b766] active:border-[#e7b766] active:text-[#e7b766] disabled:opacity-30 disabled:hover:border-[#2a2620] disabled:hover:text-[#a8a29e] transition-colors text-[10px] sm:text-xs"
                  >
                    <span className="hidden sm:inline">forward →</span>
                    <span className="sm:hidden">→</span>
                  </button>
                </div>
              </div>

              {/* Tick track */}
              <div className="relative h-10 select-none">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-[#1f1c17]" />
                <motion.div
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.35 }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-px bg-[#e7b766]"
                  style={{ boxShadow: '0 0 6px #e7b766' }}
                />
                {sorted.map((c, i) => {
                  const p = ((c.year - minYear) / Math.max(1, maxYear - minYear)) * 100;
                  const active = i === idx;
                  return (
                    <button
                      key={c.year}
                      onClick={() => setIdx(i)}
                      style={{ left: `${p}%` }}
                      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 group"
                      aria-label={`view ${c.year}`}
                    >
                      <span
                        className={`block w-[2px] h-3 transition-all ${
                          active ? 'bg-[#e7b766] h-5' : 'bg-[#3a342c] group-hover:bg-[#5ec8d8]'
                        }`}
                      />
                      <span
                        className={`absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[9px] tabular-nums transition-colors ${
                          active ? 'text-[#e7b766]' : 'text-[#4a453e] group-hover:text-[#5ec8d8]'
                        }`}
                      >
                        {String(c.year).slice(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Viewport */}
          <div className="col-span-12 lg:col-span-9 relative border border-[#e7b766]/40 bg-[#07070a] overflow-hidden aspect-[16/10]">
            <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-3 py-1.5 text-[10px] bg-[#0b0a08]/90 border-b border-[#e7b766]/30">
              <div className="flex items-center gap-2 text-[#e7b766]">
                <span className="w-1.5 h-1.5 bg-[#ff7a5c] animate-pulse rounded-full" />
                <span>ARCHIVE PLATE — conscious-shell.{current.year}</span>
              </div>
              <div className="text-[#5ec8d8] hidden sm:block">● DEVELOPED</div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current.year}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 pt-6"
              >
                <img
                  src={current.src}
                  alt={`conscious-shell.com in ${current.year}`}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover object-top bg-[#0a0908]"
                />

                {/* scan + vignette overlays so plates sit in the BR aesthetic */}
                <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-30"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 1px, transparent 1px 3px)',
                  }}
                />
                <div className="pointer-events-none absolute inset-0"
                  style={{
                    background: 'linear-gradient(180deg, rgba(231,183,102,0.06) 0%, transparent 30%, transparent 70%, rgba(7,7,10,0.5) 100%)',
                  }}
                />
              </motion.div>
            </AnimatePresence>

            {/* corner reticles */}
            <span className="absolute top-7 left-1 w-3 h-px bg-[#e7b766]" />
            <span className="absolute top-7 left-1 h-3 w-px bg-[#e7b766]" />
            <span className="absolute top-7 right-1 w-3 h-px bg-[#e7b766]" />
            <span className="absolute top-7 right-1 h-3 w-px bg-[#e7b766]" />
            <span className="absolute bottom-1 left-1 w-3 h-px bg-[#e7b766]" />
            <span className="absolute bottom-1 left-1 h-3 w-px bg-[#e7b766]" />
            <span className="absolute bottom-1 right-1 w-3 h-px bg-[#e7b766]" />
            <span className="absolute bottom-1 right-1 h-3 w-px bg-[#e7b766]" />

            <div className="absolute bottom-0 inset-x-0 z-10 px-3 py-1.5 text-[10px] bg-[#0b0a08]/90 border-t border-[#e7b766]/30 flex items-center justify-between">
              <span className="text-[#6b6660] truncate">{current.note}</span>
              <span className="text-[#5ec8d8] hidden sm:inline">local plate</span>
            </div>
          </div>

          {/* Year index */}
          <div className="col-span-12 lg:col-span-3 border border-[#1f1c17] bg-[#0b0a08]/60 flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#1f1c17] text-[10px]">
              <span className="text-[#e7b766]">CAPTURE INDEX</span>
              <span className="font-jp text-[#5ec8d8]">記録</span>
            </div>
            <ul className="divide-y divide-dashed divide-[#1f1c17] text-xs overflow-y-auto">
              {sorted.map((c, i) => (
                <li key={c.year}>
                  <button
                    onClick={() => setIdx(i)}
                    className={`w-full text-left px-3 py-2 flex items-baseline justify-between gap-2 transition-colors ${
                      i === idx
                        ? 'bg-[#1a1712] text-[#e7b766]'
                        : 'text-[#a8a29e] hover:bg-[#121008] hover:text-[#e8e4dc]'
                    }`}
                  >
                    <span className="tabular-nums">{c.year}</span>
                    <span className="text-[10px] text-[#4a453e] truncate">{c.era_label}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="px-3 py-2 border-t border-[#1f1c17] text-[10px] text-[#4a453e]">
              src: /archive · {sorted.length} frames
            </div>
          </div>
        </div>

        <div className="mt-4 text-[11px] text-[#4a453e] leading-relaxed">
          # six snapshots from the personal archive — same domain, different decade.
          <br /># conscious-shell has been online since 1995; these are the surviving plates.
        </div>
      </div>
    </section>
  );
}

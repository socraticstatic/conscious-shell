import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeader } from './Work';
import { screenshotUrl, sortCaptures } from '../lib/timeline';
import type { ArchiveCapture } from '../lib/supabase';

export default function TimeMachine({ captures }: { captures: ArchiveCapture[] }) {
  const sorted = useMemo(() => sortCaptures(captures), [captures]);
  const [idx, setIdx] = useState(0);

  if (!sorted.length) return null;

  const current = sorted[idx];
  const imgSrc = screenshotUrl(current);
  const minYear = sorted[0].year;
  const maxYear = sorted[sorted.length - 1].year;
  const pct = ((current.year - minYear) / Math.max(1, maxYear - minYear)) * 100;

  const step = (dir: number) =>
    setIdx((i) => Math.max(0, Math.min(sorted.length - 1, i + dir)));

  return (
    <section id="time" className="relative py-20 md:py-28 border-b border-[#1f1c17]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader
          path="wayback --unroll /conscious-shell"
          jp="時間旅行"
          count={sorted.length}
          right={`year=${current.year}`}
        />

        <div className="mt-8 grid grid-cols-12 gap-4">
          {/* Scrubber */}
          <div className="col-span-12 border border-[#1f1c17] bg-[#0b0a08]/60">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#1f1c17] text-[10px]">
              <span className="flex items-center gap-2 text-[#e7b766]">
                <span className="w-1.5 h-1.5 bg-[#e7b766] animate-pulse" />
                TEMPORAL ARCHIVE — 25 YEARS OF CONSCIOUS-SHELL
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
                    className="text-5xl md:text-7xl text-[#e7b766] tabular-nums leading-none chroma"
                  >
                    {current.year}
                  </motion.div>
                  <div className="text-xs text-[#6b6660]">
                    <div>era: <span className="text-[#e8e4dc]">{current.era_label}</span></div>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => step(-1)}
                    disabled={idx === 0}
                    className="px-2 py-1 border border-[#2a2620] text-[#a8a29e] hover:border-[#e7b766] hover:text-[#e7b766] disabled:opacity-30 transition-colors text-xs"
                  >
                    ← rewind
                  </button>
                  <button
                    onClick={() => step(1)}
                    disabled={idx === sorted.length - 1}
                    className="px-2 py-1 border border-[#2a2620] text-[#a8a29e] hover:border-[#e7b766] hover:text-[#e7b766] disabled:opacity-30 transition-colors text-xs"
                  >
                    forward →
                  </button>
                </div>
              </div>

              {/* Year scrub bar */}
              <div className="relative h-1 bg-[#1f1c17] mt-2 mb-1">
                <div className="absolute h-full bg-[#e7b766]" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-[9px] text-[#4a453e] font-mono">
                <span>{minYear}</span>
                <span>{maxYear}</span>
              </div>
            </div>
          </div>

          {/* Year pills */}
          <div className="col-span-12 flex flex-wrap gap-1.5 pt-1">
            {sorted.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setIdx(i)}
                className={`px-2.5 py-1 text-[10px] font-mono border transition-colors ${
                  i === idx
                    ? 'border-[#e7b766] text-[#e7b766] bg-[#e7b766]/10'
                    : 'border-[#2a2620] text-[#4a453e] hover:border-[#a8a29e] hover:text-[#a8a29e]'
                }`}
              >
                {c.year}
              </button>
            ))}
          </div>

          {/* Screenshot display */}
          <div className="col-span-12 md:col-span-9 border border-[#1f1c17] bg-[#0b0a08] min-h-[320px] md:min-h-[500px] flex items-center justify-center relative overflow-hidden">
            <AnimatePresence mode="wait">
              {imgSrc ? (
                <motion.img
                  key={current.id}
                  src={imgSrc}
                  alt={`conscious-shell.com — ${current.year}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <motion.div
                  key={`no-img-${current.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-[#4a453e] font-mono text-xs p-8"
                >
                  <div className="text-[#e7b766] text-2xl mb-3">{current.year}</div>
                  <div>[ capture not available ]</div>
                  {current.era_label && <div className="mt-1 text-[#6b6660]">era: {current.era_label}</div>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Metadata sidebar */}
          <div className="col-span-12 md:col-span-3 border border-[#1f1c17] bg-[#0b0a08]/60 p-4 font-mono text-[10px] space-y-3">
            <div>
              <div className="text-[#4a453e] mb-0.5">YEAR</div>
              <div className="text-[#e7b766] text-lg">{current.year}</div>
            </div>
            <div>
              <div className="text-[#4a453e] mb-0.5">ERA</div>
              <div className="text-[#e8e4dc]">{current.era_label || '—'}</div>
            </div>
            <div>
              <div className="text-[#4a453e] mb-0.5">ORIGINAL URL</div>
              {current.original_url ? (
                <a
                  href={current.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5ec8d8] hover:text-[#7dd8e8] break-all"
                >
                  {current.original_url}
                </a>
              ) : (
                <span className="text-[#6b6660]">—</span>
              )}
            </div>
            {current.wayback_url && (
              <div>
                <div className="text-[#4a453e] mb-0.5">WAYBACK</div>
                <a
                  href={current.wayback_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5ec8d8] hover:text-[#7dd8e8] break-all"
                >
                  view archive →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

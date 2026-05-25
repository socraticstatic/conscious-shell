import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, BookOpen, Bot, Briefcase, Calendar, Clapperboard, Code, Coffee,
  Database, Disc, DollarSign, Feather, Film, Flame, Ghost, Globe, GraduationCap,
  MapPin, MessageSquare, Music, Package, Palette, PenTool, Radio, Server,
  TrendingDown, Users,
  type LucideIcon,
} from 'lucide-react';
import { SectionHeader } from './Work';
import ScrambleText from './ScrambleText';
import type { Trivia } from '../lib/supabase';

const GLYPHS: Record<string, LucideIcon> = {
  'globe': Globe,
  'map-pin': MapPin,
  'graduation-cap': GraduationCap,
  'calendar': Calendar,
  'package': Package,
  'users': Users,
  'dollar-sign': DollarSign,
  'trending-down': TrendingDown,
  'briefcase': Briefcase,
  'message-square': MessageSquare,
  'code': Code,
  'pen-tool': PenTool,
  'coffee': Coffee,
  'feather': Feather,
  'film': Film,
  'clapperboard': Clapperboard,
  'book-open': BookOpen,
  'database': Database,
  'radio': Radio,
  'bot': Bot,
  'server': Server,
  'award': Award,
  'disc': Disc,
  'palette': Palette,
  'flame': Flame,
  'ghost': Ghost,
  'music': Music,
};

const CATEGORY_ORDER: Array<[string, string]> = [
  ['origin', 'origin.log'],
  ['numbers', 'receipts.csv'],
  ['languages', 'tongues.txt'],
  ['rituals', 'rituals.sh'],
  ['shipped', 'shipped.md'],
  ['quirks', 'quirks.env'],
  ['mourning', 'mourning.rite'],
];

export default function HumanLayer({ trivia }: { trivia: Trivia[] }) {
  const [active, setActive] = useState<string>('origin');

  const grouped = useMemo(() => {
    const map = new Map<string, Trivia[]>();
    for (const t of trivia) {
      const arr = map.get(t.category) ?? [];
      arr.push(t);
      map.set(t.category, arr);
    }
    return map;
  }, [trivia]);

  const tabs = CATEGORY_ORDER.filter(([cat]) => (grouped.get(cat)?.length ?? 0) > 0);
  const rows = grouped.get(active) ?? [];

  return (
    <section id="dossier" className="relative py-20 md:py-28 border-b border-[#1f1c17]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader
          path="cat /dossier/human_layer.md"
          jp="人間の層"
          right={`${trivia.length} facts · unclassified`}
        />

        <div className="mt-10 grid grid-cols-12 gap-6">
          <aside className="col-span-12 md:col-span-3">
            <div className="text-[11px] text-[#6b6660] mb-3 uppercase tracking-widest">
              # categories
            </div>
            <ul className="border border-[#1f1c17] divide-y divide-[#1f1c17] bg-[#0b0a08]">
              {tabs.map(([cat, file]) => {
                const count = grouped.get(cat)?.length ?? 0;
                const isActive = cat === active;
                return (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => setActive(cat)}
                      className={`w-full text-left px-4 py-3 flex items-baseline justify-between gap-3 transition-colors ${
                        isActive
                          ? 'bg-[#14110d] text-[#e7b766]'
                          : 'text-[#a8a29e] hover:bg-[#0f0d0a] hover:text-[#e8e4dc]'
                      }`}
                    >
                      <span className="text-sm">
                        <span className="text-[#4a453e] mr-2">{isActive ? '▸' : '·'}</span>
                        {file}
                      </span>
                      <span className="text-[10px] tabular-nums text-[#4a453e]">
                        {String(count).padStart(2, '0')}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 text-[11px] text-[#4a453e] leading-5">
              <div># signal vs noise</div>
              <div className="text-[#6b6660]">
                human layer is a dossier — the things that do not fit on a
                resume but still ship.
              </div>
            </div>
          </aside>

          <div className="col-span-12 md:col-span-9">
            <div className="border border-[#1f1c17] bg-[#0b0a08]">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#1f1c17] text-[11px] text-[#6b6660]">
                <span className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#e7b766] animate-pulse" />
                  ~/dossier/{active}.view
                </span>
                <span className="tabular-nums">
                  {String(rows.length).padStart(2, '0')} entries
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.ul
                  key={active}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="divide-y divide-dashed divide-[#1f1c17]"
                >
                  {rows.map((row, i) => {
                    const Icon = GLYPHS[row.glyph] ?? Feather;
                    return (
                      <motion.li
                        key={row.id}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.04 }}
                        className="px-4 md:px-6 py-5 grid grid-cols-12 gap-4 items-start group"
                      >
                        <div className="col-span-12 md:col-span-3 flex items-center gap-3">
                          <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 border border-[#1f1c17] bg-[#0f0d0a] text-[#e7b766] group-hover:border-[#e7b766]/40 transition-colors">
                            <Icon className="w-4 h-4" />
                          </span>
                          <span className="text-[11px] uppercase tracking-widest text-[#6b6660]">
                            {row.label}
                          </span>
                        </div>
                        <div className="col-span-12 md:col-span-9 text-[#e8e4dc] text-base md:text-lg leading-relaxed font-mono">
                          <span className="text-[#4a453e] mr-2">&gt;</span>
                          <ScrambleText
                            text={row.value}
                            trigger={active}
                            durationMs={700 + i * 60}
                          />
                        </div>
                      </motion.li>
                    );
                  })}

                  {rows.length === 0 && (
                    <li className="px-6 py-10 text-center text-[#6b6660] text-sm">
                      # no records in this view.
                    </li>
                  )}
                </motion.ul>
              </AnimatePresence>

              <div className="px-4 py-2 border-t border-[#1f1c17] text-[10px] text-[#4a453e] flex items-center justify-between">
                <span>end of view · press next category to continue</span>
                <span className="tabular-nums">EOF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

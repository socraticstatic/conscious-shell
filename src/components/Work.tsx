import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import EsperPanel from './EsperPanel';
import type { Project } from '../lib/supabase';

export default function Work({ projects }: { projects: Project[] }) {
  const featured = projects.filter((p) => p.featured);
  const [active, setActive] = useState<Project | null>(null);

  useEffect(() => {
    if (!active && featured[0]) setActive(featured[0]);
  }, [featured, active]);

  return (
    <section id="work" className="relative py-20 md:py-28 border-b border-[#1f1c17]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader path="/work/featured" jp="セレクト・ワーク" count={featured.length} right="esper_mode=auto" />

        <div className="grid grid-cols-12 gap-6 md:gap-10 mt-10">
          <ul className="col-span-12 lg:col-span-7 border-t border-[#1f1c17]">
            {featured.map((p, i) => (
              <ProjectRow
                key={p.id}
                project={p}
                index={i}
                onFocus={() => setActive(p)}
                active={active?.id === p.id}
              />
            ))}
          </ul>

          <div className="col-span-12 lg:col-span-5 lg:sticky lg:top-20 self-start">
            <EsperPanel project={active} />
            <div className="mt-3 grid grid-cols-3 gap-px bg-[#1f1c17] border border-[#1f1c17] text-[10px]">
              <Stat k="subject" v={active ? active.client : '—'} />
              <Stat k="role" v={active ? active.role : '—'} />
              <Stat k="year" v={active ? active.year : '—'} accent />
            </div>
            {active?.summary && (
              <div className="mt-3 text-xs text-[#a8a29e] leading-relaxed">
                <span className="text-[#4a453e]">// </span>
                {active.summary}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="bg-[#0b0a08] px-3 py-2">
      <div className="text-[9px] text-[#6b6660] uppercase tracking-wider">{k}</div>
      <div className={`mt-0.5 truncate ${accent ? 'text-[#5ec8d8]' : 'text-[#e8e4dc]'}`}>{v}</div>
    </div>
  );
}

function ProjectRow({
  project,
  index,
  onFocus,
  active,
}: {
  project: Project;
  index: number;
  onFocus: () => void;
  active: boolean;
}) {
  return (
    <motion.li
      data-cursor="hover"
      onMouseEnter={onFocus}
      onClick={onFocus}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className={`relative grid grid-cols-12 gap-3 md:gap-6 items-center py-6 md:py-7 border-b border-[#1f1c17] cursor-pointer transition-colors ${
        active ? 'bg-[#0f0e0b]' : 'hover:bg-[#0f0e0b]/60'
      }`}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-px transition-colors ${
          active ? 'bg-[#e7b766]' : 'bg-transparent'
        }`}
      />
      <div
        className={`col-span-2 md:col-span-1 text-xs tabular-nums transition-colors pl-2 ${
          active ? 'text-[#e7b766]' : 'text-[#4a453e]'
        }`}
      >
        {String(index + 1).padStart(2, '0')}
      </div>
      <div className="col-span-10 md:col-span-7">
        <div className="text-[11px] text-[#6b6660] mb-1 flex gap-2">
          <span>./{project.role.toLowerCase().replace(/\s+/g, '_')}</span>
          <span className="text-[#4a453e]">·</span>
          <span>{project.client}</span>
        </div>
        <div
          className={`text-xl md:text-3xl lg:text-4xl leading-tight transition-colors ${
            active ? 'text-[#e7b766]' : 'text-[#e8e4dc]'
          }`}
        >
          {project.title}
        </div>
      </div>
      <div className="hidden md:flex col-span-3 text-[10px] text-[#6b6660] flex-wrap gap-1">
        {project.tags.slice(0, 3).map((t) => (
          <span key={t} className="border border-[#2a2620] px-1.5 py-0.5">
            {t}
          </span>
        ))}
      </div>
      <div className="col-span-12 md:col-span-1 flex md:justify-end items-center gap-2">
        <span className={`text-xs tabular-nums ${active ? 'text-[#5ec8d8]' : 'text-[#a8a29e]'}`}>
          {project.year}
        </span>
      </div>
    </motion.li>
  );
}

export function SectionHeader({
  path,
  jp,
  count,
  right,
}: {
  path: string;
  jp?: string;
  count?: number;
  right?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between gap-4 text-xs flex-wrap"
    >
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[#e7b766]">$</span>
        <span className="text-[#e8e4dc]">ls -la {path}</span>
        {jp && <span className="font-jp text-[#5ec8d8]/80 text-[11px]">— {jp}</span>}
        {typeof count === 'number' && (
          <span className="text-[#6b6660]">
            ({String(count).padStart(2, '0')} {count === 1 ? 'entry' : 'entries'})
          </span>
        )}
      </div>
      {right && <span className="text-[#6b6660]">{right}</span>}
    </motion.div>
  );
}

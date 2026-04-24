import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { SectionHeader } from './Work';
import type { Project } from '../lib/supabase';

export default function IndexList({ projects }: { projects: Project[] }) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    if (!q.trim()) return projects;
    const n = q.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(n) ||
        p.client.toLowerCase().includes(n) ||
        p.role.toLowerCase().includes(n) ||
        p.tags.some((t) => t.toLowerCase().includes(n)),
    );
  }, [q, projects]);

  return (
    <section id="index" className="relative py-20 md:py-28 border-b border-[#1f1c17]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader path="/index" jp="完全記録" count={projects.length} right={`grep "${q || '.*'}" ${filtered.length}/${projects.length}`} />

        <div className="mt-6 flex items-center gap-3 border-b border-[#1f1c17] pb-3">
          <span className="text-[#e7b766]">$</span>
          <span className="text-[#6b6660]">grep</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="filter by title · client · tag"
            className="flex-1 bg-transparent outline-none text-[#e8e4dc] placeholder:text-[#4a453e] text-sm"
          />
          {q && (
            <button onClick={() => setQ('')} className="text-xs text-[#6b6660] hover:text-[#e7b766]">
              clear
            </button>
          )}
        </div>

        <div className="mt-2 text-[11px] text-[#4a453e] grid grid-cols-12 gap-3 md:gap-6 px-1 py-2 border-b border-[#1f1c17] uppercase tracking-wider">
          <div className="col-span-2 md:col-span-1">no</div>
          <div className="col-span-6 md:col-span-5">title</div>
          <div className="hidden md:block md:col-span-3">role</div>
          <div className="hidden md:block md:col-span-2">client</div>
          <div className="col-span-4 md:col-span-1 text-right">year</div>
        </div>

        <ul>
          {filtered.map((p, i) => (
            <Row key={p.id} project={p} index={i} />
          ))}
          {filtered.length === 0 && (
            <li className="py-6 text-sm text-[#6b6660]">[ no entries match — try another query ]</li>
          )}
        </ul>

        <div className="mt-6 text-xs text-[#4a453e]">
          # end of stream — {filtered.length} of {projects.length} displayed
        </div>
      </div>
    </section>
  );
}

function Row({ project, index }: { project: Project; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.5) }}
      className="group grid grid-cols-12 gap-3 md:gap-6 items-center py-3 border-b border-[#1f1c17] border-dashed hover:bg-[#141210] transition-colors"
      data-cursor="hover"
    >
      <div className="col-span-2 md:col-span-1 text-[11px] tabular-nums text-[#4a453e] group-hover:text-[#e7b766]">
        {String(index + 1).padStart(3, '0')}
      </div>
      <div className="col-span-6 md:col-span-5 text-sm md:text-base text-[#e8e4dc] group-hover:text-[#e7b766] transition-colors truncate">
        {project.title}
        {project.featured && <span className="ml-2 text-[10px] text-[#e7b766]">◉</span>}
      </div>
      <div className="hidden md:block md:col-span-3 text-xs text-[#a8a29e] truncate">{project.role}</div>
      <div className="hidden md:block md:col-span-2 text-xs text-[#6b6660] truncate">{project.client}</div>
      <div className="col-span-4 md:col-span-1 text-right text-xs tabular-nums text-[#a8a29e]">{project.year}</div>
    </motion.li>
  );
}

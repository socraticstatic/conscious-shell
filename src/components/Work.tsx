import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import EsperPanel from './EsperPanel';
import type { Project } from '../lib/supabase';

export default function Work({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<Project | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!active && projects[0]) setActive(projects[0]);
  }, [projects, active]);

  // Auto-advance the active project as rows scroll into view
  useEffect(() => {
    if (!projects.length || !listRef.current) return;
    const items = listRef.current.querySelectorAll<HTMLElement>('[data-project-id]');
    const map = new Map<string, Project>(projects.map((p) => [p.id, p]));

    const io = new IntersectionObserver(
      (entries) => {
        // Pick the most-visible entry that is crossing into view
        const visible = entries
          .filter((e) => e.isIntersecting && e.intersectionRatio >= 0.5)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const id = (visible[0].target as HTMLElement).dataset.projectId!;
          const p = map.get(id);
          if (p) setActive(p);
        }
      },
      { threshold: 0.5 }
    );

    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [projects]);

  return (
    <section id="work" className="relative py-20 md:py-28 border-b border-[#1f1c17]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">
        <SectionHeader path="/work" jp="全作品" count={projects.length} right="esper_mode=auto" />

        <div className="grid grid-cols-12 gap-6 md:gap-10 mt-10">
          <ul ref={listRef} className="col-span-12 lg:col-span-7 border-t border-[#1f1c17]">
            {projects.map((p, i) => (
              <ProjectRow
                key={p.id}
                project={p}
                index={i}
                onFocus={() => setActive(p)}
                active={active?.id === p.id}
              />
            ))}
          </ul>

          {/* Esper panel — desktop sticky preview. Hidden on mobile because
              each row already shows its own inline thumb. */}
          <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-20 self-start">
            <EsperPanel project={active} />
            <div className="mt-3 grid grid-cols-2 gap-px bg-[#1f1c17] border border-[#1f1c17] text-[10px]">
              <Stat k="subject" v={active ? active.client : '—'} />
              <Stat k="role" v={active ? active.role : '—'} accent />
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
      <div className={`mt-0.5 truncate ${accent ? 'text-[#00d4ff]' : 'text-[#e8e4dc]'}`}>{v}</div>
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
      data-project-id={project.id}
      onMouseEnter={onFocus}
      onClick={onFocus}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className={`relative py-5 md:py-7 px-3 md:px-0 border-b border-[#1f1c17] cursor-pointer transition-colors ${
        active ? 'bg-[#0f0e0b]' : 'hover:bg-[#0f0e0b]/60'
      }`}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-px transition-colors ${
          active ? 'bg-[#e040fb]' : 'bg-transparent'
        }`}
      />

      {/* Mobile: stacked card. Desktop: 12-col grid. */}
      <div className="md:hidden">
        <div className="flex items-baseline text-[11px] font-mono mb-2">
          <span className={active ? 'text-[#e040fb]' : 'text-[#4a453e]'}>
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
        <div className="text-[11px] text-[#a8a29e] mb-1.5 break-words">
          ./{project.role.toLowerCase().replace(/\s+/g, '_')}
          <span className="text-[#6b6660]"> · </span>
          {project.client}
        </div>
        <div className={`text-[22px] leading-tight font-light mb-3 break-words ${active ? 'text-[#e040fb]' : 'text-[#e8e4dc]'}`}>
          {project.title}
        </div>
        {project.image_url && (
          <div className="aspect-[16/10] bg-[#0a0908] border border-[#1f1c17] overflow-hidden mb-3">
            <img src={project.image_url} alt="" loading="lazy" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex flex-wrap gap-1.5 text-[10px] text-[#6b6660]">
          {project.tags.slice(0, 4).map((t) => (
            <span key={t} className="border border-[#2a2620] px-1.5 py-0.5 break-all">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="hidden md:grid md:grid-cols-12 md:gap-6 md:items-center">
        <div className={`md:col-span-1 text-xs tabular-nums transition-colors pl-2 ${active ? 'text-[#e040fb]' : 'text-[#4a453e]'}`}>
          {String(index + 1).padStart(2, '0')}
        </div>
        <div className="md:col-span-8 min-w-0">
          <div className="text-[11px] text-[#6b6660] mb-1 flex gap-2 flex-wrap">
            <span>./{project.role.toLowerCase().replace(/\s+/g, '_')}</span>
            <span className="text-[#4a453e]">·</span>
            <span>{project.client}</span>
          </div>
          <div className={`text-xl md:text-3xl lg:text-4xl leading-tight transition-colors ${active ? 'text-[#e040fb]' : 'text-[#e8e4dc]'}`}>
            {project.title}
          </div>
        </div>
        <div className="md:col-span-3 text-[10px] text-[#6b6660] flex flex-wrap gap-1">
          {project.tags.slice(0, 3).map((t) => (
            <span key={t} className="border border-[#2a2620] px-1.5 py-0.5">
              {t}
            </span>
          ))}
        </div>
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
        <span className="text-[#e040fb]">$</span>
        <span className="text-[#e8e4dc]">ls -la {path}</span>
        {jp && <span className="font-jp text-[#00d4ff]/80 text-[11px]">— {jp}</span>}
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

import { useEffect, useState } from 'react';
import EsperPanel from './EsperPanel';
import type { Project } from '../lib/supabase';

// Exported so other sections can import it — do NOT also import from here, just define it here.
export function SectionHeader({ path, jp, count, right }: {
  path: string; jp?: string; count?: number; right?: string;
}) {
  return (
    <div className="border border-[#1f1c17] mb-0">
      <div className="flex items-center justify-between px-4 py-2 text-[10px] font-mono">
        <div className="flex items-center gap-2 text-[#e7b766]">
          <span className="w-1.5 h-1.5 bg-[#e7b766] animate-pulse" />
          <span>{path}</span>
          {count !== undefined && <span className="text-[#4a453e]">({count})</span>}
        </div>
        <div className="flex items-center gap-3">
          {jp && <span className="text-[#5ec8d8] font-jp hidden md:inline">{jp}</span>}
          {right && <span className="text-[#4a453e]">{right}</span>}
        </div>
      </div>
    </div>
  );
}

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
              <li
                key={p.id}
                onMouseEnter={() => setActive(p)}
                onClick={() => setActive(p)}
                className={`flex items-start gap-4 py-4 px-2 border-b border-[#1f1c17] cursor-pointer transition-colors ${
                  active?.id === p.id ? 'bg-[#0f0e0b]' : 'hover:bg-[#0b0a08]'
                }`}
                data-cursor="hover"
              >
                <span className="text-[#4a453e] font-mono text-xs w-5 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm text-[#e8e4dc] truncate">{p.title}</span>
                    <span className="text-[10px] text-[#4a453e] font-mono shrink-0">{p.year}</span>
                  </div>
                  <div className="text-xs text-[#6b6660] mt-0.5">{p.client} · {p.role}</div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {p.tags.map((t) => (
                      <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 border border-[#2a2620] text-[#4a453e]">{t}</span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="col-span-12 lg:col-span-5 lg:sticky lg:top-20 self-start">
            <EsperPanel project={active} />
            {active?.summary && (
              <div className="mt-3 text-xs text-[#a8a29e] leading-relaxed border border-[#1f1c17] p-3">
                <span className="text-[#4a453e]">// </span>{active.summary}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

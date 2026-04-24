import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeader } from './Work';
import type { GithubProject } from '../lib/supabase';

type ViewMode = 'thumb' | 'live';

export default function GithubLab({ projects }: { projects: GithubProject[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<Record<string, ViewMode>>({});
  const [tag, setTag] = useState<string | 'all'>('all');

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((p) => p.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [projects]);

  const visible = useMemo(() => {
    const filtered = tag === 'all' ? projects : projects.filter((p) => p.tags.includes(tag));
    return [...filtered].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [projects, tag]);

  const active = activeId ? projects.find((p) => p.id === activeId) ?? null : null;

  if (!projects.length) return null;

  return (
    <section id="lab" className="relative py-20 md:py-28 border-b border-[#1f1c17]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader
          path="ls -l /lab/github"
          jp="研究所"
          count={projects.length}
          right="github pages · live embeds"
        />

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setTag('all')}
            className={`px-3 py-1 text-[10px] border transition-colors ${
              tag === 'all'
                ? 'border-[#ff9a3c] text-[#ff9a3c] bg-[#1a1008]'
                : 'border-[#2a2620] text-[#7a6e62] hover:text-[#efe6d4] hover:border-[#3a342c]'
            }`}
          >
            ALL · {projects.length}
          </button>
          {allTags.map(([t, n]) => {
            const on = tag === t;
            return (
              <button
                key={t}
                onClick={() => setTag(on ? 'all' : t)}
                className={`px-3 py-1 text-[10px] border transition-colors ${
                  on
                    ? 'border-[#5ec8d8] text-[#5ec8d8] bg-[#081418]'
                    : 'border-[#2a2620] text-[#a8a29e] hover:text-[#efe6d4] hover:border-[#3a342c]'
                }`}
              >
                {t} · {n}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {active && (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-8 grid grid-cols-12 gap-4"
            >
              <div className="col-span-12 lg:col-span-8 relative border border-[#ff9a3c]/50 bg-[#0a0604] overflow-hidden"
                style={{ boxShadow: '0 0 30px rgba(255,148,58,0.2)' }}
              >
                <div className="flex items-center justify-between px-3 py-1.5 text-[10px] bg-[#0a0604] border-b border-[#ff9a3c]/30">
                  <div className="flex items-center gap-2 text-[#ff9a3c]" style={{ textShadow: '0 0 6px rgba(255,148,58,0.5)' }}>
                    <span className="w-1.5 h-1.5 bg-[#ff7a5c] animate-pulse rounded-full" />
                    LIVE FEED · {active.repo_owner}/{active.repo_name}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setView((v) => ({
                          ...v,
                          [active.id]: v[active.id] === 'live' ? 'thumb' : 'live',
                        }))
                      }
                      className="text-[#5ec8d8] border border-[#5ec8d8]/40 px-2 py-0.5 hover:bg-[#5ec8d8]/10 transition-colors"
                    >
                      {view[active.id] === 'live' ? 'freeze frame' : 'run live →'}
                    </button>
                    <button
                      onClick={() => setActiveId(null)}
                      className="text-[#7a6e62] border border-[#2a2620] px-2 py-0.5 hover:border-[#ff9a3c] hover:text-[#ff9a3c] transition-colors"
                    >
                      close
                    </button>
                  </div>
                </div>

                <div className="relative aspect-[16/10] bg-[#050302]">
                  {view[active.id] === 'live' ? (
                    <iframe
                      key={active.pages_url}
                      src={active.pages_url}
                      title={active.title}
                      loading="lazy"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full bg-white"
                    />
                  ) : (
                    <img
                      src={active.thumbnail_url}
                      alt={active.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  {/* scan overlay */}
                  <div
                    className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-40"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(0deg, rgba(10,6,4,0.55) 0 1px, transparent 1px 3px)',
                    }}
                  />
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(20,8,4,0.85) 100%)',
                    }}
                  />
                  {/* corner reticles */}
                  <span className="absolute top-1 left-1 w-3 h-px bg-[#ff9a3c]" />
                  <span className="absolute top-1 left-1 h-3 w-px bg-[#ff9a3c]" />
                  <span className="absolute top-1 right-1 w-3 h-px bg-[#ff9a3c]" />
                  <span className="absolute top-1 right-1 h-3 w-px bg-[#ff9a3c]" />
                  <span className="absolute bottom-1 left-1 w-3 h-px bg-[#ff9a3c]" />
                  <span className="absolute bottom-1 left-1 h-3 w-px bg-[#ff9a3c]" />
                  <span className="absolute bottom-1 right-1 w-3 h-px bg-[#ff9a3c]" />
                  <span className="absolute bottom-1 right-1 h-3 w-px bg-[#ff9a3c]" />

                  {view[active.id] !== 'live' && (
                    <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none">
                      <div className="text-center">
                        <div className="text-[10px] font-mono text-[#ff9a3c] mb-2" style={{ textShadow: '0 0 8px rgba(255,148,58,0.6)' }}>
                          ◉ STATIC CAPTURE
                        </div>
                        <div className="text-[10px] font-mono text-[#7a6e62]">
                          press "run live" to stream the actual github pages deployment
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between px-3 py-1.5 text-[10px] bg-[#0a0604] border-t border-[#ff9a3c]/30">
                  <span className="text-[#7a6e62] truncate">src: {active.pages_url}</span>
                  <a
                    href={active.pages_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#5ec8d8] hover:text-[#ff9a3c] transition-colors"
                  >
                    open in new tab ↗
                  </a>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 border border-[#1f1c17] bg-[#0b0a08]/60 p-5">
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <h3 className="text-xl text-[#efe6d4]">{active.title}</h3>
                  <span className="text-[10px] text-[#7a6e62] tabular-nums whitespace-nowrap">
                    ★ {active.stars.toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#ff9a3c] mb-4" style={{ textShadow: '0 0 5px rgba(255,148,58,0.4)' }}>
                  {active.repo_owner}/{active.repo_name} · {active.language}
                </div>
                <p className="text-sm text-[#efe6d4] leading-relaxed mb-4">{active.tagline}</p>
                <p className="text-xs text-[#a8a29e] leading-relaxed mb-5">{active.description}</p>

                <div className="flex flex-wrap gap-1 mb-5">
                  {active.tags.map((t) => (
                    <span key={t} className="text-[10px] text-[#5ec8d8] border border-[#2a2620] px-1.5 py-0.5">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col gap-2">
                  <a
                    href={active.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 text-xs border border-[#ff9a3c] text-[#ff9a3c] hover:bg-[#ff9a3c] hover:text-[#0a0604] transition-colors text-center"
                  >
                    [ open on github ]
                  </a>
                  <a
                    href={active.pages_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 text-xs border border-[#5ec8d8] text-[#5ec8d8] hover:bg-[#5ec8d8] hover:text-[#0a0604] transition-colors text-center"
                  >
                    [ open live site ]
                  </a>
                </div>

                <div className="mt-5 pt-4 border-t border-dashed border-[#2a1810] text-[9px] font-jp text-[#5c544a] leading-relaxed">
                  プレビューは github pages からライブで取得されます
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              isActive={p.id === activeId}
              onOpen={() => setActiveId(p.id === activeId ? null : p.id)}
            />
          ))}
        </div>

        <div className="mt-6 text-[11px] text-[#5c544a] leading-relaxed">
          # each tile is a real github pages deployment · click to mount a scan · click "run live" to iframe the actual site
          <br /># some repos set X-Frame-Options to deny — for those, the thumbnail remains and the "open live" button jumps to a new tab
        </div>
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  isActive,
  onOpen,
}: {
  project: GithubProject;
  isActive: boolean;
  onOpen: () => void;
}) {
  return (
    <motion.button
      layout
      onClick={onOpen}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      data-cursor="hover"
      className={`group text-left relative border bg-[#0a0604] overflow-hidden transition-colors ${
        isActive ? 'border-[#ff9a3c]' : 'border-[#1f1c17] hover:border-[#ff9a3c]/50'
      }`}
      style={isActive ? { boxShadow: '0 0 20px rgba(255,148,58,0.25)' } : undefined}
    >
      <div className="relative aspect-[16/10] bg-[#050302] overflow-hidden">
        <img
          src={project.thumbnail_url}
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* CRT scan */}
        <div
          className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-35"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(10,6,4,0.55) 0 1px, transparent 1px 3px)',
          }}
        />
        {/* warm tint */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0604] via-transparent to-transparent" />
        {/* top strip */}
        <div className="absolute top-0 inset-x-0 flex items-center justify-between px-2 py-1 text-[9px] bg-[#0a0604]/80 border-b border-[#ff9a3c]/20 font-mono">
          <span className="text-[#ff9a3c] truncate" style={{ textShadow: '0 0 4px rgba(255,148,58,0.5)' }}>
            {project.repo_owner}/{project.repo_name}
          </span>
          <span className="text-[#5ec8d8] shrink-0">★ {project.stars.toLocaleString()}</span>
        </div>
        {project.featured && (
          <div className="absolute top-7 left-2 text-[8px] font-mono px-1.5 py-0.5 bg-[#ff9a3c] text-[#0a0604]">
            FEATURED
          </div>
        )}
        {/* bottom meta */}
        <div className="absolute bottom-0 inset-x-0 px-3 py-2 text-[9px] bg-gradient-to-t from-[#0a0604]/95 to-transparent">
          <div className="flex items-center justify-between text-[#7a6e62]">
            <span className="font-jp text-[#5ec8d8]/80">{project.language}</span>
            <span>{isActive ? '◉ ACTIVE' : 'click to mount →'}</span>
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="text-sm text-[#efe6d4]">{project.title}</h4>
        </div>
        <p className="text-xs text-[#a8a29e] mt-1 line-clamp-2 leading-snug">{project.tagline}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {project.tags.slice(0, 3).map((t) => (
            <span key={t} className="text-[9px] text-[#7a6e62] border border-[#2a2620] px-1 py-0.5">
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}

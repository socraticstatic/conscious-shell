import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { Project } from '../lib/supabase';

type DossierPanelProps = {
  project: Project | null;
  onClose: () => void;
};

const starSections = [
  { key: 'situation' as const, label: 'Situation' },
  { key: 'task'      as const, label: 'Task'      },
  { key: 'action'    as const, label: 'Action'    },
  { key: 'result'    as const, label: 'Result'    },
];

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.25 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.3 } },
};

export default function DossierPanel({ project, onClose }: DossierPanelProps) {
  // ESC key
  useEffect(() => {
    if (!project) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [project, onClose]);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = project ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [project]);

  const fileNumber = project
    ? String(project.order_index).padStart(4, '0')
    : '0000';

  const hasStar = project &&
    (project.situation || project.task || project.action || project.result);

  return createPortal(
    <AnimatePresence>
      {project && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Project dossier: ${project.title}`}
          className="fixed inset-0 z-50 bg-[#080706] overflow-y-auto font-mono"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Top amber border — draws left to right */}
          <motion.div
            className="absolute top-0 left-0 h-[2px] bg-[#e7b766]"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
          />

          {/* Topbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#1f1c17] text-[9px] tracking-[0.4em] uppercase mt-[2px]">
            <div className="flex items-center gap-3 text-[#e7b766]">
              <span>■</span>
              <span>Classified Dossier</span>
              <span className="text-[#4a453e]">·</span>
              <span>{project.title}</span>
              <span className="text-[#4a453e]">·</span>
              <span className="text-[#4a453e]">Access: Operator</span>
            </div>
            <div className="flex items-center gap-4 text-[#4a453e]">
              <span>REP-7 File #{fileNumber}</span>
              <button
                type="button"
                onClick={onClose}
                className="border border-[#1f1c17] px-3 py-1 text-[#6b6660] hover:text-[#e7b766] hover:border-[#e7b766] transition-colors"
              >
                ESC ✕
              </button>
            </div>
          </div>

          {/* Three-column body */}
          <div className="flex min-h-[calc(100vh-6rem)]">
            {/* Left: metadata */}
            <div className="w-[200px] shrink-0 border-r border-[#1f1c17] p-5 flex flex-col gap-5">
              <div>
                <div className="text-[9px] tracking-[0.4em] uppercase text-[#4a453e] mb-1">Year</div>
                <div className="text-[22px] text-[#e7b766]">{project.year}</div>
              </div>
              <div>
                <div className="text-[9px] tracking-[0.4em] uppercase text-[#4a453e] mb-1">Client</div>
                <div className="text-sm text-[#e8e4dc]">{project.client}</div>
              </div>
              <div>
                <div className="text-[9px] tracking-[0.4em] uppercase text-[#4a453e] mb-1">Role</div>
                <div className="text-sm text-[#e8e4dc]">{project.role}</div>
              </div>
              <div>
                <div className="text-[9px] tracking-[0.4em] uppercase text-[#4a453e] mb-1">Tags</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.tags.map((t) => (
                    <span key={t} className="text-[9px] border border-[#1f1c17] px-1.5 py-0.5 text-[#6b6660] tracking-[0.2em] uppercase">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-dashed border-[#1f1c17]">
                <div className="text-[9px] tracking-[0.4em] uppercase text-[#4a453e] mb-1">Status</div>
                <div className="text-[10px] text-[#4ade80] tracking-[0.2em]">● Case File Active</div>
              </div>
            </div>

            {/* Center: hero image */}
            <div className="flex-1 relative overflow-hidden">
              {project.image_url ? (
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1410] via-[#0f0c09] to-[#1a1410] flex items-center justify-center">
                  <div className="text-[9px] tracking-[0.4em] uppercase text-[#2a2620]">No artifact available</div>
                </div>
              )}
            </div>

            {/* Right: STAR narrative */}
            <div className="w-[260px] shrink-0 border-l border-[#1f1c17] p-5 overflow-y-auto">
              {hasStar ? (
                <motion.div
                  className="flex flex-col gap-5"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                >
                  {starSections.map(({ key, label }) =>
                    project[key] ? (
                      <motion.div key={key} variants={fadeIn} className="pb-4 border-b border-[#0f0e0c] last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[9px] tracking-[0.4em] uppercase text-[#e7b766]">{label}</span>
                          <div className="flex-1 h-px bg-[#1f1c17]" />
                        </div>
                        <p className="text-[11px] text-[#a8a29e] leading-relaxed">{project[key]}</p>
                      </motion.div>
                    ) : null
                  )}
                </motion.div>
              ) : (
                <div className="text-[11px] text-[#3a3530] leading-relaxed pt-2">
                  Case study content not yet available.
                </div>
              )}
            </div>
          </div>

          {/* Gallery strip */}
          <div className="border-t border-[#1f1c17] px-5 py-3 flex items-center gap-3">
            <span className="text-[9px] tracking-[0.4em] uppercase text-[#3a3530] shrink-0">
              Additional artifacts
            </span>
            {project.gallery_urls.length > 0 ? (
              project.gallery_urls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Artifact ${i + 1}`}
                  className="w-[60px] h-[40px] object-cover border border-[#1f1c17]"
                />
              ))
            ) : (
              <>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-[60px] h-[40px] border border-dashed border-[#1f1c17] bg-[#0a0908]" />
                ))}
                <span className="text-[9px] text-[#2a2620] tracking-[0.3em] ml-1">Populate as available</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

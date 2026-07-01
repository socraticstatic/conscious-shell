import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchPortfolio } from '../lib/portfolio';
import { slugify } from '../lib/slug';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import type { Project } from '../lib/supabase';

// Standalone, directly-linkable case-study page. Deep-linking here (or a
// crawler landing here cold) must render real title/summary/role/client
// text in the initial paint — this component does not depend on any
// homepage overlay state to have content.
export default function CaseStudy() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPortfolio()
      .then(({ projects }) => {
        if (cancelled) return;
        setProjects(projects);
        if (!projects.some((p) => slugify(p.title) === slug)) setNotFound(true);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const project = projects?.find((p) => slugify(p.title) === slug) ?? null;
  const index = projects && project ? projects.findIndex((p) => p.id === project.id) : -1;

  const title = project ? `${project.title} — Micah Boswell` : 'Case Study — Micah Boswell';
  const description = project
    ? `${project.client}: ${project.summary}`
    : 'Selected case study from 30 years of UX and product design leadership.';

  useDocumentMeta({
    title,
    description,
    url: `https://conscious-shell.com/work/${slug}`,
    image: project?.image_url || undefined,
    type: 'article',
  });

  if (notFound) {
    return (
      <main className="min-h-[100dvh] bg-[#07070a] text-[#e8e4dc] flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-mono text-sm text-[#6b6660]">// case study not found</p>
        <Link to="/" className="text-[#e040fb] text-sm underline underline-offset-4">
          back to conscious_shell
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[#07070a] text-[#e8e4dc]">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 md:px-10 py-16 md:py-24">
        <button
          onClick={() => navigate('/')}
          className="text-xs font-mono text-[#6b6660] hover:text-[#e040fb] mb-10 inline-flex items-center gap-2"
        >
          <span className="text-[#e040fb]">$</span> cd ..
        </button>

        {!project ? (
          <div className="animate-pulse space-y-4">
            <div className="h-3 w-24 bg-[#1f1c17]" />
            <div className="h-10 w-2/3 bg-[#1f1c17]" />
            <div className="h-24 w-full bg-[#1f1c17]" />
          </div>
        ) : (
          <motion.article
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="text-[11px] font-mono text-[#6b6660] mb-3 flex flex-wrap gap-2 items-center">
              <span className="text-[#e040fb]">
                {index >= 0 ? String(index + 1).padStart(2, '0') : '—'}
              </span>
              <span>./{project.role.toLowerCase().replace(/\s+/g, '_')}</span>
              <span className="text-[#4a453e]">·</span>
              <span>{project.client}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-light leading-tight mb-6">{project.title}</h1>

            {project.image_url && (
              <div className="aspect-[16/9] bg-[#0a0908] border border-[#1f1c17] overflow-hidden mb-8">
                <img
                  src={project.image_url}
                  alt={`${project.title} — case study preview`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <p className="text-base md:text-lg text-[#a8a29e] leading-relaxed mb-8">{project.summary}</p>

            {project.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-10">
                {project.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] font-mono border border-[#2a2620] text-[#6b6660] px-2 py-1"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="border-t border-[#1f1c17] pt-6 flex items-center justify-between text-xs font-mono text-[#6b6660]">
              <Link to="/#work" className="hover:text-[#e040fb]">
                ← more work
              </Link>
              <Link to="/#contact" className="hover:text-[#e040fb]">
                get in touch →
              </Link>
            </div>
          </motion.article>
        )}
      </div>
    </main>
  );
}

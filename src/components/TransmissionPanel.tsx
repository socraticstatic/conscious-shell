import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { LinkedInArticle } from '../lib/supabase';
import ArticleConstellation from './ArticleConstellation';
import { useShellTier } from '../lib/shellTier';

// The signal arrived months, sometimes years, before anyone tuned in.
// Now it sits here, waiting to be read again.
//
// The panel is a reader overlay on EVERY tier. It used to expand inline on
// desktop, which grew the page by the article's full length and collapsed
// it on close — the list shredded and the visitor lost their place. A fixed
// overlay owns its own scroll; closing returns you to the exact row you
// left. Long-form prose is set in the serif reading face — mono is this
// site's voice for chrome, not for a twelve-minute read.

function relatedTo(current: LinkedInArticle, all: LinkedInArticle[], n = 3): LinkedInArticle[] {
  const mine = new Set(current.tags || []);
  return all
    .filter((a) => a.id !== current.id)
    .map((a) => ({ a, shared: (a.tags || []).filter((t) => mine.has(t)).length }))
    .sort((x, y) => y.shared - x.shared)
    .slice(0, n)
    .map((r) => r.a);
}

export default function TransmissionPanel({
  article,
  onClose,
  siblings = [],
  onSelectSibling,
}: {
  article: LinkedInArticle;
  onClose: () => void;
  siblings?: LinkedInArticle[];
  onSelectSibling?: (id: string) => void;
}) {
  const tier = useShellTier();
  const bodyRef = useRef<HTMLDivElement | null>(null);

  // Lock the page behind the reader on every tier; Esc closes.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // Switching to a sibling starts the new read at the top.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [article.id]);

  const related = useMemo(() => relatedTo(article, siblings), [article, siblings]);

  const Body = (
    <>
      <div className="flex items-baseline justify-between border-b border-[#1f1c17] px-5 py-3 gap-3 shrink-0">
        <div className="flex items-baseline flex-wrap gap-x-2 sm:gap-x-3 gap-y-0.5 text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[#605a52]">
          <span className="text-[#4fc3f7]">▸ transmission</span>
          <span>{article.published_date}</span>
          <span>· {article.reading_minutes}m</span>
          {article.tags.slice(0, 3).map((t) => (
            <span key={t} className="text-[#6b6660]">· {t}</span>
          ))}
        </div>
        <button
          onClick={onClose}
          aria-label="close transmission"
          className="shrink-0 inline-flex items-center justify-center w-11 h-11 -mr-2 text-[#a8a29e] hover:text-[#e040fb] transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div
        ref={bodyRef}
        className="px-5 py-6 md:px-8 md:py-8 overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="max-w-[64ch] mx-auto">
          <h3 className="text-[22px] sm:text-2xl md:text-3xl text-[#e040fb] mb-1 leading-tight">
            {article.title}
          </h3>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#00d4ff] mb-6 font-mono">
            // {article.intercept_line}
          </div>

          <article className="text-[#d6cfc3] font-serif text-[17px] md:text-[18px] leading-[1.8] space-y-5">
            {article.body_markdown
              .split(/\n{2,}/)
              .map((p) => p.trim())
              .filter(Boolean)
              .map((p, i) => (
                <p key={i}>{p}</p>
              ))}
          </article>

          {siblings.length > 1 && onSelectSibling && (
            tier === 'full' ? (
              <ArticleConstellation
                articles={siblings}
                currentId={article.id}
                onSelect={onSelectSibling}
              />
            ) : (
              related.length > 0 && (
                <div className="mt-10 pt-6 border-t border-dashed border-[#1f1c17]">
                  <div className="text-[10px] font-mono text-[#4fc3f7] tracking-[0.35em] uppercase mb-3">
                    ▸ related transmissions
                  </div>
                  <ul>
                    {related.map((r) => (
                      <li key={r.id}>
                        <button
                          onClick={() => onSelectSibling(r.id)}
                          className="w-full text-left min-h-[44px] py-2.5 flex items-baseline gap-3 border-b border-dashed border-[#1f1c17] group"
                        >
                          <span className="text-[10px] font-mono text-[#605a52] shrink-0">
                            {r.published_date} · {r.reading_minutes}m
                          </span>
                          <span className="text-[15px] text-[#e040fb] group-active:text-[#00d4ff] leading-snug">
                            {r.title}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )
          )}

          <div className="mt-8 pt-4 border-t border-dashed border-[#1f1c17] text-[10px] uppercase tracking-[0.2em] text-[#605a52] font-mono">
            // end transmission · signal source: micah.boswell · channel: linkedin.archive
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div
        className="fixed inset-0 z-[55] bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Phone: bottom sheet. md+: centered reader column. Flex centering on
          a full-viewport wrapper — never translate classes, which framer's
          inline transform would clobber. */}
      <div className="fixed inset-0 z-[56] flex items-end md:items-center md:justify-center pointer-events-none">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
          className="pointer-events-auto flex flex-col border border-[#1f1c17] bg-[#0a0a0e] w-full h-[93%] border-x-0 border-b-0 md:w-[min(820px,92vw)] md:h-[min(86vh,900px)] md:border-x md:border-b"
          role="dialog"
          aria-modal="true"
          aria-label={article.title}
        >
          {Body}
        </motion.div>
      </div>
    </>
  );
}

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { LinkedInArticle } from '../lib/supabase';
import ArticleConstellation from './ArticleConstellation';

// The signal arrived months, sometimes years, before anyone tuned in.
// Now it sits here, monospaced, waiting to be read again.
//
// On mobile, the panel takes over the viewport from the bottom — you can't
// miss it. On desktop it slides in inline next to the row you clicked.

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
  // Lock body scroll while bottom-sheet is open on mobile.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    if (!mq.matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const Body = (
    <>
      <div className="flex items-baseline justify-between border-b border-[#1f1c17] px-5 py-3 gap-3">
        <div className="flex items-baseline gap-2 sm:gap-3 text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[#4a453e] overflow-x-auto whitespace-nowrap scrollbar-none">
          <span className="text-[#7dd6e8]">▸ transmission</span>
          <span>{article.published_date}</span>
          <span>· {article.reading_minutes}m</span>
          {article.tags.slice(0, 3).map((t) => (
            <span key={t} className="text-[#6b6660]">· {t}</span>
          ))}
        </div>
        <button
          onClick={onClose}
          aria-label="close transmission"
          className="shrink-0 inline-flex items-center justify-center w-9 h-9 -mr-2 text-[#a8a29e] hover:text-[#e7b766] transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="px-5 py-6 md:px-8 md:py-8 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <h3 className="text-[22px] sm:text-2xl md:text-3xl text-[#e7b766] mb-1 leading-tight">
          {article.title}
        </h3>
        <div className="text-[10px] uppercase tracking-[0.2em] text-[#5ec8d8] mb-6">
          // {article.intercept_line}
        </div>

        <article className="text-[#c8c2b7] text-[15px] sm:text-[14px] leading-[1.7] sm:leading-[1.75] font-mono space-y-4">
          {article.body_markdown
            .split(/\n{2,}/)
            .map((p) => p.trim())
            .filter(Boolean)
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </article>

        {siblings.length > 1 && onSelectSibling && (
          <ArticleConstellation
            articles={siblings}
            currentId={article.id}
            onSelect={onSelectSibling}
          />
        )}

        <div className="mt-8 pt-4 border-t border-dashed border-[#1f1c17] text-[10px] uppercase tracking-[0.2em] text-[#4a453e]">
          // end transmission · signal source: micah.boswell · channel: linkedin.archive
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile: full-viewport bottom sheet */}
      <div className="md:hidden">
        <div
          className="fixed inset-0 z-[55] bg-black/80 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
          className="fixed inset-x-0 bottom-0 top-[8%] z-[56] border-t border-[#1f1c17] bg-[#0a0a0e] flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          {Body}
        </motion.div>
      </div>

      {/* Desktop: inline panel as before */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22 }}
        className="hidden md:block relative my-4 border border-[#1f1c17] bg-[#0a0a0e]/80 backdrop-blur-sm"
      >
        {Body}
      </motion.div>
    </>
  );
}

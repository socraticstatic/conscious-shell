import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { LinkedInArticle } from '../lib/supabase';

// The signal arrived months, sometimes years, before anyone tuned in.
// Now it sits here, monospaced, waiting to be read again.

export default function TransmissionPanel({
  article,
  onClose,
}: {
  article: LinkedInArticle;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      className="relative my-4 border border-[#1f1c17] bg-[#0a0a0e]/80 backdrop-blur-sm"
    >
      <div className="flex items-baseline justify-between border-b border-[#1f1c17] px-5 py-3">
        <div className="flex items-baseline gap-3 text-[10px] uppercase tracking-[0.2em] text-[#4a453e]">
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
          className="text-[#4a453e] hover:text-[#e7b766] transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="px-5 py-6 md:px-8 md:py-8">
        <h3 className="text-2xl md:text-3xl text-[#e7b766] mb-1 leading-tight">
          {article.title}
        </h3>
        <div className="text-[10px] uppercase tracking-[0.2em] text-[#5ec8d8] mb-6">
          // {article.intercept_line}
        </div>

        <article className="text-[#c8c2b7] text-[14px] leading-[1.75] font-mono space-y-4">
          {article.body_markdown
            .split(/\n{2,}/)
            .map((p) => p.trim())
            .filter(Boolean)
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </article>

        <div className="mt-8 pt-4 border-t border-dashed border-[#1f1c17] text-[10px] uppercase tracking-[0.2em] text-[#4a453e]">
          // end transmission · signal source: micah.boswell · channel: linkedin.archive
        </div>
      </div>
    </motion.div>
  );
}

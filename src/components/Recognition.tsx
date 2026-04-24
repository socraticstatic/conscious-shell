import { motion } from 'framer-motion';
import { SectionHeader } from './Work';
import type { Award, Publication } from '../lib/supabase';

export default function Recognition({
  awards,
  publications,
}: {
  awards: Award[];
  publications: Publication[];
}) {
  return (
    <section id="recognition" className="relative py-20 md:py-28 border-b border-[#1f1c17]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader path="git log --awards --publications" jp="栄誉・出版物" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
          <div>
            <div className="text-xs text-[#6b6660] mb-4"># awards/</div>
            <ul>
              {awards.map((a, i) => (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, x: -6 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="py-4 border-b border-dashed border-[#1f1c17] grid grid-cols-12 gap-3 items-baseline"
                >
                  <div className="col-span-2 text-[11px] tabular-nums text-[#e7b766]">{a.year}</div>
                  <div className="col-span-10">
                    <div className="text-[#e8e4dc] text-lg">{a.title}</div>
                    {a.organization && (
                      <div className="text-xs text-[#6b6660] mt-0.5">{a.organization}</div>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs text-[#6b6660] mb-4"># publications/</div>
            <ul>
              {publications.map((p, i) => (
                <motion.li
                  key={p.id}
                  initial={{ opacity: 0, x: -6 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="py-4 border-b border-dashed border-[#1f1c17] flex items-baseline justify-between gap-4"
                >
                  {p.url ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#e8e4dc] text-lg hover:text-[#e7b766] transition-colors"
                    >
                      {p.title}
                    </a>
                  ) : (
                    <span className="text-[#e8e4dc] text-lg">{p.title}</span>
                  )}
                  <span className="text-[11px] uppercase tracking-wider text-[#6b6660] shrink-0">
                    {p.kind}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

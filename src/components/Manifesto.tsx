import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SectionHeader } from './Work';
import type { LinkedInArticle } from '../lib/supabase';
import TransmissionPanel from './TransmissionPanel';

const lines: Array<[string, string]> = [
  ['ship.', 'a hypothesis is not a decision.'],
  ['observe.', 'people lie; behavior does not.'],
  ['reduce.', 'if it can be removed, remove it first.'],
  ['repeat.', 'the loop is the product.'],
];

export default function Manifesto({ articles = [] }: { articles?: LinkedInArticle[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openArticle = articles.find((a) => a.id === openId);

  return (
    <section id="manifesto" className="relative py-20 md:py-28 border-b border-[#1f1c17]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">
        <SectionHeader path="/manifesto.txt" jp="宣言" right="04 lines · read-only" />

        <motion.pre
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-10 text-[11px] text-[#4a453e] leading-4 whitespace-pre"
        >
{`+----+----------+-----------------------------------------------+
| #  | directive | footnote                                      |
+----+----------+-----------------------------------------------+`}
        </motion.pre>

        <ul className="text-[#e8e4dc]">
          {lines.map(([big, small], i) => (
            <motion.li
              key={big}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="group grid grid-cols-12 gap-3 py-5 border-b border-dashed border-[#1f1c17] items-baseline"
            >
              <div className="col-span-1 text-xs text-[#4a453e]">0{i + 1}</div>
              <div className="col-span-11 md:col-span-4 text-2xl sm:text-3xl md:text-5xl text-[#e7b766]">{big}</div>
              <div className="col-span-12 md:col-span-7 text-[#a8a29e] text-sm md:text-base md:pl-6">
                <span className="text-[#4a453e]">// </span>
                {small}
              </div>
            </motion.li>
          ))}
        </ul>

        <div className="mt-6 text-xs text-[#4a453e]"># EOF</div>

        {articles.length > 0 && (
          <div className="mt-20">
            <SectionHeader
              path="/broadcast.log"
              jp="放送記録"
              right={`${articles.length} transmissions · archived`}
            />

            <motion.pre
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mt-10 text-[11px] text-[#4a453e] leading-4 whitespace-pre overflow-x-auto"
            >
{`+----+--------------+--------+------------------------------------------------+
| #  | intercepted  | length | signal                                         |
+----+--------------+--------+------------------------------------------------+`}
            </motion.pre>

            <ul className="text-[#e8e4dc]">
              {articles.map((a, i) => {
                const isOpen = a.id === openId;
                return (
                  <li key={a.id} className="border-b border-dashed border-[#1f1c17]">
                    <motion.button
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-30px' }}
                      transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
                      onClick={() => setOpenId(isOpen ? null : a.id)}
                      className="w-full text-left grid grid-cols-12 gap-3 py-4 items-baseline hover:bg-[#0f0d0a]/60 transition-colors px-1"
                      aria-expanded={isOpen}
                    >
                      <div className="col-span-1 text-xs text-[#4a453e] font-mono">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="col-span-12 sm:col-span-3 md:col-span-2 text-[11px] font-mono text-[#7dd6e8] tracking-widest">
                        {a.published_date}
                      </div>
                      <div className="col-span-3 sm:col-span-2 md:col-span-1 text-[11px] font-mono text-[#6b6660]">
                        {a.reading_minutes}m
                      </div>
                      <div className="col-span-12 sm:col-span-6 md:col-span-7 text-[#e7b766] text-sm md:text-base">
                        <span className="text-[#4a453e]">// </span>
                        {a.title}
                      </div>
                      <div className="col-span-1 text-right text-[11px] font-mono text-[#4a453e]">
                        {isOpen ? '[−]' : '[+]'}
                      </div>
                    </motion.button>

                    <AnimatePresence>
                      {isOpen && openArticle && (
                        <TransmissionPanel article={openArticle} onClose={() => setOpenId(null)} />
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 text-xs text-[#4a453e]"># end of log · click any row to open</div>
          </div>
        )}
      </div>
    </section>
  );
}

import { motion } from 'framer-motion';
import { SectionHeader } from './Work';

const disciplines: Array<[string, number]> = [
  ['product_design', 92],
  ['design_leadership', 88],
  ['ux_research', 85],
  ['strategy', 78],
];

const decades: Array<[string, number]> = [
  ['00s', 18],
  ['10s', 54],
  ['20s', 54],
];

const stats: Array<[string, string]> = [
  ['products_shipped', '126'],
  ['designers_mentored', '47'],
  ['hardware_savings', '$300K+'],
  ['error_reduction', '48%'],
];

function bar(v: number, max: number, width = 30) {
  const filled = Math.round((v / max) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

export default function Impact() {
  const maxDec = Math.max(...decades.map((d) => d[1]));

  return (
    <section id="impact" className="relative py-20 md:py-28 border-b border-[#1f1c17]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader path="/impact --summary" jp="実績" right="./stats.out" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-xs text-[#6b6660] mb-4"># cat /impact/by_decade.txt</div>
            <pre className="text-[13px] leading-6 text-[#a8a29e]">
              {decades.map(([year, n], i) => (
                <div key={year} className="flex gap-3">
                  <span className="text-[#4a453e] w-8">{year}</span>
                  <span className="text-[#e7b766]">{bar(n, maxDec, 24)}</span>
                  <span className="text-[#e8e4dc] tabular-nums">{String(n).padStart(3, ' ')}</span>
                  {i === decades.length - 1 && <span className="text-[#4a453e]">← current</span>}
                </div>
              ))}
            </pre>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="text-xs text-[#6b6660] mb-4"># cat /impact/discipline_mix.txt</div>
            <pre className="text-[13px] leading-6 text-[#a8a29e]">
              {disciplines.map(([name, n]) => (
                <div key={name} className="flex gap-3">
                  <span className="text-[#4a453e] w-36 truncate">{name}</span>
                  <span className="text-[#e7b766]">{bar(n, 100, 18)}</span>
                  <span className="text-[#e8e4dc] tabular-nums">{n}%</span>
                </div>
              ))}
            </pre>
          </motion.div>
        </div>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1f1c17] border border-[#1f1c17]">
          {stats.map(([k, v], i) => (
            <motion.div
              key={k}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="bg-[#0b0a08] p-6 md:p-8"
            >
              <div className="text-[11px] text-[#6b6660] uppercase tracking-wider">{k}</div>
              <div className="mt-3 text-4xl md:text-5xl text-[#e7b766] tabular-nums leading-none">{v}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

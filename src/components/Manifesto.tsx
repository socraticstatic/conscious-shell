import { motion } from 'framer-motion';
import { SectionHeader } from './Work';

const lines: Array<[string, string]> = [
  ['ship.', 'a hypothesis is not a decision.'],
  ['observe.', 'people lie; behavior does not.'],
  ['reduce.', 'if it can be removed, remove it first.'],
  ['repeat.', 'the loop is the product.'],
];

export default function Manifesto() {
  return (
    <section id="manifesto" className="relative py-20 md:py-28 border-b border-[#1f1c17]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
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
              <div className="col-span-11 md:col-span-4 text-3xl md:text-5xl text-[#e7b766]">{big}</div>
              <div className="col-span-12 md:col-span-7 text-[#a8a29e] text-sm md:text-base md:pl-6">
                <span className="text-[#4a453e]">// </span>
                {small}
              </div>
            </motion.li>
          ))}
        </ul>

        <div className="mt-6 text-xs text-[#4a453e]"># EOF</div>
      </div>
    </section>
  );
}

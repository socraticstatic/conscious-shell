import { motion } from 'framer-motion';
import { SectionHeader } from './Work';
import type { Testimonial } from '../lib/supabase';

const bio = [
  ['name', 'Micah Boswell'],
  ['title', 'Design Leader'],
  ['practicing_since', '1990s'],
  ['based', 'earth / remote'],
  ['output', 'product · research · leadership'],
  ['fuel', 'yerba mate'],
];

const paragraphs = [
  'I started practicing UX in the 1990s, before the label existed. Since then I have shipped product across finance, telecom, healthcare, retail, and government — through 126 projects and a couple of eras of the web.',
  'Today I run a small design practice focused on three things: leading product design engagements, advising teams that want design to drive outcomes, and mentoring the next generation of senior designers.',
];

export default function About({ testimonial }: { testimonial?: Testimonial }) {
  return (
    <section id="about" className="relative py-20 md:py-28 border-b border-[#1f1c17]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader path="/about --whoami" jp="身元" />

        <div className="grid grid-cols-12 gap-6 mt-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="col-span-12 md:col-span-5 border border-[#1f1c17]"
          >
            <div className="px-4 py-2 border-b border-[#1f1c17] text-[11px] text-[#6b6660] flex items-center justify-between">
              <span>identity.conf</span>
              <span className="text-[#e7b766]">●●●</span>
            </div>
            <dl className="p-5 text-sm space-y-3">
              {bio.map(([k, v]) => (
                <div key={k} className="flex items-baseline gap-3">
                  <dt className="text-[#4a453e] w-32 shrink-0">{k.padEnd(16, ' ')}</dt>
                  <dd className="text-[#e8e4dc]">= "{v}"</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="col-span-12 md:col-span-7 space-y-5 text-[#a8a29e] text-base md:text-lg leading-relaxed"
          >
            {paragraphs.map((p, i) => (
              <p key={i}>
                <span className="text-[#4a453e]">// </span>
                {p}
              </p>
            ))}
            <div className="pt-4 border-t border-dashed border-[#1f1c17]">
              <div className="text-xs text-[#6b6660] mb-3"># cat /about/philosophy.txt</div>
              <div className="text-[#e7b766] text-xl md:text-2xl leading-snug">
                &gt; "you don't get to know people by asking them who they are.
                <br /> you get to know them by watching how they behave."
              </div>
            </div>
          </motion.div>
        </div>

        {testimonial && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16 max-w-4xl border-l-2 border-[#e7b766] pl-6"
          >
            <div className="text-xs text-[#6b6660] mb-2">&gt; curl /testimonials/random</div>
            <p className="text-[#e8e4dc] text-lg md:text-2xl leading-snug italic">
              "{testimonial.quote}"
            </p>
            <div className="mt-3 text-sm text-[#6b6660]">
              — {testimonial.author}
              {testimonial.role && <span className="text-[#4a453e]"> · {testimonial.role}</span>}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

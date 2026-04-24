import { motion } from 'framer-motion';
import { SectionHeader } from './Work';
import type { Service } from '../lib/supabase';

export default function Services({ services }: { services: Service[] }) {
  return (
    <section id="services" className="relative py-20 md:py-28 border-b border-[#1f1c17]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader path="man services(1)" jp="業務" count={services.length} />

        <div className="mt-10 border border-[#1f1c17]">
          {services.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="grid grid-cols-12 gap-3 md:gap-6 p-6 md:p-8 border-b border-[#1f1c17] last:border-b-0 hover:bg-[#121008] transition-colors group"
              data-cursor="hover"
            >
              <div className="col-span-2 md:col-span-1 text-xs text-[#4a453e] group-hover:text-[#e7b766]">
                .{String(i + 1).padStart(2, '0')}
              </div>
              <div className="col-span-10 md:col-span-4">
                <div className="text-[11px] text-[#6b6660] mb-1">NAME</div>
                <div className="text-2xl md:text-3xl text-[#e7b766] lowercase">
                  {s.title.toLowerCase().replace(/\s+/g, '_')}
                </div>
              </div>
              <div className="col-span-12 md:col-span-7 text-[#a8a29e] text-sm md:text-base leading-relaxed">
                <div className="text-[11px] text-[#6b6660] mb-1">DESCRIPTION</div>
                {s.description}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-xs text-[#4a453e]">
          # pipe: intro_call → scope → engagement
        </div>
      </div>
    </section>
  );
}

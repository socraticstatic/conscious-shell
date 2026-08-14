import { motion } from 'framer-motion';
import { SectionHeader } from './Work';
import type { Service, Offer } from '../lib/supabase';

export default function Services({ services, offers }: { services: Service[]; offers: Offer[] }) {
  const goToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="services" className="relative py-20 md:py-28 border-b border-[#1f1c17]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">
        <SectionHeader path="man services(1)" jp="業務" count={offers.length + services.length} />

        {/* Productized offers — the two engagements actually for sale */}
        {offers.length > 0 && (
          <div className="mt-10 grid md:grid-cols-2 gap-4 md:gap-6">
            {offers.map((o, i) => (
              <motion.article
                key={o.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="border border-[#1f1c17] p-6 md:p-8 flex flex-col hover:bg-[#121008] transition-colors group"
                data-cursor="hover"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-xs text-[#605a52] group-hover:text-[#e040fb]">
                    engagement.{String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="text-[11px] text-[#6b6660]">{o.duration}</div>
                </div>

                <h3 className="mt-3 text-2xl md:text-3xl text-[#e040fb] lowercase">
                  {o.name.toLowerCase().replace(/\s+/g, '_')}
                </h3>
                <p className="mt-1 text-[#e8e4dc] text-base">{o.tagline}</p>

                <p className="mt-4 text-[#a8a29e] text-sm leading-relaxed">{o.description}</p>

                <ul className="mt-4 space-y-1.5">
                  {o.deliverables.map((d) => (
                    <li key={d} className="flex gap-2 text-sm text-[#a8a29e]">
                      <span className="text-[#e040fb] shrink-0">→</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-4 border-t border-[#1f1c17] flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-[#e8e4dc] text-lg">{o.price_label}</div>
                    <div className="text-[11px] text-[#6b6660]">{o.availability}</div>
                  </div>
                  <button
                    onClick={goToContact}
                    className="min-h-[44px] px-5 border border-[#e040fb] text-[#e040fb] text-sm hover:bg-[#e040fb] hover:text-[#0b0a08] transition-colors"
                    data-cursor="hover"
                  >
                    start_intro_call
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Capabilities rail */}
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
              <div className="col-span-2 md:col-span-1 text-xs text-[#605a52] group-hover:text-[#e040fb]">
                .{String(i + 1).padStart(2, '0')}
              </div>
              <div className="col-span-10 md:col-span-4">
                <div className="text-[11px] text-[#6b6660] mb-1">NAME</div>
                <div className="text-2xl md:text-3xl text-[#e040fb] lowercase">
                  {s.title.toLowerCase().replace(/\s+/g, '_')}
                </div>
              </div>
              <div className="col-span-12 md:col-span-7 text-[#a8a29e] text-base leading-relaxed">
                <div className="text-[11px] text-[#6b6660] mb-1">DESCRIPTION</div>
                {s.description}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-xs text-[#605a52]">
          # pipe: intro_call → scope → engagement · selective while holding a day job
        </div>
      </div>
    </section>
  );
}

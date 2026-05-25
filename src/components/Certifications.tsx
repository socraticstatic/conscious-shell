import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, BookOpen, ChevronRight, Shield } from 'lucide-react';
import { SectionHeader } from './Work';

type Certification = {
  id: string;
  title: string;
  institution: string;
  credential_id: string;
  issued_date: string;
  category: string;
  curriculum_notes: string[];
  skills: string[];
  description: string;
  url: string;
  order_index: number;
};

const categoryMeta: Record<string, { label: string; color: string; icon: typeof Award }> = {
  'ai-strategy': { label: 'AI STRATEGY', color: '#e7b766', icon: Shield },
  'ai-technical': { label: 'ML ENGINEERING', color: '#5ec8d8', icon: BookOpen },
  'ai-product': { label: 'AI PRODUCT', color: '#7aff8c', icon: Award },
  'leadership': { label: 'LEADERSHIP', color: '#ff7a5c', icon: ChevronRight },
};

export default function Certifications({ certs }: { certs: Certification[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!certs.length) return null;

  return (
    <section id="certifications" className="relative py-20 md:py-28 border-b border-[#1f1c17]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">
        <SectionHeader
          path="cat /credentials/cornell --curriculum"
          jp="認定資格"
          right={`${certs.length} certifications`}
        />

        <div className="mt-4 mb-10 max-w-2xl">
          <p className="text-[13px] text-[#6b6660] leading-relaxed">
            Cornell University executive certifications in AI strategy, machine learning,
            and digital transformation. Not badges on a wall — applied frameworks
            that shaped how I build, ship, and lead.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {certs.map((cert, i) => {
            const meta = categoryMeta[cert.category] || categoryMeta['ai-strategy'];
            const Icon = meta.icon;
            const isOpen = expanded === cert.id;

            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="border border-[#1f1c17] bg-[#0b0a08]/60"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : cert.id)}
                  className="w-full text-left px-3 sm:px-5 py-3 sm:py-4 flex items-start gap-3 sm:gap-4 group"
                >
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border mt-0.5 shrink-0"
                    style={{ borderColor: meta.color + '44', color: meta.color }}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                      <span className="text-[#e8e4dc] text-base sm:text-lg leading-tight">{cert.title}</span>
                      <span
                        className="text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 border"
                        style={{ color: meta.color, borderColor: meta.color + '33' }}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-[#6b6660]">
                      <span>{cert.institution}</span>
                      <span className="text-[#2a2622]">|</span>
                      <span className="text-[#e7b766] tabular-nums">{cert.issued_date}</span>
                    </div>
                  </div>

                  <motion.div
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    className="text-[#4a453e] mt-2 shrink-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 sm:px-5 pb-4 sm:pb-5 border-t border-[#1f1c17] pt-3 sm:pt-4 ml-0 sm:ml-12">
                        <p className="text-[12px] text-[#a8a29e] leading-relaxed mb-4">
                          {cert.description}
                        </p>

                        <div className="mb-4">
                          <div className="text-[9px] uppercase tracking-[0.3em] text-[#6b6660] mb-2">
                            curriculum modules
                          </div>
                          <ul className="space-y-1.5">
                            {cert.curriculum_notes.map((note, j) => (
                              <motion.li
                                key={j}
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: j * 0.04 }}
                                className="text-[11px] text-[#8a857e] leading-snug flex items-start gap-2"
                              >
                                <span style={{ color: meta.color }} className="mt-0.5 shrink-0">{'>'}</span>
                                <span>{note}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {cert.skills.map((skill, j) => (
                            <span
                              key={j}
                              className="text-[9px] px-2 py-0.5 border tracking-wide"
                              style={{
                                color: meta.color,
                                borderColor: meta.color + '22',
                                background: meta.color + '08',
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 border border-dashed border-[#1f1c17] px-5 py-4">
          <div className="text-[9px] uppercase tracking-[0.3em] text-[#4a453e] mb-2">
            // system note
          </div>
          <p className="text-[11px] text-[#6b6660] leading-relaxed max-w-xl">
            Four Cornell certificates. Not because the credential matters — because the curriculum
            forced me to articulate what I already knew, find the gaps in what I thought I knew,
            and build frameworks for the parts nobody teaches you.
          </p>
        </div>
      </div>
    </section>
  );
}

import { motion } from 'framer-motion';
import { SectionHeader } from './Work';

export default function Contact() {
  return (
    <section id="contact" className="relative py-20 md:py-32 border-b border-[#1f1c17]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader path="ssh hello@conscious-shell.com" jp="送信 — transmit" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-10 grid grid-cols-12 gap-8"
        >
          <div className="col-span-12 lg:col-span-8">
            <div className="text-[#6b6660] text-sm leading-relaxed">
              # establishing secure tyrell.link ...
              <br /># handshake ........................... <span className="text-[#5ec8d8]">OK</span>
              <br /># channel ............................. <span className="text-[#e7b766]">OPEN</span>
              <br /># latency ............................. <span className="text-[#5ec8d8]">~48h</span>
            </div>

            <h2 className="mt-8 text-4xl md:text-6xl lg:text-7xl leading-[1.05] chroma text-[#e8e4dc]">
              LET'S BUILD
              <br /> <span className="neon-amber">SOMETHING WORTH</span>
              <br /> SHIPPING<span className="neon-pink">.</span>
            </h2>

            <div className="mt-4 font-jp text-[#5ec8d8] text-sm md:text-base">
              何か形にする価値のあるものを作ろう。
            </div>

            <p className="mt-8 text-[#a8a29e] max-w-xl leading-relaxed">
              Tell me what you're working on — product, team, or both — and I'll reply with an honest read on
              whether I can help. No auto-responders. No sales funnel.
            </p>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3">
              <a
                href="mailto:hello@conscious-shell.com"
                data-cursor="hover"
                className="group flex items-center justify-between gap-4 border border-[#2a2620] hover:border-[#e7b766] px-5 py-4 transition-colors"
              >
                <span className="flex items-center gap-3 text-[#e8e4dc]">
                  <span className="text-[#e7b766]">$</span>
                  <span>mail hello@conscious-shell.com</span>
                </span>
                <span className="text-[#6b6660] group-hover:text-[#e7b766] transition-colors">→</span>
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                data-cursor="hover"
                className="group flex items-center justify-between gap-4 border border-[#2a2620] hover:border-[#5ec8d8] px-5 py-4 transition-colors"
              >
                <span className="flex items-center gap-3 text-[#e8e4dc]">
                  <span className="text-[#5ec8d8]">$</span>
                  <span>open linkedin</span>
                </span>
                <span className="text-[#6b6660] group-hover:text-[#5ec8d8] transition-colors">→</span>
              </a>
            </div>

            <div className="mt-10 text-[11px] text-[#4a453e]">
              # session logged · response time ~48h · all tears, in rain
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="border-l border-[#e7b766] pl-5">
              <div className="text-[10px] uppercase tracking-widest text-[#6b6660] mb-2">
                INCEPT — TRANSMISSION FRAGMENT
              </div>
              <p className="text-[#e8e4dc] text-sm leading-relaxed italic">
                "I've seen things you people wouldn't believe … dashboards shipped in the rain, research
                decks lost at the gates of the Tannhäuser Quarterly Review."
              </p>
              <p className="mt-3 font-jp text-[#5ec8d8]/80 text-xs">
                涙のように、雨に流されて。
              </p>
              <div className="mt-4 text-[10px] text-[#4a453e]">
                — excerpt, hypothetical monologue.v4.7
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

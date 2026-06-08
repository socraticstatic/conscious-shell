import { useState } from 'react';
import { motion } from 'framer-motion';

const DISPATCHES = [
  { date: '2026-05-17', repo: 'conscious-shell', msg: 'remove Skyline2049 section and its data pipeline', redacted: false },
  { date: '2026-05-17', repo: 'conscious-shell', msg: 'fix: tone down dossier animations — fade+lift instead of slide, instant border', redacted: false },
  { date: '2026-05-13', repo: 'conscious-shell', msg: 'feat: Dossier Mode complete — case study overlay for all portfolio projects', redacted: false },
  { date: '2026-05-13', repo: 'conscious-shell', msg: 'feat: seed STAR case study content for all 12 portfolio projects', redacted: false },
  { date: '2026-04-24', repo: 'conscious-shell', msg: 'feat(esper): randomize photo on load, cycle on reset, group hotspots by photo', redacted: false },
  { date: '2026-04-19', repo: 'hermes-agent', msg: 'fix(tui): drain message queue on every busy → false transition', redacted: false },
  { date: '2026-04-19', repo: 'hermes-agent', msg: 'fix(tui-gateway): dispatch slow RPC handlers on a thread pool', redacted: false },
  { date: '2026-04-19', repo: 'hermes-agent', msg: 'fix(discord): close two low-severity adapter races', redacted: true },
  { date: '2026-04-18', repo: 'vibevoice-sidecar', msg: 'feat(sidecar): FastAPI server + voice listing + path traversal guard', redacted: false },
  { date: '2026-04-18', repo: 'vibevoice-sidecar', msg: 'feat(sidecar): synthesize.py + voice_registry with TDD tests', redacted: false },
  { date: '2026-04-18', repo: 'vibevoice-sidecar', msg: 'chore(sidecar): launchd plist with KeepAlive + MPS fallback env', redacted: true },
  { date: '2026-05-17', repo: 'pen-and-paper', msg: 'feat(data): seed catalog of 1,604 pens + 1,191 papers via Firecrawl', redacted: false },
  { date: '2026-04-17', repo: 'pen-and-paper', msg: 'chore: initialize pen-and-paper project with design spec and phased plan', redacted: false },
  { date: '2026-04-09', repo: 'hermes-agent', msg: 'docs: add PR review guides, rework quickstart, slim down installation', redacted: true },
];

function redactMessage(msg: string): string {
  const chars = msg.split('');
  const redactCount = Math.floor(chars.length * (0.3 + Math.random() * 0.3));
  const indices = Array.from({ length: chars.length }, (_, i) => i)
    .sort(() => Math.random() - 0.5)
    .slice(0, redactCount);
  indices.forEach(i => { if (chars[i] !== ' ') chars[i] = '\u2588'; });
  return chars.join('');
}

const INITIAL_COUNT = 7;

export default function GitArchaeology() {
  const [shown, setShown] = useState(INITIAL_COUNT);
  const visible = DISPATCHES.slice(0, shown);

  return (
    <section className="relative py-24 px-6 max-w-3xl mx-auto">
      <style>{`
        @keyframes glitch-flicker {
          0%, 90%, 100% { opacity: 1; }
          92% { opacity: 0.3; }
          94% { opacity: 0.8; }
          96% { opacity: 0.2; }
        }
        @keyframes pulse-line {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        .redacted-char { animation: glitch-flicker 3s infinite; animation-delay: var(--d); }
        .timeline-line { animation: pulse-line 4s ease-in-out infinite; }
      `}</style>

      <h2 className="text-[#e8e4dc] text-lg font-mono uppercase tracking-wider mb-2">
        Intercepted Dispatches <span className="text-[#6b6660]">//</span> git archaeology
      </h2>
      <p className="text-[#6b6660] text-xs font-mono mb-12 italic">
        # transmissions recovered from .git/objects — origin unknown, timestamps verified
      </p>

      <div className="relative">
        {/* Timeline line */}
        <div className="timeline-line absolute left-4 top-0 bottom-0 w-px bg-[#00d4ff]/40" />

        <div className="flex flex-col gap-5">
          {visible.map((d, i) => {
            const offset = i % 2 === 0 ? 'ml-10' : 'ml-14';
            const displayMsg = d.redacted ? redactMessage(d.msg) : d.msg;
            const stamp = d.redacted ? 'REDACTED' : i % 3 === 0 ? 'INTERCEPTED' : 'DECLASSIFIED';
            const stampColor = d.redacted ? 'text-[#ff006e]' : 'text-[#6b6660]';

            return (
              <motion.div
                key={`${d.date}-${i}`}
                className={`${offset} relative border border-[#1f1c17] bg-[#0b0a08]/60 rounded p-4`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                {/* Dot on timeline */}
                <div className="absolute -left-[calc(100%-1.5rem)] hidden" />
                <div
                  className="absolute top-5 w-2 h-2 rounded-full bg-[#00d4ff]/60"
                  style={{ left: i % 2 === 0 ? '-1.75rem' : '-2.75rem' }}
                />

                {/* Top bar */}
                <div className="flex items-center justify-between mb-2 text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className="text-[#6b6660]">{d.date.replace(/-/g, '.')}</span>
                    <span className="text-[#00d4ff]">{d.repo}</span>
                  </div>
                  <span className={`${stampColor} uppercase text-[9px] tracking-widest border border-current px-1.5 py-0.5 rounded-sm`}>
                    {stamp}
                  </span>
                </div>

                {/* Message */}
                <p className="text-[#e8e4dc] text-sm font-mono leading-relaxed">
                  {d.redacted ? (
                    displayMsg.split('').map((ch, ci) => (
                      ch === '\u2588' ? (
                        <span key={ci} className="redacted-char text-[#ff006e]" style={{ '--d': `${ci * 0.1}s` } as React.CSSProperties}>
                          {ch}
                        </span>
                      ) : <span key={ci}>{ch}</span>
                    ))
                  ) : displayMsg}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {shown < DISPATCHES.length && (
        <motion.button
          onClick={() => setShown(DISPATCHES.length)}
          className="mt-10 ml-10 text-xs font-mono uppercase tracking-widest text-[#00d4ff] border border-[#00d4ff]/30 px-4 py-2 rounded hover:bg-[#00d4ff]/10 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          [ decrypt more ]
        </motion.button>
      )}
    </section>
  );
}

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CodeRain from './CodeRain';

type Line = { prompt: string; cmd: string; out?: string[] };

const SCRIPT: Line[] = [
  {
    prompt: '~',
    cmd: 'whoami',
    out: ['micah boswell · design leader · est. 2000'],
  },
  {
    prompt: '~',
    cmd: 'cat /portfolio/summary',
    out: [
      '20+ years · 126 projects · 20+ clients · 3 books',
      'research → product → traction → organizations that ship',
    ],
  },
  {
    prompt: '~',
    cmd: 'rep7 --classify subject',
    out: ['classification: human // aligned: design // status: active_duty'],
  },
  {
    prompt: '~',
    cmd: './enter --archive',
  },
];

type RenderedLine = Line & { typed: string; outShown: number };

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function Hero() {
  const [lines, setLines] = useState<RenderedLine[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      for (let i = 0; i < SCRIPT.length; i++) {
        const s = SCRIPT[i];
        setLines((prev) => [...prev, { ...s, typed: '', outShown: 0 }]);
        for (let c = 1; c <= s.cmd.length; c++) {
          if (!active) return;
          await wait(20 + Math.random() * 40);
          setLines((prev) => {
            const next = [...prev];
            next[i] = { ...next[i], typed: s.cmd.slice(0, c) };
            return next;
          });
        }
        await wait(200);
        if (s.out) {
          for (let j = 1; j <= s.out.length; j++) {
            if (!active) return;
            await wait(80);
            setLines((prev) => {
              const next = [...prev];
              next[i] = { ...next[i], outShown: j };
              return next;
            });
          }
        }
        await wait(120);
      }
      if (active) setDone(true);
    })();
    return () => { active = false; };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-14 overflow-hidden">
      <CodeRain className="absolute inset-0 opacity-[0.06]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#07070a]/30 via-transparent to-[#07070a] pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 pt-24 md:pt-28 pb-20">
        {/* Classification strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center flex-wrap gap-3 text-[10px] uppercase tracking-widest mb-8"
        >
          <span className="px-2 py-1 bg-[#e7b766] text-[#0b0a08] font-bold">REP-7 DOSSIER</span>
          <span className="px-2 py-1 border border-[#e7b766]/60 text-[#e7b766]">CLASSIFIED // PUBLIC</span>
          <span className="px-2 py-1 border border-[#5ec8d8]/60 text-[#5ec8d8]">LOS ANGELES · 2049</span>
          <span className="hidden sm:inline-flex items-center gap-2 px-2 py-1 border border-[#2a2620] text-[#6b6660]">
            <span className="w-1.5 h-1.5 bg-[#ff7a5c] rounded-full animate-pulse" />
            recording
          </span>
        </motion.div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] leading-[0.9] text-[#e8e4dc] chroma"
            >
              <span className="block">MICAH</span>
              <span className="block neon-amber">BOSWELL<span className="neon-pink">_</span></span>
            </motion.h1>

            <div className="mt-4 flex items-baseline gap-3 flex-wrap">
              <span className="font-jp text-xl md:text-2xl text-[#5ec8d8]">ミカ・ボズウェル</span>
              <span className="text-[#4a453e]">//</span>
              <span className="text-xs uppercase tracking-widest text-[#a8a29e]">
                design_leader · unit 2000 · active
              </span>
            </div>

            <div className="mt-10 md:mt-12 text-sm md:text-[15px] leading-7">
              {lines.map((l, i) => (
                <div key={i} className="mb-3">
                  <div className="flex gap-2">
                    <span className="text-[#6b6660]">{l.prompt}</span>
                    <span className="text-[#e7b766]">$</span>
                    <span className="text-[#e8e4dc]">
                      {l.typed}
                      {l.typed.length < l.cmd.length && (
                        <span className="inline-block w-[7px] h-[14px] bg-[#e7b766] animate-pulse align-middle ml-px" />
                      )}
                    </span>
                  </div>
                  {l.out &&
                    l.out.slice(0, l.outShown).map((o, j) => (
                      <div key={j} className="text-[#6b6660] pl-6">
                        {o}
                      </div>
                    ))}
                </div>
              ))}

              {done && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mt-16 flex gap-4 items-center"
                >
                  <a
                    href="#work"
                    data-cursor="hover"
                    className="px-5 py-2.5 bg-[#e7b766] text-[#07070a] text-sm font-mono hover:bg-[#d4a554] transition-colors"
                  >
                    view work
                  </a>
                  <a
                    href="#contact"
                    data-cursor="hover"
                    className="px-5 py-2.5 border border-[#2a2620] text-sm font-mono text-[#a8a29e] hover:border-[#e7b766] hover:text-[#e7b766] transition-colors"
                  >
                    get in touch
                  </a>
                </motion.div>
              )}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 lg:pl-6">
            <BiometricPanel />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 z-10 border-t border-[#1f1c17] bg-[#07070a]/90 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-3 flex items-center justify-between text-[11px] text-[#6b6660] flex-wrap gap-2">
          <span>
            <span className="text-[#e7b766]">conscious-shell</span> v4.7
          </span>
          <span className="font-jp text-[#5ec8d8]/70 hidden md:inline">
            応答時間 〜48時間
          </span>
          <span>status: <span className="text-[#e7b766]">active</span></span>
        </div>
      </div>
    </section>
  );
}

function BiometricPanel() {
  const [now, setNow] = useState(() => new Date());
  const [vals, setVals] = useState({ iris: 70, pupil: 3.2, temp: 36.7, baseline: 'stable' });
  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
      setVals({
        iris: 64 + Math.round(Math.random() * 10),
        pupil: Number((2.8 + Math.random() * 0.8).toFixed(2)),
        temp: Number((36.4 + Math.random() * 0.6).toFixed(1)),
        baseline: Math.random() > 0.88 ? 'drift' : 'stable',
      });
    }, 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="border border-[#1f1c17] bg-[#0b0a08]/70 backdrop-blur-sm">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1f1c17] text-[10px]">
        <span className="flex items-center gap-2 text-[#e7b766]">
          <span className="w-1.5 h-1.5 bg-[#e7b766] animate-pulse" />
          SUBJECT BIOMETRICS
        </span>
        <span className="font-jp text-[#5ec8d8]">生体認証</span>
      </div>
      <dl className="p-3 text-xs space-y-2">
        {[
          ['T.UTC', now.toISOString().slice(11, 19)],
          ['IRIS.SCAN', `${vals.iris}% match`],
          ['PUPIL.DIL', `${vals.pupil} mm`],
          ['BODY.TEMP', `${vals.temp} °c`],
          ['BASELINE', vals.baseline],
          ['ROLE', 'design_leader'],
          ['AVAIL', 'select engagements'],
          ['FUEL', 'yerba mate · brewed'],
        ].map(([k, v]) => (
          <div key={k} className="flex items-baseline gap-3 border-b border-dashed border-[#1f1c17] pb-1.5 last:border-0">
            <dt className="text-[#6b6660] w-24 shrink-0">{k}</dt>
            <dd className="text-[#e8e4dc] tabular-nums truncate">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="border-t border-[#1f1c17] px-3 py-2 text-[10px] text-[#4a453e] flex items-center justify-between">
        <span>// monitoring</span>
        <span className="text-[#5ec8d8]">● live</span>
      </div>
    </div>
  );
}


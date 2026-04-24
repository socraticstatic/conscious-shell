import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeader } from './Work';
import type { VkQuestion } from '../lib/supabase';

export default function VoightKampff({ questions }: { questions: VkQuestion[] }) {
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [baseline, setBaseline] = useState({ iris: 68, pulse: 72, resp: 16, gsr: 1.3 });

  const q = questions[i];

  useEffect(() => {
    const id = setInterval(() => {
      setBaseline({
        iris: 62 + Math.round(Math.random() * 14),
        pulse: 68 + Math.round(Math.random() * 10),
        resp: 14 + Math.round(Math.random() * 6),
        gsr: Number((1.0 + Math.random() * 0.8).toFixed(1)),
      });
    }, 1400);
    return () => clearInterval(id);
  }, []);

  if (!questions.length) return null;

  const handleRespond = () => {
    if (!revealed) {
      setRevealed(true);
    } else {
      setI((v) => (v + 1) % questions.length);
      setRevealed(false);
      window.dispatchEvent(new CustomEvent('intel:vk_answer'));
    }
  };
  const prev = () => {
    setI((v) => (v - 1 + questions.length) % questions.length);
    setRevealed(false);
  };

  return (
    <section id="empathy" className="relative py-20 md:py-28 border-b border-[#1f1c17]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader path="voight-kampff --empathy_test" jp="感情反応測定" right={`q.${String(i + 1).padStart(2, '0')}/${String(questions.length).padStart(2, '0')}`} />

        <div className="mt-10 grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-8 border border-[#1f1c17] bg-[#0b0a08]/60">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#1f1c17] text-[10px]">
              <div className="flex items-center gap-2 text-[#e7b766]">
                <span className="w-1.5 h-1.5 bg-[#ff7a5c] animate-pulse rounded-full" />
                <span>RECORDING — NEXUS-6 SUBJECT PROFILE</span>
              </div>
              <div className="text-[#5ec8d8] font-jp">質問 {String(i + 1).padStart(2, '0')}</div>
            </div>

            <div className="p-6 md:p-10 min-h-[240px] md:min-h-[280px] flex flex-col justify-center">
              <div className="text-[10px] uppercase tracking-widest text-[#6b6660] mb-4">
                category · {q?.category}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={q?.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="font-jp text-[#5ec8d8] text-sm mb-3">{q?.prompt_jp}</div>
                  <p className="text-xl md:text-2xl lg:text-3xl text-[#e8e4dc] leading-snug">
                    {q?.prompt}
                  </p>
                  <AnimatePresence>
                    {revealed && q?.answer && (
                      <motion.p
                        key="answer"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.35 }}
                        className="mt-5 text-base md:text-lg text-[#e7b766] leading-relaxed border-l-2 border-[#e7b766]/40 pl-4"
                      >
                        {q.answer}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between border-t border-[#1f1c17] px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={prev}
                  data-cursor="hover"
                  className="px-3 py-1.5 text-xs border border-[#2a2620] text-[#a8a29e] hover:border-[#e7b766] hover:text-[#e7b766] transition-colors"
                >
                  ← prev
                </button>
                <button
                  onClick={handleRespond}
                  data-cursor="hover"
                  className="px-3 py-1.5 text-xs border border-[#e7b766] text-[#e7b766] hover:bg-[#e7b766] hover:text-[#0b0a08] transition-colors"
                >
                  {revealed ? 'next →' : 'respond →'}
                </button>
              </div>
              <div className="text-[10px] text-[#6b6660]">enter = next · esc = dismiss</div>
            </div>

            <PulseTrack />
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-3">
            <Gauge label="iris" jp="虹彩" value={baseline.iris} suffix="%" max={100} hue="amber" />
            <Gauge label="pulse" jp="脈拍" value={baseline.pulse} suffix="bpm" max={120} hue="cyan" />
            <Gauge label="respiration" jp="呼吸" value={baseline.resp} suffix="/min" max={30} hue="amber" />
            <Gauge label="skin galvanic" jp="皮膚" value={baseline.gsr} suffix="μS" max={3} hue="pink" />
            <div className="border border-[#1f1c17] p-3 text-[11px] text-[#6b6660] leading-relaxed">
              <span className="text-[#e7b766]">baseline:</span>{' '}
              {baseline.pulse < 78 && baseline.resp < 20 ? 'stable' : 'elevated — retesting'}
              <br />
              <span className="text-[#5ec8d8]">deception:</span>{' '}
              {Math.random() > 0.9 ? 'anomaly' : 'none detected'}
              <br />
              <span className="text-[#ff7a5c]">classification:</span>{' '}
              <span className="text-[#e8e4dc]">human / design-aligned</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Gauge({
  label,
  jp,
  value,
  suffix,
  max,
  hue,
}: {
  label: string;
  jp: string;
  value: number;
  suffix: string;
  max: number;
  hue: 'amber' | 'cyan' | 'pink';
}) {
  const pct = Math.min(100, (value / max) * 100);
  const color = hue === 'amber' ? '#e7b766' : hue === 'cyan' ? '#5ec8d8' : '#ff7a5c';
  return (
    <div className="border border-[#1f1c17] p-3">
      <div className="flex items-baseline justify-between text-[10px] uppercase tracking-widest text-[#6b6660]">
        <span>{label}</span>
        <span className="font-jp text-[#a8a29e]">{jp}</span>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <motion.div
          key={value}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          className="text-xl tabular-nums"
          style={{ color }}
        >
          {value}
          <span className="text-[10px] text-[#6b6660] ml-1">{suffix}</span>
        </motion.div>
      </div>
      <div className="mt-2 h-1 bg-[#1a1712] relative overflow-hidden">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
          className="h-full"
          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
        />
      </div>
    </div>
  );
}

function PulseTrack() {
  const [pts, setPts] = useState<number[]>(Array(80).fill(0));
  useEffect(() => {
    let t = 0;
    const id = setInterval(() => {
      t += 1;
      setPts((prev) => {
        const next = prev.slice(1);
        const base = Math.sin(t / 3) * 0.25 + Math.sin(t / 7) * 0.15;
        const spike = t % 18 === 0 ? 0.9 : t % 18 === 1 ? -0.5 : 0;
        next.push(base + spike + (Math.random() - 0.5) * 0.1);
        return next;
      });
    }, 70);
    return () => clearInterval(id);
  }, []);

  const path = pts
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (pts.length - 1)) * 100} ${50 - v * 40}`)
    .join(' ');

  return (
    <div className="border-t border-[#1f1c17] bg-[#07070a]">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-14 block">
        <path d={path} stroke="#5ec8d8" strokeWidth="0.6" fill="none" style={{ filter: 'drop-shadow(0 0 2px #5ec8d8)' }} />
      </svg>
    </div>
  );
}

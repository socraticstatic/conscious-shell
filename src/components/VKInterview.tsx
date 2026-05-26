import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, type LinkedInRecommendation } from '../lib/supabase';

type Traits = { empathy: number; logic: number; creativity: number; darkness: number; honesty: number };
type Option = { text: string; traits: Traits; next_idx: number };
type Question = {
  id: string; question_text: string; category: string;
  sequence_order: number; options: Option[]; is_root: boolean; mood: string;
};
type Profile = {
  id: string; name: string; description: string;
  trait_weights: Traits;
  palette: Record<string, string> | string[] | null;
  section_order: string[]; tone: string;
};
type Answer = { question_id: string; answer_index: number; traits: Traits };
type State = 'idle' | 'intro' | 'interviewing' | 'calculating' | 'result';

const MOOD_COLORS: Record<string, string> = {
  tense: '#ff7a5c', gentle: '#e7b766', cold: '#5ec8d8',
  neutral: '#6b6660', dark: '#ff7a5c', warm: '#e7b766',
};
const TRAIT_KEYS: (keyof Traits)[] = ['empathy', 'logic', 'creativity', 'darkness', 'honesty'];
const BOOT_LINES = [
  'Initializing empathy calibration...',
  'Loading question tree (52 nodes)...',
  'Biometric baseline: RECORDING',
  'Interviewer: READY',
];

function pickCorroboration(
  recs: LinkedInRecommendation[],
  dominantTrait: string,
): LinkedInRecommendation | null {
  if (!recs.length) return null;
  const matches = recs.filter((r) => r.traits_signal?.includes(dominantTrait));
  const pool = matches.length ? matches : recs;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function VKInterview({ recommendations = [] }: { recommendations?: LinkedInRecommendation[] }) {
  const [state, setState] = useState<State>('idle');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [queue, setQueue] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [bootLine, setBootLine] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const load = async () => {
      const [qRes, pRes] = await Promise.all([
        supabase.from('vk_interview_questions').select('*').order('sequence_order'),
        supabase.from('vk_personality_profiles').select('*'),
      ]);
      if (qRes.data) setQuestions(qRes.data);
      if (pRes.data) setProfiles(pRes.data);
    };
    load();
  }, []);

  const accumulatedTraits = (): Traits => {
    const t: Traits = { empathy: 0, logic: 0, creativity: 0, darkness: 0, honesty: 0 };
    answers.forEach((a) => TRAIT_KEYS.forEach((k) => { t[k] += a.traits[k] || 0; }));
    return t;
  };

  const startIntro = () => {
    setState('intro');
    setBootLine(0);
    let line = 0;
    const tick = () => {
      line++;
      if (line >= BOOT_LINES.length) {
        setTimeout(() => beginInterview(), 600);
        return;
      }
      setBootLine(line);
      timerRef.current = setTimeout(tick, 700);
    };
    timerRef.current = setTimeout(tick, 700);
  };

  const beginInterview = () => {
    const roots = questions.filter((q) => q.is_root).sort((a, b) => a.sequence_order - b.sequence_order);
    setQueue(roots.slice(0, 5));
    setQIndex(0);
    setAnswers([]);
    setState('interviewing');
  };

  const handleAnswer = (optIndex: number) => {
    const current = queue[qIndex];
    const opt = current.options[optIndex];
    const newAnswers = [...answers, { question_id: current.id, answer_index: optIndex, traits: opt.traits }];
    setAnswers(newAnswers);

    if (opt.next_idx === -1 || qIndex >= 11) {
      setState('calculating');
      setTimeout(() => computeResult(newAnswers), 4000);
      return;
    }

    const roots = questions.filter((q) => q.is_root);
    const isLastRoot = qIndex === roots.slice(0, 5).length - 1 || qIndex >= 4;

    if (!isLastRoot && qIndex < queue.length - 1) {
      setQIndex(qIndex + 1);
      return;
    }

    // Branch: find next question by sequence_order
    const next = questions.find((q) => q.sequence_order === opt.next_idx);
    if (next) {
      setQueue([...queue, next]);
      setQIndex(qIndex + 1);
    } else {
      setState('calculating');
      setTimeout(() => computeResult(newAnswers), 4000);
    }
  };

  const computeResult = (ans: Answer[]) => {
    const t: Traits = { empathy: 0, logic: 0, creativity: 0, darkness: 0, honesty: 0 };
    ans.forEach((a) => TRAIT_KEYS.forEach((k) => { t[k] += a.traits[k] || 0; }));

    let best: Profile | null = null;
    let bestDist = Infinity;
    profiles.forEach((p) => {
      const dist = Math.sqrt(TRAIT_KEYS.reduce((sum, k) => sum + (t[k] - (p.trait_weights[k] || 0)) ** 2, 0));
      if (dist < bestDist) { bestDist = dist; best = p; }
    });

    setMatchedProfile(best);
    setState('result');

    if (best) {
      // PersonalizationProvider expects detail = { profile, traits } where profile carries name/palette/sectionOrder/tone.
      // Its activateProfile reads profile.palette.{primary,secondary,accent,bg,text}, so palette must be the object shape.
      const paletteObj =
        best.palette && !Array.isArray(best.palette) && typeof best.palette === 'object'
          ? (best.palette as Record<string, string>)
          : {};
      const profile = {
        name: best.name,
        palette: paletteObj,
        sectionOrder: best.section_order ?? [],
        tone: best.tone,
      };
      const detail = { profile, traits: t };
      window.dispatchEvent(new CustomEvent('vk:profile', { detail }));
      localStorage.setItem('vk-dossier', JSON.stringify(detail));
    }
  };

  const currentQ = queue[qIndex];
  const moodColor = currentQ ? (MOOD_COLORS[currentQ.mood] || '#6b6660') : '#6b6660';

  if (state === 'idle') {
    return (
      <section className="relative py-16 border-b border-[#1f1c17]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }} className="font-mono text-xs tracking-widest text-[#6b6660] mb-4">
            VOIGHT-KAMPFF v3.1 — FULL INTERVIEW AVAILABLE
          </motion.div>
          <button onClick={startIntro} className="px-6 py-2 border border-[#e7b766] text-[#e7b766] text-sm font-mono tracking-wider hover:bg-[#e7b766] hover:text-[#0b0a08] transition-colors">
            BEGIN INTERVIEW
          </button>
        </div>
      </section>
    );
  }

  if (state === 'intro') {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-[#0b0a08]">
        <div className="font-mono text-sm space-y-3 px-6">
          {BOOT_LINES.map((line, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={i <= bootLine ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.3 }} className={i <= bootLine ? 'text-[#5ec8d8]' : 'text-transparent'}>
              {'>'} {line}
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  if (state === 'interviewing' && currentQ) {
    const traits = accumulatedTraits();
    const maxTrait = Math.max(...TRAIT_KEYS.map((k) => traits[k]), 1);
    return (
      <section className="relative min-h-screen bg-[#0b0a08] flex flex-col" style={{ boxShadow: `inset 0 0 120px ${moodColor}11` }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f1c17]">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: moodColor }} />
            <span className="text-[#6b6660]">{currentQ.mood}</span>
          </div>
          <div className="flex items-center gap-1">
            {TRAIT_KEYS.map((k) => (
              <div key={k} className="flex flex-col items-center gap-0.5">
                <div className="w-3 h-10 bg-[#1a1712] relative overflow-hidden rounded-sm">
                  <motion.div animate={{ height: `${(traits[k] / maxTrait) * 100}%` }} className="absolute bottom-0 w-full bg-[#e7b766]/70 rounded-sm" />
                </div>
                <span className="text-[8px] text-[#6b6660]">{k[0].toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-6">
          <div className="max-w-2xl w-full">
            <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#6b6660] mb-2 font-mono">
              Q{String(qIndex + 1).padStart(2, '0')} / {currentQ.category}
            </div>
            <AnimatePresence mode="wait">
              <motion.p key={currentQ.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }} className="text-base sm:text-xl md:text-2xl text-[#e8e4dc] leading-relaxed mb-6 sm:mb-10">
                {currentQ.question_text}
              </motion.p>
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
              {currentQ.options.map((opt, i) => (
                <motion.button key={i} whileTap={{ scale: 0.98 }} onClick={() => handleAnswer(i)} className="text-left p-3 sm:p-4 border border-[#1f1c17] bg-[#0d0c09] hover:border-[#e7b766]/50 active:border-[#e7b766]/50 hover:bg-[#0f0e0a] active:bg-[#0f0e0a] transition-colors text-xs sm:text-sm text-[#a8a29e] hover:text-[#e8e4dc] active:text-[#e8e4dc]">
                  <span className="text-[10px] text-[#6b6660] font-mono mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt.text}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-[#1f1c17] text-[10px] text-[#6b6660] font-mono">
          Question {qIndex + 1} of ~{queue.length} loaded
        </div>
      </section>
    );
  }

  if (state === 'calculating') {
    const traits = accumulatedTraits();
    return (
      <section className="relative min-h-screen bg-[#0b0a08] flex items-center justify-center">
        <div className="text-center space-y-6 px-6">
          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="font-mono text-sm text-[#5ec8d8] tracking-widest">
            ANALYZING RESPONSE PATTERNS...
          </motion.div>
          <div className="flex justify-center gap-6 mt-8">
            {TRAIT_KEYS.map((k) => (
              <div key={k} className="flex flex-col items-center gap-2">
                <motion.div initial={{ height: 0 }} animate={{ height: `${Math.min(traits[k] * 8, 80)}px` }} transition={{ duration: 2, delay: 0.3 }} className="w-5 bg-[#e7b766]/60 rounded-sm" />
                <span className="text-[10px] text-[#6b6660] font-mono">{k.slice(0, 3)}</span>
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-xs text-[#e7b766]">
                  {traits[k].toFixed(1)}
                </motion.span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (state === 'result' && matchedProfile) {
    const traits = accumulatedTraits();
    const maxVal = Math.max(...TRAIT_KEYS.map((k) => traits[k]), 1);
    const dominantTrait = TRAIT_KEYS.reduce((a, b) => (traits[a] >= traits[b] ? a : b), 'empathy');
    const corroboration = pickCorroboration(recommendations, dominantTrait);
    return (
      <section className="relative min-h-screen bg-[#0b0a08] flex items-center justify-center py-20">
        <div className="max-w-xl w-full px-6 space-y-8">
          <div className="font-mono text-[10px] text-[#5ec8d8] tracking-widest">DOSSIER COMPILED</div>
          <h2 className="text-3xl md:text-4xl text-[#e8e4dc] font-light">{matchedProfile.name}</h2>
          <p className="text-sm text-[#a8a29e] leading-relaxed">{matchedProfile.description}</p>

          <div className="border border-[#1f1c17] p-4 space-y-3">
            <div className="text-[10px] font-mono text-[#6b6660] tracking-widest mb-2">TRAIT ANALYSIS</div>
            {TRAIT_KEYS.map((k) => (
              <div key={k} className="flex items-center gap-3">
                <span className="text-xs text-[#6b6660] w-20 font-mono">{k}</span>
                <div className="flex-1 h-2 bg-[#1a1712] rounded-sm overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(traits[k] / maxVal) * 100}%` }} transition={{ duration: 1 }} className="h-full bg-[#e7b766] rounded-sm" />
                </div>
                <span className="text-xs text-[#e7b766] w-8 text-right">{traits[k].toFixed(0)}</span>
              </div>
            ))}
          </div>

          {matchedProfile.palette && (() => {
            const swatches = Array.isArray(matchedProfile.palette)
              ? matchedProfile.palette
              : (typeof matchedProfile.palette === 'object' ? Object.values(matchedProfile.palette as Record<string, string>) : []);
            if (!swatches.length) return null;
            return (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#6b6660] mr-2">PALETTE</span>
                {swatches.map((c, i) => (
                  <div key={i} className="w-6 h-6 rounded-sm border border-[#1f1c17]" style={{ backgroundColor: c }} title={c} />
                ))}
              </div>
            );
          })()}

          {corroboration && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="border border-[#5ec8d8]/30 p-4 bg-[#091418]/40"
            >
              <div className="text-[10px] font-mono text-[#5ec8d8] tracking-widest mb-3">
                CROSS-REFERENCE · FIELD LOG · {dominantTrait.toUpperCase()}
              </div>
              <p className="text-sm md:text-base text-[#dfd9cd] leading-relaxed italic border-l border-[#5ec8d8]/40 pl-4">
                &ldquo;{corroboration.recommendation_text}&rdquo;
              </p>
              <div className="mt-3 text-[10px] font-mono text-[#7a6e62] tracking-widest">
                — {corroboration.recommender_name.toLowerCase()} · {corroboration.recommender_role.toLowerCase()} · {corroboration.given_date}
              </div>
            </motion.div>
          )}

          <div className="pt-4 border-t border-[#1f1c17] flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#6b6660]">TONE: {matchedProfile.tone}</span>
            <button onClick={() => setState('idle')} className="text-xs font-mono text-[#5ec8d8] hover:text-[#e7b766] transition-colors">
              DISMISS
            </button>
          </div>
        </div>
      </section>
    );
  }

  return null;
}

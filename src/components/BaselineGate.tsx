import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Unlock } from 'lucide-react';

type Status = 'locked' | 'testing' | 'pass' | 'fail';

const PROMPTS = [
  { call: 'cells.', response: 'cells', hint: 'within cells interlinked' },
  { call: 'pen. what brand. first love.', response: 'pilot', hint: 'japanese. metropolitan.' },
  { call: 'paper. what weight. holds the ink.', response: 'tomoe river', hint: '52gsm. ghosting.' },
  { call: 'the agent. what name. yours.', response: 'hermes', hint: 'greek. messenger. grows.' },
  { call: 'voice. her name. she speaks.', response: 'helen', hint: 'the sidecar. MPS. yours.' },
  { call: 'boat. what moves you. wind.', response: 'sail', hint: 'gps. tidal. grib.' },
];

const SESSION_KEY = 'baseline-gate-passed';

export default function BaselineGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>(() => {
    if (sessionStorage.getItem(SESSION_KEY) === '1') return 'pass';
    return 'locked';
  });
  const [step, setStep] = useState(0);
  const [input, setInput] = useState('');
  const [shakes, setShakes] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'testing') inputRef.current?.focus();
  }, [status, step]);

  const begin = () => setStatus('testing');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const answer = input.trim().toLowerCase();
    const correct = PROMPTS[step].response;

    if (answer === correct || answer.includes(correct)) {
      if (step === PROMPTS.length - 1) {
        setStatus('pass');
        sessionStorage.setItem(SESSION_KEY, '1');
      } else {
        setStep((s) => s + 1);
        setInput('');
      }
    } else {
      setAttempts((a) => a + 1);
      setShakes((s) => s + 1);
      if (attempts >= 2) {
        setStatus('fail');
        setTimeout(() => {
          setStatus('locked');
          setStep(0);
          setInput('');
          setAttempts(0);
        }, 3000);
      }
    }
  };

  if (status === 'pass') {
    return <>{children}</>;
  }

  return (
    <section id="haiku" className="relative py-20 md:py-28 border-b border-[#1f1c17]">
      <div className="max-w-3xl mx-auto px-6 md:px-10">
        <div className="text-center mb-12">
          <div className="text-[10px] tracking-[0.5em] uppercase text-[#ff006e]/80 mb-3">
            — baseline test · clearance required
          </div>
          <h2 className="text-3xl md:text-4xl font-mono font-light tracking-tight">
            constant k. <span className="text-[#ff006e]">prove it.</span>
          </h2>
          <p className="mt-4 text-[#6b6660] text-sm max-w-lg mx-auto leading-relaxed">
            this section is locked. to proceed, you must know who built this.
            answer the call. stay within baseline.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {status === 'locked' && (
            <motion.div
              key="locked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <button
                onClick={begin}
                className="inline-flex items-center gap-3 border border-[#ff006e]/50 text-[#ff006e] px-6 py-3 text-sm hover:bg-[#ff006e]/10 hover:border-[#ff006e] transition-colors"
              >
                <ShieldAlert className="w-4 h-4" />
                initiate baseline test
              </button>
              <div className="mt-4 text-[10px] text-[#4a453e]">
                # {PROMPTS.length} prompts · 3 attempts per prompt · no second chances
              </div>
            </motion.div>
          )}

          {status === 'testing' && (
            <motion.div
              key={`testing-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border border-[#1f1c17] bg-[#0b0a08]/80 p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="text-[10px] tracking-[0.3em] uppercase text-[#00d4ff]">
                  prompt {step + 1}/{PROMPTS.length}
                </div>
                <div className="flex gap-1">
                  {PROMPTS.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 border ${
                        i < step ? 'bg-[#00d4ff] border-[#00d4ff]' :
                        i === step ? 'border-[#ff006e] animate-pulse' :
                        'border-[#2a2620]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <div className="text-[10px] uppercase tracking-wider text-[#6b6660] mb-2">
                  interviewer:
                </div>
                <div className="text-2xl md:text-3xl font-light text-[#e8e4dc] leading-snug">
                  {PROMPTS[step].call}
                </div>
                <div className="mt-2 text-[10px] text-[#4a453e] italic">
                  hint: {PROMPTS[step].hint}
                </div>
              </div>

              <form onSubmit={submit}>
                <motion.div
                  key={shakes}
                  animate={shakes > 0 ? { x: [0, -8, 8, -4, 4, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="respond..."
                    className="w-full bg-transparent border-b border-[#2a2620] focus:border-[#ff006e] outline-none text-lg text-[#e8e4dc] py-2 placeholder:text-[#2a2620] transition-colors"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </motion.div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] text-[#4a453e]">
                    attempts remaining: {3 - attempts}
                  </span>
                  <button
                    type="submit"
                    className="text-[11px] tracking-[0.2em] uppercase border border-[#00d4ff]/50 text-[#00d4ff] px-4 py-2 hover:bg-[#00d4ff]/10 transition-colors"
                  >
                    submit response
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {status === 'fail' && (
            <motion.div
              key="fail"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 border border-[#ff006e]/50 bg-[#1a0808]/60"
            >
              <div className="text-4xl font-mono text-[#ff006e] mb-3" style={{ textShadow: '0 0 20px rgba(255,122,92,0.6)' }}>
                BASELINE FAIL
              </div>
              <div className="text-[#6b6660] text-sm">
                off-world detected. restarting sequence...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setStatus('pass');
              sessionStorage.setItem(SESSION_KEY, '1');
            }}
            className="text-[10px] text-[#2a2620] hover:text-[#4a453e] transition-colors"
          >
            [ skip — i am not him ]
          </button>
        </div>
      </div>
    </section>
  );
}

export function BaselineUnlocked() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="flex items-center justify-center gap-2 py-4 text-[10px] tracking-[0.3em] uppercase text-[#00d4ff] border-b border-[#1f1c17]"
    >
      <Unlock className="w-3.5 h-3.5" />
      baseline cleared — content declassified
    </motion.div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Minus, X } from 'lucide-react';

type Entry = { id: number; kind: 'in' | 'out' | 'sys'; text: string; color?: string };

const BANNER = [
  '-- dead-drop terminal v0.7 · tyrell off-world unit --',
  'type "help" for available commands.',
  'responses are theatrical. network remains cold.',
];

const HELP = [
  'help           · print this',
  'whoami         · local identity',
  'scan           · passive sweep',
  'trace <host>   · show fake route',
  'decrypt        · decrypt a random fragment',
  'narrate        · summon a noir subtitle',
  'breach         · simulate intrusion event',
  'memorial       · play the memorial sequence',
  'konami         · how to flip to override',
  'roll           · roll a vk suspicion score',
  'weather        · off-world station report',
  'clear          · wipe the terminal',
  'exit           · dock the console',
];

function rip() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 255)).join('.');
}
function rword(len = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
function rhex(len = 24) {
  const chars = '0123456789abcdef';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function DeadDropConsole() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const [entries, setEntries] = useState<Entry[]>(() =>
    BANNER.map((t, i) => ({ id: i, kind: 'sys' as const, text: t, color: '#e7b766' })),
  );
  const nextId = useRef(BANNER.length);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '`' && !isTyping(e)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9e9 });
  }, [entries, open]);

  const push = (kind: Entry['kind'], text: string, color?: string) => {
    const id = ++nextId.current;
    setEntries((e) => [...e.slice(-300), { id, kind, text, color }]);
  };

  const submit = () => {
    const raw = input.trim();
    setInput('');
    if (!raw) return;
    setHistory((h) => [...h, raw].slice(-50));
    setHIdx(-1);
    push('in', raw);
    execute(raw);
  };

  const execute = async (raw: string) => {
    const [cmd, ...rest] = raw.split(/\s+/);
    const c = cmd.toLowerCase();
    const arg = rest.join(' ');

    switch (c) {
      case 'help':
        HELP.forEach((l) => push('out', l, '#a8a29e'));
        break;
      case 'whoami': {
        const id = rword(4).toUpperCase();
        push('out', `operator · N7-${id}`, '#e7b766');
        push('out', 'clearance · observer / level 3', '#a8a29e');
        push('out', `session · ${rhex(12)}`, '#a8a29e');
        push('out', 'status · still more human than human', '#5ec8d8');
        break;
      }
      case 'scan': {
        push('out', '[ scan ] passive sweep initiated', '#5ec8d8');
        for (let i = 0; i < 6; i++) {
          setTimeout(() => {
            const ip = rip();
            const port = ['22', '80', '443', '5900', '8883'][i % 5];
            const ms = 10 + Math.floor(Math.random() * 200);
            push('out', `  ${ip.padEnd(16)} :${port.padEnd(5)} ${ms}ms   [${rword(5)}-edge]`, '#c9b8a6');
          }, 120 * (i + 1));
        }
        setTimeout(() => push('out', '[ scan ] complete · nothing asked for me', '#5ec8d8'), 900);
        break;
      }
      case 'trace': {
        const host = arg || 'off-world.comm';
        push('out', `tracing ${host} ...`, '#5ec8d8');
        const hops = ['local-gw', 'tyrell-edge', 'wallace-core', 'obscura-exchange', host];
        hops.forEach((h, i) =>
          setTimeout(() => push('out', `  ${(i + 1).toString().padStart(2)}  ${rip().padEnd(16)} ${h}`, '#c9b8a6'), 180 * i),
        );
        setTimeout(() => push('out', 'trace ends in rain. as they all do.', '#e7b766'), 180 * hops.length + 200);
        break;
      }
      case 'decrypt': {
        push('out', '[ decrypt ] selecting fragment ...', '#5ec8d8');
        const before = rhex(48);
        const frags = [
          'the owl was artificial',
          'i\'ve seen things you people wouldn\'t believe',
          'wake up · time to die',
          'more human than human',
          'all those moments lost',
          'sodium lamp · amber · still open',
        ];
        const out = frags[Math.floor(Math.random() * frags.length)];
        setTimeout(() => push('out', `  ciphertext: ${before}`, '#a8a29e'), 200);
        setTimeout(() => push('out', `  plaintext : ${out}`, '#ff7a5c'), 900);
        break;
      }
      case 'narrate':
        window.dispatchEvent(new Event('noir:narrate'));
        push('out', '[ ok ] subtitle dispatched', '#7fd6b1');
        break;
      case 'breach':
        window.dispatchEvent(new Event('breach:fire'));
        push('out', '[ !! ] intrusion drama triggered', '#ff7a5c');
        break;
      case 'memorial':
        window.dispatchEvent(new Event('memorial:open'));
        push('out', '[ ok ] memorial queued', '#7fd6b1');
        break;
      case 'konami':
        push('out', 'arrow sequence: ↑ ↑ ↓ ↓ ← → ← → b a', '#e7b766');
        push('out', 'flips the site into override · enjoy the reds', '#a8a29e');
        break;
      case 'roll': {
        const n = Math.floor(Math.random() * 100);
        const verdict = n > 82 ? 'REPLICANT' : n > 40 ? 'INCONCLUSIVE' : 'HUMAN';
        const col = n > 82 ? '#ff3b3b' : n > 40 ? '#e7b766' : '#7fd6b1';
        push('out', `vk suspicion score  :  ${n.toString().padStart(3)}`, '#c9b8a6');
        push('out', `verdict             :  ${verdict}`, col);
        break;
      }
      case 'weather': {
        const stations = [
          {
            name: 'shoulder of orion · attack-ship corridor',
            temp: -270 + Math.floor(Math.random() * 3),
            wind: 540 + Math.floor(Math.random() * 240),
            cond: 'ship-fire · debris hot to the touch',
            vis: 'orange haze for 0.4 parsecs',
            kp: 8 + Math.floor(Math.random() * 2),
          },
          {
            name: 'tannhäuser gate · transit ring 3',
            temp: -269,
            wind: 12 + Math.floor(Math.random() * 40),
            cond: 'c-beams glittering · intermittent',
            vis: 'clear · gate signature at 74%',
            kp: 3 + Math.floor(Math.random() * 3),
          },
          {
            name: 'off-world colony · ceti-4',
            temp: -40 + Math.floor(Math.random() * 30),
            wind: 80 + Math.floor(Math.random() * 180),
            cond: 'ochre dust, cycling to hail',
            vis: '3 blocks of the settlement, tops',
            kp: 5 + Math.floor(Math.random() * 3),
          },
          {
            name: 'lunar shadow · tyrell farside array',
            temp: -173,
            wind: 0,
            cond: 'still · sunless for another 109h',
            vis: 'earthshine at 11%, crater rim visible',
            kp: 2 + Math.floor(Math.random() * 2),
          },
          {
            name: 'jovian flyby · europa lane',
            temp: -160,
            wind: 20 + Math.floor(Math.random() * 60),
            cond: 'ice vent plume · mild methane rain',
            vis: 'jupiter banded · very bad for morale',
            kp: 6 + Math.floor(Math.random() * 3),
          },
          {
            name: 'deep-void transit · sector 7g',
            temp: -271,
            wind: 0,
            cond: 'vacuum · nothing moving',
            vis: 'unlimited · which is worse',
            kp: 1,
          },
        ];
        const s = stations[Math.floor(Math.random() * stations.length)];
        const sol = Math.floor(1000 + Math.random() * 9000);
        const cycle = Math.floor(Math.random() * 24).toString().padStart(2, '0');
        push('out', `off-world report · sol ${sol} · ${cycle}:00 utc`, '#5ec8d8');
        push('out', `  station    ${s.name}`, '#c9b8a6');
        push('out', `  temp       ${s.temp >= 0 ? '+' : ''}${s.temp}°c`, '#c9b8a6');
        push('out', `  solar wind ${s.wind} km/s`, '#c9b8a6');
        push('out', `  kp-index   ${s.kp} / 9   ${'▓'.repeat(s.kp)}${'░'.repeat(9 - s.kp)}`,
          s.kp >= 7 ? '#ff7a5c' : s.kp >= 5 ? '#e7b766' : '#7fd6b1');
        push('out', `  condition  ${s.cond}`, '#c9b8a6');
        push('out', `  visibility ${s.vis}`, '#e7b766');
        push('out', '  advisory   all those moments, lost in time.', '#6b6660');
        break;
      }
      case 'clear':
        setEntries([]);
        break;
      case 'exit':
        setOpen(false);
        break;
      default:
        push('out', `unknown command: ${c}`, '#ff7a5c');
        push('out', 'try "help"', '#6b6660');
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
    else if (e.key === 'ArrowUp') {
      const ni = hIdx < 0 ? history.length - 1 : Math.max(0, hIdx - 1);
      if (history[ni] !== undefined) { setHIdx(ni); setInput(history[ni]); }
    } else if (e.key === 'ArrowDown') {
      const ni = hIdx + 1;
      if (ni >= history.length) { setHIdx(-1); setInput(''); }
      else { setHIdx(ni); setInput(history[ni]); }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const tabLabel = useMemo(() => 'dead-drop', []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed right-4 md:right-6 bottom-28 md:bottom-32 z-40 inline-flex items-center gap-2 border border-[#1f1c17] bg-[#0b0a08]/85 hover:border-[#5ec8d8]/60 text-[#a8a29e] hover:text-[#5ec8d8] px-3 py-2 text-[10px] tracking-[0.3em] uppercase transition-colors"
        aria-label="open dead drop"
      >
        <ChevronRight className="w-3.5 h-3.5" />
        {tabLabel}
        <span className="text-[#6b6660]">` </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="console"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="fixed right-3 md:right-6 bottom-3 md:bottom-6 z-[55] w-[min(94vw,520px)] h-[min(70vh,460px)] border border-[#5ec8d8]/40 bg-[#050608]/96 backdrop-blur-md flex flex-col"
            style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.6), 0 0 24px rgba(94,200,216,0.12), inset 0 0 30px rgba(0,0,0,0.5)' }}
            onMouseDown={() => inputRef.current?.focus()}
          >
            <div className="flex items-center justify-between border-b border-[#5ec8d8]/20 px-3 py-2">
              <div className="flex items-center gap-2 text-[10px] tracking-[0.35em] uppercase text-[#5ec8d8]">
                <span className="w-1.5 h-1.5 bg-[#5ec8d8] animate-pulse" />
                dead-drop · tty0
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEntries([])}
                  className="text-[#6b6660] hover:text-[#e7b766] p-1"
                  aria-label="clear"
                  title="clear"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-[#6b6660] hover:text-[#ff7a5c] p-1"
                  aria-label="close console"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[11.5px] leading-relaxed text-[#c9b8a6]"
              style={{ scrollbarWidth: 'thin' }}
            >
              {entries.map((e) => (
                <div key={e.id} className="whitespace-pre-wrap">
                  {e.kind === 'in' ? (
                    <span>
                      <span className="text-[#5ec8d8]">operator&gt;</span>{' '}
                      <span className="text-[#e8e4dc]">{e.text}</span>
                    </span>
                  ) : e.kind === 'sys' ? (
                    <span style={{ color: e.color ?? '#6b6660' }}>{e.text}</span>
                  ) : (
                    <span style={{ color: e.color ?? '#c9b8a6' }}>{e.text}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-[#5ec8d8]/20 px-3 py-2 flex items-center gap-2">
              <span className="text-[#5ec8d8] text-[11.5px] font-mono">operator&gt;</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                placeholder="type a command · try help"
                className="flex-1 bg-transparent outline-none font-mono text-[12px] text-[#e8e4dc] placeholder-[#4a453e]"
                aria-label="console input"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function isTyping(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  if (!t) return false;
  const tag = t.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable;
}

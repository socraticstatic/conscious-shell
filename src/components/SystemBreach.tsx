import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ASN = ['TYRELL-AS', 'WALLACE-NET', 'OFF-WORLD-COMM', 'SHIMAGO-DOM', 'OBSCURA-EDGE', 'EL-PUEBLO-NAT'];
const CITIES = ['LA 2019', 'CHIBA CITY', 'TOKYO 3', 'NIGHT CITY', 'KOWLOON ECHO', 'MEGA-METRO ACA'];
const PORTS = ['22/tcp', '80/tcp', '443/tcp', '5900/tcp', '8883/tcp', '9001/tcp'];
const VERBS = ['QUERYING', 'STARBURST', 'RESOLVING', 'HARVESTING', 'ANCHORING', 'SEARING', 'UNROOTING'];

function rip() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 255)).join('.');
}
function rmac() {
  return Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join(':').toUpperCase();
}
function pick<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}

type Line = { id: number; text: string; color: string };

export default function SystemBreach() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<'alert' | 'scan' | 'lock' | 'recover'>('alert');
  const [lines, setLines] = useState<Line[]>([]);
  const [countdown, setCountdown] = useState(9);
  const [spoofIp, setSpoofIp] = useState('—.—.—.—');
  const timers = useRef<number[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    const fire = () => trigger();
    window.addEventListener('breach:fire', fire);
    const schedule = () => {
      const wait = 180000 + Math.random() * 240000;
      const id = window.setTimeout(() => {
        if (!document.hidden) trigger();
        schedule();
      }, wait);
      timers.current.push(id);
    };
    schedule();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        trigger();
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('breach:fire', fire);
      window.removeEventListener('keydown', onKey);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  const push = (text: string, color = '#ff3b3b') => {
    const id = ++nextId.current;
    setLines((l) => [...l.slice(-140), { id, text, color }]);
  };

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const close = () => {
    clearTimers();
    setOpen(false);
    setLines([]);
    setPhase('alert');
  };

  const trigger = () => {
    clearTimers();
    setLines([]);
    setCountdown(9);
    setSpoofIp(rip());
    setPhase('alert');
    setOpen(true);

    const t0 = window.setTimeout(() => {
      setPhase('scan');
      push('[+] UNAUTHORISED HANDSHAKE · FOREIGN MAC ' + rmac(), '#ff7a5c');
      push('[+] CERT CHAIN BROKEN · CA = TYRELL-ROOT-REVOKED-2019', '#ff7a5c');
      streamScan();
    }, 900);
    timers.current.push(t0);

    const t1 = window.setTimeout(() => setPhase('lock'), 5600);
    timers.current.push(t1);

    const t2 = window.setTimeout(() => {
      setPhase('recover');
      push('[ ok ] counter-measure deployed', '#7fd6b1');
      push('[ ok ] signal dampened · bridge dropped', '#7fd6b1');
      push('[ ok ] breach contained · you may resume', '#e7b766');
    }, 12500);
    timers.current.push(t2);

    const t3 = window.setTimeout(() => close(), 15500);
    timers.current.push(t3);
  };

  const streamScan = () => {
    const ticks = 22;
    for (let i = 0; i < ticks; i++) {
      const id = window.setTimeout(() => {
        const verb = pick(VERBS);
        const city = pick(CITIES);
        const asn = pick(ASN);
        const port = pick(PORTS);
        const ip = rip();
        const ms = 12 + Math.floor(Math.random() * 140);
        push(`${verb} ${ip.padEnd(16)} ${port}  ${String(ms).padStart(3)}ms  [${asn}/${city}]`);
      }, i * 160);
      timers.current.push(id);
    }
  };

  useEffect(() => {
    if (phase !== 'lock') return;
    if (countdown <= 0) return;
    const id = window.setTimeout(() => setCountdown((c) => c - 1), 900);
    return () => clearTimeout(id);
  }, [phase, countdown]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[95] pointer-events-auto select-none"
          role="alertdialog"
          aria-label="system breach"
        >
          <div className="absolute inset-0 bg-[#120202]/90" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'repeating-linear-gradient(0deg, rgba(255,59,59,0.0) 0, rgba(255,59,59,0.0) 2px, rgba(255,59,59,0.08) 2px, rgba(255,59,59,0.08) 3px)',
              mixBlendMode: 'screen',
            }}
          />
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              x: [0, 2, -3, 1, -2, 0],
              opacity: [0.85, 1, 0.92, 1, 0.9, 1],
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{ boxShadow: 'inset 0 0 120px rgba(255,59,59,0.35)' }}
          />

          <div className="relative h-full flex flex-col p-6 md:p-10 font-mono text-xs md:text-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-[#ff3b3b] animate-pulse" />
                <div className="text-[10px] md:text-xs tracking-[0.5em] uppercase text-[#ff3b3b]">
                  ▆ intrusion detected · operator notice
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                className="text-[10px] tracking-[0.3em] uppercase text-[#ff7a5c] hover:text-[#ffb3a1] border border-[#ff3b3b]/40 px-3 py-1"
              >
                override · esc
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 border border-[#ff3b3b]/30 bg-black/40 p-4 h-[340px] md:h-[420px] overflow-hidden">
                <div className="text-[10px] tracking-[0.4em] uppercase text-[#ff7a5c] mb-3">
                  // live trace · bridge 0xA3
                </div>
                <div className="space-y-0.5 text-[11px] leading-relaxed">
                  {lines.slice(-20).map((l) => (
                    <div key={l.id} style={{ color: l.color }}>
                      {l.text}
                    </div>
                  ))}
                  {phase !== 'recover' && (
                    <span className="inline-block w-2 h-3 align-middle bg-[#ff3b3b] animate-pulse" />
                  )}
                </div>
              </div>

              <div className="border border-[#ff3b3b]/30 bg-black/40 p-4 h-[340px] md:h-[420px] overflow-hidden">
                <div className="text-[10px] tracking-[0.4em] uppercase text-[#ff7a5c] mb-3">
                  // spoof origin
                </div>
                <div className="text-[11px] text-[#ffb3a1] space-y-1">
                  <div>peer.ip     <span className="text-[#ff3b3b]">{spoofIp}</span></div>
                  <div>peer.mac    <span className="text-[#ffb3a1]">{rmac()}</span></div>
                  <div>peer.asn    <span className="text-[#ffb3a1]">{pick(ASN)}</span></div>
                  <div>peer.city   <span className="text-[#ffb3a1]">{pick(CITIES)}</span></div>
                  <div>peer.agent  <span className="text-[#ffb3a1]">N6-Kompressor/7</span></div>
                </div>

                <div className="mt-5 text-[10px] tracking-[0.4em] uppercase text-[#ff7a5c] mb-2">
                  // phase
                </div>
                <div className="text-2xl md:text-3xl text-[#ff3b3b] tabular-nums">
                  {phase === 'alert' && 'ALERT'}
                  {phase === 'scan' && 'SCANNING'}
                  {phase === 'lock' && 'LOCKDOWN'}
                  {phase === 'recover' && 'CONTAINED'}
                </div>

                {phase === 'lock' && (
                  <div className="mt-4">
                    <div className="text-[10px] tracking-[0.4em] uppercase text-[#ff7a5c]">
                      quarantine in
                    </div>
                    <div className="text-5xl md:text-6xl text-[#ff3b3b] tabular-nums leading-none mt-1">
                      {countdown.toString().padStart(2, '0')}
                    </div>
                    <div className="mt-2 text-[10px] text-[#ff9082]">
                      holding — counter-measure spinning up
                    </div>
                  </div>
                )}

                {phase === 'recover' && (
                  <div className="mt-4 text-[11px] text-[#7fd6b1] leading-relaxed">
                    bridge dropped. the intruder was a courier. no cargo found on the wire. returning you to your regular programme.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-auto pt-6 text-[10px] tracking-[0.45em] uppercase text-[#ff7a5c]/70">
              · this event is narrative theatre · no network traffic has left your machine ·
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

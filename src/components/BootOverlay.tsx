import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// One line of the boot is a memory, drawn from a previous life. A different
// fragment each visit; most visitors never notice. All of them are true.
// (Timeline per Micah: Costa Rica 68-69, Chiclayo 70-79 with stateside
// furloughs — Stafford VA 73, Williamsburg KY 77, Spotsylvania VA 79-80 —
// then Lima 81-86.)
const MEMORY_LINES = [
  '> restoring session: chiclayo.1975 .. PARTIAL',
  '> restoring session: lima.1983 ...... PARTIAL',
  '> restoring session: costa_rica.1968  FADED',
  '> furlough: stafford_va.1973 ........ ROUND TRIP',
  '> furlough: williamsburg_ky.1977 .... ROUND TRIP',
  '> spotsylvania_va.1979 .............. father on leave',
  '> memory at 0x1994: printing press, ink under the nails',
  '> locale es_PE not found ............ falling back to en_US',
  '> peripheral: field_hockey_stick .... both hands OK',
  '> legacy hardware: quadra_700 ....... remembered',
  '> mount /between/two/worlds ......... always',
  '> ambient: salt ..................... detected',
  '> ambient: smoke .................... detected',
  '> ambient: orchid ................... in the cracks',
  '> warehouse lease (1999) ............ expired, kept',
  '> altar_call.wav .................... still audible',
  '> kintsugi daemon ................... filling cracks',
];

const lines = [
  '> initializing conscious_shell@v4.7 ...',
  '> mounting filesystem ............... OK',
  '> loading portfolio::micah_boswell ... OK',
  MEMORY_LINES[Math.floor(Math.random() * MEMORY_LINES.length)],
  '> connecting supabase_edge .......... OK',
  '> hydrating 126 project artifacts ... OK',
  '> yerba_mate status ................. BREWED',
  '> ready.',
];

export default function BootOverlay() {
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('cs_booted');
  });
  const [shown, setShown] = useState<string[]>([]);
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    if (!open) return;
    let i = 0;
    const push = () => {
      setShown((s) => [...s, lines[i]]);
      i++;
      if (i < lines.length) {
        const delay = 80 + Math.random() * 180;
        setTimeout(push, delay);
      } else {
        setTimeout(() => {
          sessionStorage.setItem('cs_booted', '1');
          setOpen(false);
        }, 550);
      }
    };
    const t = setTimeout(push, 180);
    const blink = setInterval(() => setCursor((v) => !v), 480);
    return () => {
      clearTimeout(t);
      clearInterval(blink);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, clipPath: 'inset(50% 0 50% 0)' }}
          transition={{ duration: 0.5, ease: [0.77, 0, 0.175, 1] }}
          className="fixed inset-0 z-[200] bg-[#0b0a08] flex items-center justify-center px-6"
        >
          <div className="w-full max-w-2xl text-xs md:text-sm text-[#e040fb] relative">
            <div className="flex items-center gap-2 mb-5 text-[#605a52] text-[10px] uppercase tracking-widest">
              <span className="w-2 h-2 bg-[#e040fb]" />
              <span>conscious_shell — /boot</span>
            </div>
            {shown.map((l, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="whitespace-pre"
              >
                {l}
              </motion.div>
            ))}
            <div className="inline-flex items-center">
              <span className="text-[#e040fb]">{cursor ? '▌' : ' '}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

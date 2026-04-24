import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project } from '../lib/supabase';

type Cmd = { id: string; label: string; hint: string; run: () => void };

export default function CommandPalette({
  open,
  onClose,
  projects,
}: {
  open: boolean;
  onClose: () => void;
  projects: Project[];
}) {
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const go = (id: string) => {
    onClose();
    requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );
  };

  const cmds: Cmd[] = [
    { id: 'work', label: 'cd /work', hint: 'selected work', run: () => go('work') },
    { id: 'time', label: 'wayback --unroll', hint: '25 years of the site', run: () => go('time') },
    { id: 'empathy', label: 'run voight-kampff', hint: 'empathy test', run: () => go('empathy') },
    { id: 'lab', label: 'ls /lab/github', hint: 'ai github demos · live pages', run: () => go('lab') },
    { id: 'index', label: 'cat /index', hint: 'full archive', run: () => go('index') },
    { id: 'manifesto', label: 'cat /manifesto.txt', hint: 'operating principles', run: () => go('manifesto') },
    { id: 'about', label: 'whoami', hint: 'bio', run: () => go('about') },
    { id: 'services', label: 'man services', hint: 'engagement modes', run: () => go('services') },
    { id: 'recognition', label: 'git log --awards', hint: 'awards + publications', run: () => go('recognition') },
    { id: 'contact', label: 'ssh contact', hint: 'reach out', run: () => go('contact') },
    { id: 'mail', label: 'mail hello@conscious-shell.com', hint: 'send email', run: () => (window.location.href = 'mailto:hello@conscious-shell.com') },
    ...projects.map<Cmd>((p) => ({
      id: `p:${p.id}`,
      label: `open ${p.title.toLowerCase()}`,
      hint: `${p.year} · ${p.client}`,
      run: () => go(p.featured ? 'work' : 'index'),
    })),
  ];

  const filtered = q
    ? cmds.filter((c) => (c.label + c.hint).toLowerCase().includes(q.toLowerCase()))
    : cmds;

  useEffect(() => {
    if (open) {
      setQ('');
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => setIdx(0), [q]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIdx((i) => Math.min(filtered.length - 1, i + 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setIdx((i) => Math.max(0, i - 1));
      }
      if (e.key === 'Enter' && filtered[idx]) {
        e.preventDefault();
        filtered[idx].run();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, idx, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[90] bg-[#0b0a08]/80 backdrop-blur-sm flex items-start justify-center pt-[18vh] px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl border border-[#2a2620] bg-[#0b0a08] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1f1c17]">
              <span className="text-[#e7b766]">$</span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="type a command, project, or page…"
                className="flex-1 bg-transparent outline-none text-[#e8e4dc] placeholder:text-[#4a453e] text-sm"
              />
              <kbd className="text-[10px] text-[#6b6660] border border-[#2a2620] px-1.5 py-0.5">esc</kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
              {filtered.length === 0 && (
                <div className="px-5 py-4 text-sm text-[#6b6660]">no matches — try another query</div>
              )}
              {filtered.map((c, i) => (
                <button
                  key={c.id}
                  onMouseEnter={() => setIdx(i)}
                  onClick={c.run}
                  className={`w-full text-left px-5 py-2.5 flex items-center justify-between gap-4 text-sm border-l-2 ${
                    i === idx
                      ? 'bg-[#1a1712] border-[#e7b766] text-[#e7b766]'
                      : 'border-transparent text-[#e8e4dc] hover:bg-[#141210]'
                  }`}
                >
                  <span className="truncate">{c.label}</span>
                  <span className="text-[11px] text-[#6b6660] shrink-0">{c.hint}</span>
                </button>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-[#1f1c17] flex items-center justify-between text-[11px] text-[#6b6660]">
              <span>↑↓ navigate · ↵ open</span>
              <span>{filtered.length} results</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

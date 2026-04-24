import { useEffect, useState } from 'react';
import { Menu, X, Terminal } from 'lucide-react';

const LINKS = [
  { href: '#work', label: 'work' },
  { href: '#time', label: 'timeline' },
  { href: '#about', label: 'about' },
  { href: '#contact', label: 'contact' },
];

export default function Nav({ onOpenPalette }: { onOpenPalette: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled ? 'border-b border-[#1f1c17] bg-[#07070a]/90 backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-14 flex items-center justify-between">
        <a href="#" className="font-mono text-sm text-[#e8e4dc] tracking-tight">
          <span className="text-[#e7b766]">//</span>conscious-shell
        </a>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-6">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-xs text-[#6b6660] hover:text-[#e8e4dc] transition-colors tracking-widest uppercase"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={onOpenPalette}
            className="flex items-center gap-1.5 text-xs text-[#6b6660] hover:text-[#e7b766] transition-colors border border-[#2a2620] hover:border-[#e7b766] px-2 py-1"
            data-cursor="hover"
          >
            <Terminal size={11} />
            <span className="font-mono">⌘K</span>
          </button>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-[#6b6660] hover:text-[#e8e4dc]"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-[#07070a] border-b border-[#1f1c17] px-6 pb-6 pt-2 flex flex-col gap-4">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm text-[#6b6660] hover:text-[#e8e4dc] transition-colors"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => { setOpen(false); onOpenPalette(); }}
            className="text-left text-sm text-[#6b6660] hover:text-[#e7b766]"
          >
            ⌘K — command palette
          </button>
        </div>
      )}
    </header>
  );
}

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

const links = [
  { id: 'work', label: 'work', jp: '作品' },
  { id: 'time', label: 'archive', jp: '記録庫' },
  { id: 'empathy', label: 'v-k', jp: '感情' },
  { id: 'lab', label: 'lab', jp: '研究所' },
  { id: 'index', label: 'index', jp: '索引' },
  { id: 'manifesto', label: 'manifesto', jp: '宣言' },
  { id: 'dossier', label: 'dossier', jp: '外部知性' },
  { id: 'haiku', label: 'haiku', jp: '俳句' },
  { id: 'about', label: 'about', jp: '紹介' },
  { id: 'services', label: 'services', jp: '業務' },
  { id: 'contact', label: 'contact', jp: '連絡' },
];

export default function Nav({ onOpenPalette }: { onOpenPalette: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);

  const go = (id: string) => {
    setDrawerOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
          scrolled ? 'backdrop-blur-md bg-[#0b0a08]/85 border-b border-[#1f1c17]' : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 h-14 md:h-12 flex items-center justify-between text-[11px] sm:text-[12px]">
          <button
            onClick={() => go('top')}
            className="flex items-center gap-2 text-[#e8e4dc] hover:text-[#e7b766] transition-colors"
          >
            <span className="w-1.5 h-1.5 bg-[#e7b766]" />
            <span className="font-mono">conscious_shell</span>
            <span className="text-[#6b6660]">v4.7</span>
          </button>

          <nav className="hidden md:flex items-center gap-5 text-[#a8a29e]">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                data-cursor="hover"
                className="hover:text-[#e7b766] transition-colors"
              >
                ./{l.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              data-cursor="hover"
              onClick={onOpenPalette}
              className="hidden sm:flex text-[#a8a29e] hover:text-[#e7b766] transition-colors items-center gap-2"
              aria-label="open palette"
            >
              <span className="hidden md:inline">⌘K</span>
              <span>/palette</span>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden inline-flex items-center justify-center w-11 h-11 -mr-2 text-[#e7b766] hover:bg-[#1a1712] active:bg-[#1a1712] transition-colors"
              aria-label="open navigation"
              aria-expanded={drawerOpen}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-0 z-[60] overflow-hidden transition-opacity duration-200 ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!drawerOpen}
      >
        <div
          className="absolute inset-0 bg-black/85 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          className={`absolute top-0 right-0 bottom-0 w-[88%] max-w-[420px] bg-[#0a0908] border-l border-[#1f1c17] flex flex-col transition-transform duration-300 ${
            drawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 h-14 border-b border-[#1f1c17]">
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 bg-[#e7b766]" />
              <span className="text-[#e8e4dc]">conscious_shell</span>
              <span className="text-[#6b6660]">v4.7</span>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-11 h-11 -mr-2 inline-flex items-center justify-center text-[#a8a29e] hover:text-[#e7b766]"
              aria-label="close navigation"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-2">
            <div className="px-5 py-3 text-[10px] tracking-[0.4em] uppercase text-[#5c544a]">
              // sections · {links.length}
            </div>
            {links.map((l, i) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className="w-full flex items-baseline justify-between px-5 py-4 text-left border-b border-[#16140f] active:bg-[#15130e] hover:bg-[#15130e] transition-colors"
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-[10px] font-mono text-[#5c544a] w-6 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[18px] text-[#e7b766] font-mono">./{l.label}</span>
                </div>
                <span className="font-jp text-xs text-[#5ec8d8]/70">{l.jp}</span>
              </button>
            ))}
            <button
              onClick={() => { setDrawerOpen(false); onOpenPalette(); }}
              className="w-full flex items-baseline justify-between px-5 py-4 text-left border-t border-[#1f1c17] mt-4 active:bg-[#15130e] hover:bg-[#15130e] transition-colors"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-[10px] font-mono text-[#5c544a] w-6">⌘K</span>
                <span className="text-[16px] text-[#5ec8d8] font-mono">/palette</span>
              </div>
              <span className="text-[10px] tracking-widest text-[#5c544a]">jump-to</span>
            </button>
          </nav>

          <div className="px-5 py-4 border-t border-[#1f1c17] text-[10px] font-mono text-[#5c544a] leading-relaxed">
            tap any line to navigate · tap outside to dismiss
            <br />
            <span className="text-[#3a3530]">// micah boswell · designing since 1996</span>
          </div>
        </aside>
      </div>
    </>
  );
}

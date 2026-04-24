import { useEffect, useState } from 'react';

const links = [
  { id: 'work', label: 'work' },
  { id: 'time', label: 'archive' },
  { id: 'empathy', label: 'v-k' },
  { id: 'lab', label: 'lab' },
  { id: 'index', label: 'index' },
  { id: 'manifesto', label: 'manifesto' },
  { id: 'dossier', label: 'dossier' },
  { id: 'haiku', label: 'haiku' },
  { id: 'about', label: 'about' },
  { id: 'services', label: 'services' },
  { id: 'contact', label: 'contact' },
];

export default function Nav({ onOpenPalette }: { onOpenPalette: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
        scrolled ? 'backdrop-blur-md bg-[#0b0a08]/85 border-b border-[#1f1c17]' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-12 flex items-center justify-between text-[12px]">
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

        <button
          data-cursor="hover"
          onClick={onOpenPalette}
          className="text-[#a8a29e] hover:text-[#e7b766] transition-colors flex items-center gap-2"
        >
          <span className="hidden md:inline">⌘K</span>
          <kbd className="md:hidden px-2 py-0.5 border border-[#2a2620]">/</kbd>
          <span className="hidden sm:inline">/palette</span>
        </button>
      </div>
    </header>
  );
}

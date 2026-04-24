const LINKS = [
  { href: '#work', label: 'work' },
  { href: '#time', label: 'timeline' },
  { href: '#about', label: 'about' },
  { href: '#contact', label: 'contact' },
];

export default function Footer() {
  return (
    <footer className="py-10 px-6 md:px-10 border-t border-[#1f1c17] bg-[#07070a] text-[11px] text-[#6b6660]">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Logo */}
          <a href="#" className="font-mono text-sm text-[#e8e4dc] tracking-tight">
            <span className="text-[#e7b766]">//</span>conscious-shell
          </a>

          {/* Nav links */}
          <nav className="flex items-center gap-6">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[#6b6660] hover:text-[#e8e4dc] transition-colors tracking-widest uppercase"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Social + copyright */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/socraticstatic"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#e8e4dc] transition-colors"
            >
              github
            </a>
            <span className="text-[#1f1c17]">/</span>
            <a
              href="https://linkedin.com/in/micahboswell"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#e8e4dc] transition-colors"
            >
              linkedin
            </a>
            <span className="text-[#4a453e]">·</span>
            <span>© Micah Boswell {new Date().getFullYear()}</span>
          </div>
        </div>

        <div className="mt-6 text-[#4a453e] text-[10px]">
          # always in progress since 2000 · build: vite · react · supabase
        </div>
      </div>
    </footer>
  );
}

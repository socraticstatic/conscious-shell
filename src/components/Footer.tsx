export default function Footer() {
  // The poems live behind the dead drop console: backtick to open, then `verse`.
  // Nothing on the page said so, so the whole body of poetry was unreachable by
  // anyone who did not already know the keystroke. This line is the door. It
  // dispatches the same event the mobile dock uses, so it also works for people
  // who cannot press backtick at all.
  const openDeadDrop = () => window.dispatchEvent(new Event('dock:deaddrop'));

  return (
    <footer className="py-6 px-6 md:px-10 text-[11px] text-[#6b6660]">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-5 text-center">
          <button
            onClick={openDeadDrop}
            className="group inline-flex items-center gap-2 text-[11px] text-[#8a8279] hover:text-[#e8e4dc] transition-colors"
          >
            <span>there are poems here. press</span>
            <kbd className="px-1.5 py-0.5 border border-[#2a2620] group-hover:border-[#e040fb] text-[#e040fb] font-mono leading-none transition-colors">
              `
            </kbd>
            <span>and type</span>
            <span className="font-mono text-[#e040fb]">verse</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#e040fb]" />
            <span className="text-[#a8a29e]">conscious_shell</span>
            <span className="text-[#4a453e]">—</span>
            <span>always in progress since 2000</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#4a453e]">build: vite · react · supabase · three · d3</span>
            <span>© {new Date().getFullYear()} micah boswell</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

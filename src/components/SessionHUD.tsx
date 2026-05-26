import { useEffect, useState } from 'react';

export default function SessionHUD() {
  const [time, setTime] = useState('');
  const [coords, setCoords] = useState('000,000');
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(
        `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')}`,
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setCoords(
        `${String(Math.round(e.clientX)).padStart(4, '0')},${String(Math.round(e.clientY)).padStart(4, '0')}`,
      );
    };
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setScrollPct(max > 0 ? Math.round((h.scrollTop / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener('mousemove', onMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <>
      {/* Corner reticles — hidden on small mobile to reduce clutter */}
      <Reticle className="top-12 left-3 hidden sm:block" />
      <Reticle className="top-12 right-3 hidden sm:block" rotate={90} />
      <Reticle className="bottom-3 left-3 hidden sm:block" rotate={270} />
      <Reticle className="bottom-3 right-3 hidden sm:block" rotate={180} />

      {/* Desktop: multi-line shell readout. Mobile: single quiet status pill so the bottom-left doesn't stack four lines of chrome on top of project content. */}
      <div className="pointer-events-none hidden sm:block fixed left-4 md:left-6 z-40 text-[10px] md:text-[11px] tracking-widest space-y-1 select-none" style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="text-[#e7b766]">◉ TYRELL.SHELL v4.7</div>
        <div className="text-[#5ec8d8]">T {time} UTC</div>
        <div className="text-[#a8a29e]">P {coords}</div>
        <div className="flex items-center gap-2 text-[#a8a29e]">
          <span>S {String(scrollPct).padStart(3, '0')}%</span>
          <span className="inline-block w-16 h-[2px] bg-[#1a1712] relative overflow-hidden">
            <span
              className="absolute left-0 top-0 h-full bg-[#e7b766]"
              style={{ width: `${scrollPct}%`, boxShadow: '0 0 4px #e7b766' }}
            />
          </span>
        </div>
      </div>

      {/* Mobile: compact pill — timestamp + scroll meter, one line. */}
      <div className="pointer-events-none sm:hidden fixed left-3 z-40 text-[10px] tracking-widest select-none flex items-center gap-2 border border-[#1f1c17] bg-[#0a0908]/85 backdrop-blur-sm px-2 py-1" style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
        <span className="text-[#e7b766]">◉</span>
        <span className="text-[#5ec8d8]">{time}</span>
        <span className="inline-block w-10 h-[2px] bg-[#1a1712] relative overflow-hidden">
          <span
            className="absolute left-0 top-0 h-full bg-[#e7b766]"
            style={{ width: `${scrollPct}%`, boxShadow: '0 0 4px #e7b766' }}
          />
        </span>
        <span className="text-[#a8a29e]">{String(scrollPct).padStart(2, '0')}%</span>
      </div>
    </>
  );
}

function Reticle({ className = '', rotate = 0 }: { className?: string; rotate?: number }) {
  return (
    <div
      className={`pointer-events-none fixed z-40 w-5 h-5 ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      <span className="absolute top-0 left-0 w-2 h-px bg-[#e7b766]/70" />
      <span className="absolute top-0 left-0 h-2 w-px bg-[#e7b766]/70" />
    </div>
  );
}

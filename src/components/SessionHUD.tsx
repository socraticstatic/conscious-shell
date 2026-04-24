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
      {/* Corner reticles */}
      <Reticle className="top-12 left-3" />
      <Reticle className="top-12 right-3" rotate={90} />
      <Reticle className="bottom-3 left-3" rotate={270} />
      <Reticle className="bottom-3 right-3" rotate={180} />

      <div className="pointer-events-none fixed left-4 md:left-6 bottom-4 md:bottom-6 z-40 text-[10px] md:text-[11px] tracking-widest space-y-1 select-none">
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

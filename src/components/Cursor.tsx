import { useEffect, useRef } from 'react';

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return;

    let dotX = 0, dotY = 0, ringX = 0, ringY = 0;
    let mouseX = 0, mouseY = 0;
    let raf = 0;
    let hovering = false;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      hovering = !!t?.closest('a, button, [data-cursor="hover"]');
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${hovering ? 2.2 : 1})`;
        ringRef.current.style.borderColor = hovering ? '#e7b766' : 'rgba(231,183,102,0.5)';
      }
    };

    const tick = () => {
      dotX += (mouseX - dotX) * 0.85;
      dotY += (mouseY - dotY) * 0.85;
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${hovering ? 2.2 : 1})`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[100] w-1.5 h-1.5 bg-amber-300 rounded-full mix-blend-difference hidden md:block"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[100] w-10 h-10 border rounded-full transition-[border-color,scale] duration-200 hidden md:block"
        style={{ borderColor: 'rgba(231,183,102,0.5)' }}
      />
    </>
  );
}

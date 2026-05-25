import { useEffect, useRef, useCallback } from 'react';

interface StrokePoint {
  x: number;
  y: number;
  width: number;
  timestamp: number;
}

export default function Cursor() {
  const nibRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<StrokePoint[]>([]);
  const isInkingRef = useRef(false);
  const inkStartTimeRef = useRef(0);
  const hoveringRef = useRef(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const nibPosRef = useRef({ x: 0, y: 0 });
  const ringPosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return;

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      if (isInkingRef.current && !hoveringRef.current) {
        const elapsed = Date.now() - inkStartTimeRef.current;
        const width = Math.min(1 + (elapsed / 2000) * 3, 4);
        strokesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          width,
          timestamp: Date.now(),
        });
        if (strokesRef.current.length > 200) {
          strokesRef.current.shift();
        }
      }
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      hoveringRef.current = !!t?.closest('a, button, [data-cursor="hover"]');
    };

    const onDown = () => {
      isInkingRef.current = true;
      inkStartTimeRef.current = Date.now();
    };

    const onUp = () => {
      isInkingRef.current = false;
    };

    const drawInk = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = Date.now();
      const fadeTime = 15000;

      // Remove fully faded strokes
      strokesRef.current = strokesRef.current.filter(
        (p) => now - p.timestamp < fadeTime
      );

      if (strokesRef.current.length < 2) return;

      const points = strokesRef.current;

      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];

        const age = now - curr.timestamp;
        const opacity = Math.max(0, 0.3 * (1 - age / fadeTime));

        if (opacity <= 0) continue;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(231, 183, 102, ${opacity})`;
        ctx.lineWidth = curr.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (i >= 2) {
          const prevPrev = points[i - 2];
          const cpX = prev.x + (curr.x - prevPrev.x) / 4;
          const cpY = prev.y + (curr.y - prevPrev.y) / 4;
          ctx.moveTo(prev.x, prev.y);
          ctx.quadraticCurveTo(cpX, cpY, curr.x, curr.y);
        } else {
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
        }

        ctx.stroke();
      }
    };

    const tick = () => {
      const { x: mouseX, y: mouseY } = mouseRef.current;

      nibPosRef.current.x += (mouseX - nibPosRef.current.x) * 0.85;
      nibPosRef.current.y += (mouseY - nibPosRef.current.y) * 0.85;
      ringPosRef.current.x += (mouseX - ringPosRef.current.x) * 0.18;
      ringPosRef.current.y += (mouseY - ringPosRef.current.y) * 0.18;

      if (nibRef.current) {
        nibRef.current.style.transform = `translate3d(${nibPosRef.current.x}px, ${nibPosRef.current.y}px, 0) translate(-50%, -50%) rotate(45deg)`;
        const nibColor = hoveringRef.current ? '#5ec8d8' : '#e7b766';
        const svg = nibRef.current.querySelector('svg');
        if (svg) {
          svg.style.color = nibColor;
        }
      }

      if (ringRef.current) {
        const scale = hoveringRef.current ? 1.8 : 1;
        const borderColor = hoveringRef.current ? '#5ec8d8' : 'rgba(231,183,102,0.4)';
        ringRef.current.style.transform = `translate3d(${ringPosRef.current.x}px, ${ringPosRef.current.y}px, 0) translate(-50%, -50%) scale(${scale})`;
        ringRef.current.style.borderColor = borderColor;
      }

      drawInk();
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(rafRef.current);
    };
  }, [resizeCanvas]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed top-0 left-0 z-[90] hidden md:block"
        style={{ width: '100vw', height: '100vh' }}
      />
      <div
        ref={nibRef}
        className="pointer-events-none fixed top-0 left-0 z-[100] hidden md:block"
        style={{ transform: 'translate(-50%, -50%) rotate(45deg)' }}
      >
        <svg
          width="14"
          height="20"
          viewBox="0 0 14 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ color: '#e7b766' }}
        >
          <path
            d="M7 0L9.5 8L14 14L9 16L7 20L5 16L0 14L4.5 8L7 0Z"
            fill="currentColor"
          />
          <path
            d="M7 8L7 16"
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
          <path
            d="M5.5 10L7 8L8.5 10"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[100] w-6 h-6 border rounded-full transition-[border-color,scale] duration-200 hidden md:block"
        style={{ borderColor: 'rgba(231,183,102,0.4)' }}
      />
    </>
  );
}

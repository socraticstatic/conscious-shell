import { useEffect, useRef } from 'react';

const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

export default function CodeRain({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dprRef = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const COL_W = 16;
    let cols = 0;
    let drops: number[] = [];
    let raf = 0;

    const resize = () => {
      dprRef.current = Math.min(window.devicePixelRatio || 1, 1.5);
      const parent = canvas.parentElement;
      const pw = parent?.clientWidth ?? window.innerWidth;
      const ph = parent?.clientHeight ?? window.innerHeight;
      canvas.width = pw * dprRef.current;
      canvas.height = ph * dprRef.current;
      canvas.style.width = pw + 'px';
      canvas.style.height = ph + 'px';
      ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);
      cols = Math.ceil(pw / COL_W);
      drops = new Array(cols).fill(0).map(() => Math.random() * (ph / COL_W));
    };

    resize();

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const draw = () => {
      const pw = canvas.width / dprRef.current;
      const ph = canvas.height / dprRef.current;
      ctx.fillStyle = 'rgba(7,7,10,0.05)';
      ctx.fillRect(0, 0, pw, ph);
      ctx.fillStyle = '#5ec8d8';
      ctx.font = `${COL_W}px monospace`;
      drops.forEach((y, i) => {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(ch, i * COL_W, y * COL_W);
        if (y * COL_W > ph && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}

import { useEffect, useRef } from 'react';

const GLYPHS =
  '01{}[]()<>/\\=+-*#$%&_;:.,|~^?!アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンｦｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ';

export default function CodeRain({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0, cols = 0, raf = 0;
    const fontSize = 14;
    let drops: number[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const parent = canvas.parentElement;
      const pw = parent?.clientWidth ?? window.innerWidth;
      const ph = parent?.clientHeight ?? window.innerHeight;
      w = pw;
      h = ph;
      canvas.width = pw * dpr;
      canvas.height = ph * dpr;
      canvas.style.width = pw + 'px';
      canvas.style.height = ph + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(pw / fontSize);
      drops = new Array(cols).fill(0).map(() => Math.random() * (ph / fontSize));
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const draw = () => {
      ctx.fillStyle = 'rgba(11, 10, 8, 0.12)';
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
      for (let i = 0; i < drops.length; i++) {
        const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        const r = Math.random();
        ctx.fillStyle =
          r < 0.015
            ? 'rgba(255,62,122,0.55)'
            : r < 0.04
            ? 'rgba(94,200,216,0.42)'
            : r < 0.1
            ? 'rgba(231,183,102,0.5)'
            : 'rgba(231,183,102,0.09)';
        ctx.fillText(ch, x, y);
        if (y > h && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.35 + Math.random() * 0.3;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} className={`absolute inset-0 ${className}`} aria-hidden />;
}

import { useEffect, useRef } from 'react';

type Ship = {
  x: number;
  y: number;
  vx: number;
  size: number;
  hue: number;
  phase: number;
  lane: number;
  trail: number;
};

const MIN_DELAY_MS = 18000;
const MAX_DELAY_MS = 42000;

export default function Spinner() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const raf = useRef<number | null>(null);
  const ships = useRef<Ship[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = Math.min(380, window.innerHeight * 0.35) * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${Math.min(380, window.innerHeight * 0.35)}px`;
    };
    resize();
    window.addEventListener('resize', resize);

    const scheduleLaunch = () => {
      const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
      window.setTimeout(launch, delay);
    };

    const launch = () => {
      const leftToRight = Math.random() > 0.5;
      const h = canvas.height / dpr;
      const lane = 0.15 + Math.random() * 0.7;
      const y = lane * h;
      const size = 18 + Math.random() * 20;
      const speed = 0.6 + Math.random() * 0.9;
      const vx = leftToRight ? speed : -speed;
      const hue = Math.random() > 0.5 ? 18 : 8;
      ships.current.push({
        x: leftToRight ? -80 : window.innerWidth + 80,
        y,
        vx,
        size,
        hue,
        phase: Math.random() * Math.PI * 2,
        lane,
        trail: 0,
      });
      scheduleLaunch();
    };

    scheduleLaunch();

    const render = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      ships.current.forEach((s) => {
        s.phase += 0.04;
        s.x += s.vx;
        s.trail += 1;
        const bob = Math.sin(s.phase) * 0.6;
        const y = s.y + bob;
        const dir = Math.sign(s.vx);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        const gradLen = 160;
        const trailEnd = s.x - dir * gradLen;
        const grad = ctx.createLinearGradient(s.x, y, trailEnd, y);
        grad.addColorStop(0, `hsla(${s.hue}, 85%, 58%, 0.9)`);
        grad.addColorStop(0.4, `hsla(${s.hue}, 85%, 55%, 0.25)`);
        grad.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(s.x, y - s.size * 0.18);
        ctx.lineTo(trailEnd, y - 1);
        ctx.lineTo(trailEnd, y + 1);
        ctx.lineTo(s.x, y + s.size * 0.18);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(10, 6, 4, 0.92)';
        ctx.beginPath();
        ctx.ellipse(s.x, y, s.size, s.size * 0.32, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsla(${s.hue + 10}, 90%, 60%, 0.65)`;
        ctx.beginPath();
        ctx.arc(s.x - dir * s.size * 0.75, y + 2, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(94, 200, 216, 0.7)';
        ctx.beginPath();
        ctx.arc(s.x + dir * s.size * 0.55, y, 1.2, 0, Math.PI * 2);
        ctx.fill();

        const beacon = 0.5 + Math.sin(s.phase * 5) * 0.5;
        ctx.fillStyle = `rgba(255, 70, 60, ${0.35 + beacon * 0.55})`;
        ctx.beginPath();
        ctx.arc(s.x - dir * s.size * 1.0, y - s.size * 0.12, 1.6 + beacon * 0.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      ships.current = ships.current.filter(
        (s) => s.x > -200 && s.x < window.innerWidth + 200,
      );

      raf.current = requestAnimationFrame(render);
    };
    raf.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 right-0 z-[4] opacity-80 mix-blend-screen"
    />
  );
}

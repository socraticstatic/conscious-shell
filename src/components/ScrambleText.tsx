import { useEffect, useRef, useState } from 'react';

const CHARS = '!<>-_\\/[]{}—=+*^?#01ABCDEFGHIJKLMNOPQRSTUVWXYZ';

type Props = {
  text: string;
  durationMs?: number;
  trigger?: unknown;
  hoverRescramble?: boolean;
  className?: string;
};

export default function ScrambleText({
  text,
  durationMs = 900,
  trigger,
  hoverRescramble = true,
  className = '',
}: Props) {
  const [display, setDisplay] = useState(text);
  const [hoverKey, setHoverKey] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const target = text;
    const chars = target.split('');
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      const revealCount = progress * target.length;
      const out = chars
        .map((c, i) => {
          if (c === ' ' || c === '\n' || c === '\t') return c;
          if (i < revealCount) return c;
          return CHARS[(frame + i) % CHARS.length];
        })
        .join('');
      setDisplay(out);
      frame += 1;
      if (progress < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        setDisplay(target);
      }
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [text, durationMs, trigger, hoverKey]);

  return (
    <span
      className={className}
      onMouseEnter={() => hoverRescramble && setHoverKey((k) => k + 1)}
    >
      {display}
    </span>
  );
}

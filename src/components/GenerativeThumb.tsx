import { useMemo } from 'react';

// Each thumbnail is a small universe created from a name.
// FNV-1a hashes are the Big Bang.
// The shapes are galaxies.
// Nobody asked for this metaphor but here we are.

// The number 2166136261 is the FNV offset basis. It was chosen in 1991.
// It has no idea what it has become. None of us do.

function hash(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  }
  return h >>> 0;
}

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const PALETTES = [
  ['#ff9a3c', '#1a0a06', '#e040fb', '#0a0604', '#00d4ff'],
  ['#2a4858', '#0d1b2a', '#00d4ff', '#1b3a4b', '#e040fb'],
  ['#3d1c02', '#0a0604', '#ff006e', '#1a0f08', '#ffb267'],
  ['#0a1628', '#162b44', '#00d4ff', '#0d1f36', '#e040fb'],
  ['#1a0a06', '#2a1a0f', '#ff9a3c', '#0a0604', '#c27a32'],
  ['#0f1a12', '#1a2e20', '#7ac88c', '#0a1408', '#e040fb'],
];

export default function GenerativeThumb({
  seed,
  className = '',
}: {
  seed: string;
  className?: string;
}) {
  const shapes = useMemo(() => {
    const h = hash(seed);
    const rng = seeded(h);
    const palette = PALETTES[h % PALETTES.length];
    const pattern = h % 5;
    const elements: JSX.Element[] = [];

    const bg = palette[1];
    elements.push(<rect key="bg" width="400" height="250" fill={bg} />);

    if (pattern === 0) {
      // Concentric arcs
      const cx = 100 + rng() * 200;
      const cy = 80 + rng() * 90;
      for (let i = 0; i < 12; i++) {
        const r = 20 + i * 22 + rng() * 10;
        const startAngle = rng() * Math.PI * 2;
        const sweep = 0.4 + rng() * 1.8;
        const x1 = cx + Math.cos(startAngle) * r;
        const y1 = cy + Math.sin(startAngle) * r;
        const x2 = cx + Math.cos(startAngle + sweep) * r;
        const y2 = cy + Math.sin(startAngle + sweep) * r;
        elements.push(
          <path
            key={`arc-${i}`}
            d={`M ${x1} ${y1} A ${r} ${r} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x2} ${y2}`}
            fill="none"
            stroke={palette[Math.floor(rng() * palette.length)]}
            strokeWidth={1 + rng() * 3}
            opacity={0.4 + rng() * 0.5}
          />,
        );
      }
      // Central glyph
      const glyphR = 8 + rng() * 14;
      elements.push(
        <circle key="glyph" cx={cx} cy={cy} r={glyphR} fill={palette[0]} opacity={0.8} />,
      );
    } else if (pattern === 1) {
      // Grid distortion
      const cols = 8 + Math.floor(rng() * 6);
      const rows = 5 + Math.floor(rng() * 4);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = (c / cols) * 400 + (rng() - 0.5) * 18;
          const y = (r / rows) * 250 + (rng() - 0.5) * 18;
          const size = 2 + rng() * 8;
          const color = palette[Math.floor(rng() * palette.length)];
          if (rng() > 0.6) {
            elements.push(
              <rect
                key={`g-${r}-${c}`}
                x={x}
                y={y}
                width={size}
                height={size}
                fill={color}
                opacity={0.3 + rng() * 0.6}
                transform={`rotate(${rng() * 45} ${x + size / 2} ${y + size / 2})`}
              />,
            );
          } else {
            elements.push(
              <circle
                key={`g-${r}-${c}`}
                cx={x}
                cy={y}
                r={size / 2}
                fill={color}
                opacity={0.3 + rng() * 0.6}
              />,
            );
          }
        }
      }
    } else if (pattern === 2) {
      // Topographic lines
      const layers = 8 + Math.floor(rng() * 6);
      for (let i = 0; i < layers; i++) {
        const points: string[] = [];
        const yBase = 30 + (i / layers) * 190;
        for (let x = 0; x <= 400; x += 10) {
          const y =
            yBase +
            Math.sin(x * 0.02 + i * 0.8 + rng() * 2) * (15 + rng() * 25) +
            Math.sin(x * 0.005 + rng() * 4) * 20;
          points.push(`${x},${y.toFixed(1)}`);
        }
        elements.push(
          <polyline
            key={`topo-${i}`}
            points={points.join(' ')}
            fill="none"
            stroke={palette[Math.floor(rng() * palette.length)]}
            strokeWidth={0.8 + rng() * 2}
            opacity={0.35 + rng() * 0.5}
          />,
        );
      }
    } else if (pattern === 3) {
      // Scatter field with connecting lines
      const nodes: { x: number; y: number }[] = [];
      const count = 18 + Math.floor(rng() * 14);
      for (let i = 0; i < count; i++) {
        nodes.push({ x: 20 + rng() * 360, y: 20 + rng() * 210 });
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80 + rng() * 40) {
            elements.push(
              <line
                key={`l-${i}-${j}`}
                x1={nodes[i].x}
                y1={nodes[i].y}
                x2={nodes[j].x}
                y2={nodes[j].y}
                stroke={palette[2]}
                strokeWidth={0.5}
                opacity={0.2 + rng() * 0.3}
              />,
            );
          }
        }
      }
      nodes.forEach((n, i) => {
        const r = 2 + rng() * 6;
        elements.push(
          <circle
            key={`n-${i}`}
            cx={n.x}
            cy={n.y}
            r={r}
            fill={palette[Math.floor(rng() * palette.length)]}
            opacity={0.5 + rng() * 0.5}
          />,
        );
      });
    } else {
      // Diagonal slashes
      const count = 12 + Math.floor(rng() * 10);
      for (let i = 0; i < count; i++) {
        const x = rng() * 400;
        const y = rng() * 250;
        const len = 30 + rng() * 120;
        const angle = -30 + rng() * 60;
        const rad = (angle * Math.PI) / 180;
        const x2 = x + Math.cos(rad) * len;
        const y2 = y + Math.sin(rad) * len;
        elements.push(
          <line
            key={`s-${i}`}
            x1={x}
            y1={y}
            x2={x2}
            y2={y2}
            stroke={palette[Math.floor(rng() * palette.length)]}
            strokeWidth={1 + rng() * 6}
            opacity={0.25 + rng() * 0.55}
            strokeLinecap="round"
          />,
        );
      }
    }

    // Noise overlay dots
    for (let i = 0; i < 40; i++) {
      elements.push(
        <circle
          key={`noise-${i}`}
          cx={rng() * 400}
          cy={rng() * 250}
          r={0.5 + rng() * 1.5}
          fill={palette[0]}
          opacity={0.15 + rng() * 0.25}
        />,
      );
    }

    return elements;
  }, [seed]);

  return (
    <svg
      viewBox="0 0 400 250"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
    >
      {shapes}
    </svg>
  );
}

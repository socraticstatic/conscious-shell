import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { SectionHeader } from './Work';

type Site = {
  name: string;
  url: string;
  tagline: string;
  description: string;
  tags: string[];
  ogImage?: string;
  thumb?: React.ReactNode;
  status: 'live' | 'beta' | 'wip';
  patent?: string;
};

// ── Fountain pen on ruled paper ──────────────────────────────────────────────
// Drawn horizontal at y=200, rotated -38° around (380,200)
// Nib tip lands ~(175,358), cap end ~(583,42) — full diagonal across frame
function PenThumb() {
  return (
    <svg viewBox="0 0 760 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        {/* Barrel: dark olive-green, cylindrical form */}
        <linearGradient id="pg-barrel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1e2612" />
          <stop offset="14%"  stopColor="#32401e" />
          <stop offset="32%"  stopColor="#16200c" />
          <stop offset="68%"  stopColor="#0e1608" />
          <stop offset="100%" stopColor="#080a04" />
        </linearGradient>
        {/* Thin sheen highlight */}
        <linearGradient id="pg-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {/* Grip section: matte black rubber */}
        <linearGradient id="pg-grip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1c1c1c" />
          <stop offset="22%"  stopColor="#2c2c2c" />
          <stop offset="72%"  stopColor="#0e0e0e" />
          <stop offset="100%" stopColor="#060606" />
        </linearGradient>
        {/* Gold trim rings & collar */}
        <linearGradient id="pg-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#f6e870" />
          <stop offset="28%"  stopColor="#d4a82a" />
          <stop offset="62%"  stopColor="#b88c18" />
          <stop offset="100%" stopColor="#7a5c0a" />
        </linearGradient>
        {/* Clip strip */}
        <linearGradient id="pg-clip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#f0e060" />
          <stop offset="50%"  stopColor="#c09820" />
          <stop offset="100%" stopColor="#8a6c0e" />
        </linearGradient>
        {/* Nib: polished 18k gold */}
        <linearGradient id="pg-nib" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ecd462" />
          <stop offset="35%"  stopColor="#c8a020" />
          <stop offset="75%"  stopColor="#a87c10" />
          <stop offset="100%" stopColor="#6a4c06" />
        </linearGradient>
      </defs>

      {/* ── Background: aged writing paper ── */}
      <rect width="760" height="400" fill="#0f0c08" />
      <rect x="32" y="32" width="696" height="336" fill="#f5e8c8" opacity="0.038" />

      {/* ── Ruled lines ── */}
      {[68, 96, 124, 152, 180, 208, 236, 264, 292, 320, 348].map((y) => (
        <line key={y} x1="40" y1={y} x2="720" y2={y} stroke="#281e14" strokeWidth="0.8" />
      ))}
      {/* Left margin */}
      <line x1="112" y1="42" x2="112" y2="372" stroke="#3a2820" strokeWidth="0.8" opacity="0.5" />

      {/* ── Ink trace (handwriting, rendered behind pen) ── */}
      <path d="M 132 152 Q 172 148 218 154 Q 262 160 306 152 Q 346 146 384 150"
        stroke="#1e4878" strokeWidth="1.3" fill="none" opacity="0.42" strokeLinecap="round" />
      <path d="M 132 180 Q 168 176 208 182 Q 252 188 292 180 Q 330 174 366 180 Q 398 184 428 177"
        stroke="#1e4878" strokeWidth="1.3" fill="none" opacity="0.32" strokeLinecap="round" />
      <path d="M 132 208 Q 162 204 198 210 Q 238 216 278 208 Q 310 202 338 208"
        stroke="#1e4878" strokeWidth="1.3" fill="none" opacity="0.24" strokeLinecap="round" />

      {/* ── Pen drop shadow ── */}
      <g transform="rotate(-38, 380, 200) translate(2,5)">
        <rect x="120" y="188" width="532" height="24" rx="12" fill="#000000" opacity="0.28" />
      </g>

      {/* ══ PEN (horizontal, rotated -38°) ══ */}
      <g transform="rotate(-38, 380, 200)">

        {/* ─ Nib: 18k gold, tapered asymmetric leaf ─ */}
        {/* Main nib face */}
        <path d="M 166,191 C 154,191 140,195 124,200 C 140,205 154,209 166,209 Z"
          fill="url(#pg-nib)" />
        {/* Upper face highlight (picks up ceiling light) */}
        <path d="M 166,191 C 156,191 143,194 128,198 L 124,200 C 136,195 150,191 166,191 Z"
          fill="#f0e06a" opacity="0.22" />
        {/* Center slit — the defining mark of a fountain pen nib */}
        <line x1="127" y1="200" x2="165" y2="200" stroke="#2e1800" strokeWidth="0.9" />
        {/* Breather hole — oval punch, lets ink flow */}
        <ellipse cx="149" cy="200" rx="5.5" ry="3.5" fill="#1e1000" />
        {/* Fine tine etching lines */}
        <line x1="139" y1="196" x2="139" y2="193" stroke="#a07818" strokeWidth="0.6" opacity="0.5" />
        <line x1="155" y1="195" x2="155" y2="192" stroke="#a07818" strokeWidth="0.6" opacity="0.5" />
        {/* Tipping ball — iridium/rhodium alloy at very tip */}
        <circle cx="123" cy="200" r="2.4" fill="#d8d8c0" />
        <circle cx="123" cy="200" r="1.2" fill="#f0f0e0" opacity="0.8" />
        {/* Ink meniscus at tip */}
        <ellipse cx="120" cy="200" rx="2.2" ry="1.6" fill="#1a3c72" opacity="0.88" />

        {/* Nib-to-section collar ring */}
        <rect x="164" y="188" width="7" height="24" fill="url(#pg-gold)" rx="1" />

        {/* ─ Grip section: matte black rubber, knurled ─ */}
        <rect x="171" y="190" width="56" height="20" fill="url(#pg-grip)" />
        <line x1="171" y1="190" x2="227" y2="190" stroke="#242424" strokeWidth="0.5" />
        <line x1="171" y1="210" x2="227" y2="210" stroke="#040404" strokeWidth="0.5" />
        {/* Knurling — 6 circumferential grooves */}
        {[180, 189, 198, 207, 216].map((x) => (
          <line key={x} x1={x} y1="190" x2={x} y2="210" stroke="#060606" strokeWidth="1.4" opacity="0.65" />
        ))}

        {/* ─ Collar: section-to-barrel, gold trim ring ─ */}
        <rect x="227" y="187" width="10" height="26" fill="url(#pg-gold)" />
        <line x1="231" y1="187" x2="231" y2="213" stroke="#6a4c0a" strokeWidth="0.7" opacity="0.5" />
        <line x1="234" y1="187" x2="234" y2="213" stroke="#f6e870" strokeWidth="0.5" opacity="0.35" />

        {/* ─ Barrel: dark olive-green lacquer, 354px long ─ */}
        <rect x="237" y="185" width="354" height="30" fill="url(#pg-barrel)" />
        {/* Top edge line */}
        <line x1="237" y1="185" x2="591" y2="185" stroke="#2e3c1a" strokeWidth="0.6" />
        {/* Bottom edge line */}
        <line x1="237" y1="215" x2="591" y2="215" stroke="#040604" strokeWidth="0.6" />
        {/* Sheen — 6px highlight streak near crown */}
        <rect x="237" y="185" width="354" height="6" fill="url(#pg-sheen)" />
        {/* Brand imprint in lacquer */}
        <text x="385" y="203" fontSize="6" fill="#1c2810" fontFamily="serif"
          letterSpacing="4" textAnchor="middle" opacity="0.75">
          PEN · PAPER · INK
        </text>
        {/* Mid-barrel trim ring */}
        <rect x="430" y="185" width="7" height="30" fill="url(#pg-gold)" opacity="0.75" />

        {/* ─ Clip: spring steel, gold plated ─ */}
        {/* Clip body runs along top of barrel */}
        <rect x="270" y="180" width="318" height="3" fill="url(#pg-clip)" />
        <rect x="270" y="180" width="318" height="1" fill="#f8f0a0" opacity="0.25" />
        {/* Clip foot / spring tab */}
        <path d="M 270,180 L 270,186 L 276,186 L 278,182 L 270,180 Z" fill="#c09020" />
        {/* Clip ball at cap end */}
        <circle cx="589" cy="181" r="5.5" fill="url(#pg-gold)" />
        <circle cx="589" cy="181" r="2.2" fill="#f6e870" opacity="0.55" />

        {/* ─ Shoulder ring: barrel-to-tailpiece ─ */}
        <rect x="591" y="185" width="9" height="30" fill="url(#pg-gold)" />
        <line x1="595" y1="185" x2="595" y2="215" stroke="#6a4c0a" strokeWidth="0.7" opacity="0.5" />
        <line x1="598" y1="185" x2="598" y2="215" stroke="#f6e870" strokeWidth="0.5" opacity="0.35" />

        {/* ─ Tailpiece / cap end ─ */}
        <path d="M 600,185 L 644,185 Q 655,185 655,200 Q 655,215 644,215 L 600,215 Z"
          fill="url(#pg-barrel)" />
        <line x1="600" y1="185" x2="646" y2="185" stroke="#2e3c1a" strokeWidth="0.6" />
        <line x1="600" y1="215" x2="646" y2="215" stroke="#040604" strokeWidth="0.6" />
        <path d="M 600,185 L 648,185 Q 655,186 655,192 L 600,192 Z" fill="url(#pg-sheen)" opacity="0.45" />
      </g>
    </svg>
  );
}

// ── Sankey family flow diagram ────────────────────────────────────────────────
function SankeyThumb() {
  const col = { g1: 80, g2: 280, g3: 480, g4: 660 };
  const nodes = {
    g1: [{ y: 80, h: 60 }, { y: 200, h: 60 }, { y: 300, h: 40 }],
    g2: [{ y: 60, h: 80 }, { y: 240, h: 80 }],
    g3: [{ y: 80, h: 60 }, { y: 200, h: 50 }, { y: 300, h: 60 }],
    g4: [{ y: 130, h: 130 }],
  };
  const cyan = '#00d4ff';
  const purple = '#e040fb';
  const violet = '#a78bfa';
  const pink = '#ff006e';

  const flow = (x1: number, y1: number, h1: number, x2: number, y2: number, h2: number, color: string, op = 0.18) => {
    const cx = (x1 + x2) / 2;
    return (
      <path
        d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}
           L ${x2} ${y2 + h2} C ${cx} ${y2 + h2}, ${cx} ${y1 + h1}, ${x1} ${y1 + h1} Z`}
        fill={color}
        opacity={op}
      />
    );
  };

  return (
    <svg viewBox="0 0 760 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="sg1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={cyan} stopOpacity="0.6" />
          <stop offset="100%" stopColor={purple} stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="sg2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={purple} stopOpacity="0.6" />
          <stop offset="100%" stopColor={violet} stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="sg3" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={violet} stopOpacity="0.6" />
          <stop offset="100%" stopColor={pink} stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect width="760" height="400" fill="#07070a" />

      {/* Flows col1→col2 */}
      {flow(col.g1 + 10, 80, 60, col.g2, 60, 35, cyan, 0.22)}
      {flow(col.g1 + 10, 80, 60, col.g2, 95, 25, cyan, 0.14)}
      {flow(col.g1 + 10, 200, 60, col.g2, 60, 25, purple, 0.15)}
      {flow(col.g1 + 10, 200, 60, col.g2, 240, 40, purple, 0.2)}
      {flow(col.g1 + 10, 300, 40, col.g2, 280, 40, violet, 0.18)}

      {/* Flows col2→col3 */}
      {flow(col.g2 + 10, 60, 45, col.g3, 80, 30, cyan, 0.2)}
      {flow(col.g2 + 10, 60, 45, col.g3, 200, 25, cyan, 0.12)}
      {flow(col.g2 + 10, 240, 50, col.g3, 200, 25, purple, 0.18)}
      {flow(col.g2 + 10, 240, 50, col.g3, 300, 30, purple, 0.2)}

      {/* Flows col3→col4 */}
      {flow(col.g3 + 10, 80, 60, col.g4, 130, 45, cyan, 0.22)}
      {flow(col.g3 + 10, 200, 50, col.g4, 175, 40, violet, 0.18)}
      {flow(col.g3 + 10, 300, 60, col.g4, 215, 45, pink, 0.2)}

      {/* Nodes col1 */}
      {nodes.g1.map((n, i) => (
        <rect key={i} x={col.g1} y={n.y} width={10} height={n.h} rx="2" fill={[cyan, purple, violet][i]} opacity="0.9" />
      ))}
      {/* Nodes col2 */}
      {nodes.g2.map((n, i) => (
        <rect key={i} x={col.g2} y={n.y} width={10} height={n.h} rx="2" fill={[cyan, purple][i]} opacity="0.9" />
      ))}
      {/* Nodes col3 */}
      {nodes.g3.map((n, i) => (
        <rect key={i} x={col.g3} y={n.y} width={10} height={n.h} rx="2" fill={[cyan, violet, pink][i]} opacity="0.9" />
      ))}
      {/* Nodes col4 */}
      <rect x={col.g4} y={130} width={10} height={130} rx="2" fill={purple} opacity="0.9" />

      {/* Generation labels */}
      {[
        [col.g1 + 5, 380, 'great-grandparents'],
        [col.g2 + 5, 380, 'grandparents'],
        [col.g3 + 5, 380, 'parents'],
        [col.g4 + 5, 380, 'you'],
      ].map(([x, y, label]) => (
        <text key={String(label)} x={Number(x)} y={Number(y)} fontSize="9" fill="#4a453e"
          textAnchor="middle" fontFamily="monospace" letterSpacing="1">
          {String(label)}
        </text>
      ))}
    </svg>
  );
}

// ── Multi-series area chart ───────────────────────────────────────────────────
function ChartThumb() {
  const W = 760; const H = 400;
  const pad = { t: 30, b: 50, l: 50, r: 30 };
  const iW = W - pad.l - pad.r;
  const iH = H - pad.t - pad.b;

  const data = [
    [12, 28, 22, 40, 35, 55, 48, 62, 58, 75, 70, 88],
    [8, 15, 20, 14, 30, 25, 38, 32, 45, 40, 52, 48],
    [5, 10, 8, 18, 12, 22, 16, 28, 22, 35, 28, 42],
  ];
  const colors = ['#00d4ff', '#e040fb', '#ff006e'];
  const n = data[0].length;
  const maxVal = 100;

  const px = (i: number) => pad.l + (i / (n - 1)) * iW;
  const py = (v: number) => pad.t + iH - (v / maxVal) * iH;

  const linePath = (series: number[]) =>
    series.map((v, i) => `${i === 0 ? 'M' : 'L'} ${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' ');

  const areaPath = (series: number[]) =>
    `${linePath(series)} L ${px(n - 1).toFixed(1)} ${(pad.t + iH).toFixed(1)} L ${pad.l} ${(pad.t + iH).toFixed(1)} Z`;

  const gridYs = [0, 25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        {colors.map((c, i) => (
          <linearGradient key={i} id={`cg${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c} stopOpacity="0.25" />
            <stop offset="100%" stopColor={c} stopOpacity="0.02" />
          </linearGradient>
        ))}
      </defs>
      <rect width={W} height={H} fill="#07070a" />

      {/* Grid lines */}
      {gridYs.map((v) => (
        <line key={v}
          x1={pad.l} y1={py(v)} x2={W - pad.r} y2={py(v)}
          stroke="#1a1a2e" strokeWidth="1"
        />
      ))}
      {/* X axis ticks */}
      {data[0].map((_, i) => (
        i % 3 === 0 && <line key={i}
          x1={px(i)} y1={pad.t + iH} x2={px(i)} y2={pad.t + iH + 4}
          stroke="#2a2620" strokeWidth="1"
        />
      ))}

      {/* Area fills */}
      {data.map((series, i) => (
        <path key={i} d={areaPath(series)} fill={`url(#cg${i})`} />
      ))}

      {/* Lines */}
      {data.map((series, i) => (
        <path key={i} d={linePath(series)} fill="none" stroke={colors[i]} strokeWidth="2"
          strokeLinejoin="round" strokeLinecap="round" />
      ))}

      {/* Dots at last point */}
      {data.map((series, i) => (
        <circle key={i}
          cx={px(n - 1)} cy={py(series[n - 1])}
          r="4" fill={colors[i]} opacity="0.9"
        />
      ))}

      {/* Y axis labels */}
      {gridYs.filter(v => v > 0).map((v) => (
        <text key={v} x={pad.l - 8} y={py(v) + 4} fontSize="9" fill="#4a453e"
          textAnchor="end" fontFamily="monospace">
          {v}
        </text>
      ))}

      {/* Legend */}
      {['series a', 'series b', 'series c'].map((label, i) => (
        <g key={i} transform={`translate(${pad.l + i * 120}, ${H - 14})`}>
          <rect width="16" height="3" y="-2" rx="1" fill={colors[i]} />
          <text x="20" fontSize="9" fill="#6b6660" fontFamily="monospace" letterSpacing="1">
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
}

const SITES: Site[] = [
  {
    name: 'Family Roots',
    url: 'https://familyroots.center',
    tagline: 'Your family\'s story, beautifully told.',
    description:
      'Features a patent-pending dual parent view that renders maternal and paternal lineage as a single coherent branching network — not a fan chart, not a flat list. 7 distinct visualizations, AI historian, recipe archive, and migration maps.',
    tags: ['next.js', 'ai', 'genealogy', 'visualization'],
    thumb: <SankeyThumb />,
    patent: 'dual parent view',
    status: 'live',
  },
  {
    name: 'Pen & Paper',
    url: 'https://penpaperandink.app/pens',
    tagline: 'A fountain pen almanac.',
    description:
      'A patent-pending pairing engine models nib flex, paper sizing, ink flow rate, and bleed resistance to predict real-world compatibility before you buy. Thirty years of analog obsession distilled into an algorithm.',
    tags: ['react', 'editorial', 'catalogue', 'design'],
    thumb: <PenThumb />,
    patent: 'pairing engine',
    status: 'live',
  },
  {
    name: 'GP Sailing',
    url: 'https://socraticstatic.github.io/GPSail/',
    tagline: 'High-speed hydrofoil racing.',
    description:
      'SailGP Season 6 tracker: live standings, race calendar, team profiles, and the road to the Abu Dhabi Grand Final across 13 global venues.',
    tags: ['react', 'sports', 'data', 'live'],
    ogImage: 'https://socraticstatic.github.io/GPSail/hero-poster.jpg',
    status: 'live',
  },
  {
    name: 'Chart System',
    url: 'https://socraticstatic.github.io/Visualizations/',
    tagline: 'Sane and useful color strategies.',
    description:
      'A chart color system built for accessible, legible, and intentional data visualization. Multiple themes, multiple chart types.',
    tags: ['react', 'data-vis', 'color', 'design-system'],
    thumb: <ChartThumb />,
    status: 'live',
  },
];

const STATUS_LABEL: Record<Site['status'], string> = {
  live: 'live',
  beta: 'beta',
  wip: 'wip',
};

const STATUS_COLOR: Record<Site['status'], string> = {
  live: '#00d4ff',
  beta: '#e040fb',
  wip: '#a78bfa',
};

export default function LiveSites() {
  return (
    <section id="lab" className="relative py-20 md:py-28 border-b border-[#1f1c17]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">
        <SectionHeader
          path="/lab/sites"
          jp="稼働中"
          count={SITES.length}
          right="deployed · independent products"
        />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SITES.map((site, i) => (
            <SiteCard key={site.url} site={site} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SiteCard({ site, index }: { site: Site; index: number }) {
  const statusColor = STATUS_COLOR[site.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="group border border-[#1f1c17] bg-[#0b0a08]/60 hover:border-[#2a2620] transition-colors overflow-hidden"
    >
      {/* Thumbnail */}
      <a
        href={site.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden"
        aria-label={`Visit ${site.name}`}
      >
        <div className="relative overflow-hidden bg-[#07070a]" style={{ aspectRatio: '1200/630' }}>
          {site.thumb && (
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.03]">
              {site.thumb}
            </div>
          )}
          {site.ogImage && !site.thumb && (
            <img
              src={site.ogImage}
              alt={site.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a08]/50 via-transparent to-transparent" />
        </div>
      </a>

      {/* Info */}
      <div className="px-4 py-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: statusColor }}>
                {STATUS_LABEL[site.status]}
              </span>
              <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: statusColor }} />
            </div>
            <h3 className="text-[#e8e4dc] font-light text-base leading-tight">{site.name}</h3>
          </div>
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 mt-1 text-[#4a453e] hover:text-[#00d4ff] transition-colors"
            aria-label={`Open ${site.name}`}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {site.patent && (
          <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#c9a030]/40 bg-[#c9a030]/06">
            <span className="text-[8px] tracking-[0.4em] uppercase text-[#c9a030]">patent pending</span>
            <span className="text-[8px] text-[#8a6a10]">·</span>
            <span className="text-[8px] tracking-[0.2em] text-[#a07828]">{site.patent}</span>
          </div>
        )}
        <p className="text-[11px] text-[#a8a29e] leading-relaxed mb-3">
          {site.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {site.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[9px] tracking-[0.3em] uppercase border border-[#1f1c17] text-[#6b6660]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-[#1f1c17] text-[10px] text-[#4a453e] font-mono truncate">
          {site.url.replace('https://', '')}
        </div>
      </div>
    </motion.div>
  );
}

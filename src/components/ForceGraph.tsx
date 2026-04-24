import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationFrame } from 'framer-motion';
import type { Project } from '../lib/supabase';
import { supabase } from '../lib/supabase';

/* ============================================================
 * IRIS ARCHIVE
 * ------------------------------------------------------------
 * The career rendered as a single human eye. Every project is a
 * photoreceptor — a luminous implant embedded in the iridial
 * striations. Angle = year (newest at 12 o'clock, CCW into the
 * past). Radius = featured work (near the limbus) vs archive
 * (close to the pupil). The pupil dilates on focus. The whole
 * eye micro-saccades every few seconds.
 * ============================================================ */

const VIEW = 720;
const CENTER = VIEW / 2;
const PUPIL_R = 64;
const IRIS_R_INNER = 78;
const IRIS_R_OUTER = 322;
const LIMBUS_R = 334;
const FIBER_COUNT = 280;
const GAP_DEG = 38;
const ARC_DEG = 360 - GAP_DEG;

type ProjectLayout = {
  id: string;
  project: Project;
  year: number;
  angleDeg: number;
  radius: number;
  size: number;
  color: string;
};

function hash(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  }
  return h >>> 0;
}

function seededRand(seed: number) {
  let s = (seed || 1) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function polar(angleDeg: number, radius: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: CENTER + Math.cos(a) * radius, y: CENTER + Math.sin(a) * radius };
}

const FIBER_PALETTE = ['#e7b766', '#c27a32', '#ffb347', '#8a5a2a', '#a36634', '#2a1a0f', '#ff9a3c'];
const RECEPTOR_PALETTE = ['#ff9a3c', '#ffb267', '#ffcf8e', '#5ec8d8', '#ff7a5c', '#e7b766'];

// Pure function — no React deps
function buildFibers(): Array<{ d: string; stroke: string; width: number; opacity: number }> {
  const rng = seededRand(9173);
  const fibers: Array<{ d: string; stroke: string; width: number; opacity: number }> = [];
  for (let i = 0; i < FIBER_COUNT; i++) {
    const baseAngle = rng() * 360;
    const jitter = () => (rng() - 0.5) * 6;
    const r0 = IRIS_R_INNER + rng() * 3;
    const r1 = IRIS_R_INNER + 40 + rng() * 20;
    const r2 = IRIS_R_OUTER - 60 + rng() * 30;
    const r3 = IRIS_R_OUTER - 4 + rng() * 6;
    const a0 = baseAngle + jitter() * 0.2;
    const a1 = baseAngle + jitter();
    const a2 = baseAngle + jitter() * 1.3;
    const a3 = baseAngle + jitter() * 1.6;
    const p0 = polar(a0, r0);
    const p1 = polar(a1, r1);
    const p2 = polar(a2, r2);
    const p3 = polar(a3, r3);
    const d = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;
    const stroke = FIBER_PALETTE[Math.floor(rng() * FIBER_PALETTE.length)];
    const width = 0.35 + rng() * 1.15;
    const opacity = 0.18 + rng() * 0.55;
    fibers.push({ d, stroke, width, opacity });
  }
  return fibers;
}

// Pure function — no React deps
function buildCrypts(): Array<{ x: number; y: number; rx: number; ry: number; rot: number; alpha: number }> {
  const rng = seededRand(12049);
  return Array.from({ length: 42 }).map(() => {
    const a = rng() * 360;
    const r = IRIS_R_INNER + 6 + rng() * (IRIS_R_OUTER - IRIS_R_INNER - 18);
    const { x, y } = polar(a, r);
    const rx = 1 + rng() * 4;
    const ry = rx * (0.5 + rng() * 1.2);
    return { x, y, rx, ry, rot: rng() * 360, alpha: 0.35 + rng() * 0.45 };
  });
}

// Pure function — no React deps
function computeLayout(projects: Project[]): ProjectLayout[] {
  if (!projects.length) return [];
  const years = projects.map((p) => Number(p.year)).filter((n) => !Number.isNaN(n));
  const minY = Math.min(...years);
  const maxY = Math.max(...years);
  const span = Math.max(1, maxY - minY);

  const byYear = new Map<number, Project[]>();
  projects.forEach((p) => {
    const y = Number(p.year);
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(p);
  });

  const nodes: ProjectLayout[] = [];
  byYear.forEach((group, year) => {
    const t = (year - minY) / span;
    const start = -90 + GAP_DEG / 2;
    const angle = start - (1 - t) * ARC_DEG;
    group.forEach((p, i) => {
      const featured = p.featured;
      const baseR = featured ? IRIS_R_OUTER - 38 : IRIS_R_INNER + 62;
      const jitterR = ((hash(p.id) % 28) - 14) * (featured ? 0.6 : 1.1);
      const radius = baseR + jitterR;
      const sliceOffset = (i - (group.length - 1) / 2) * (featured ? 2.2 : 3.4);
      const size = featured ? 10 : 6.5;
      const color = RECEPTOR_PALETTE[hash(p.id) % RECEPTOR_PALETTE.length];
      nodes.push({
        id: p.id,
        project: p,
        year,
        angleDeg: angle + sliceOffset,
        radius,
        size,
        color,
      });
    });
  });
  return nodes;
}

function MicroSaccade({ children }: { children: React.ReactNode }) {
  const ref = useRef<SVGGElement>(null);
  const lastJumpAt = useRef(0);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useAnimationFrame((time) => {
    if (time - lastJumpAt.current > 2800 + Math.random() * 3500) {
      target.current = {
        x: (Math.random() - 0.5) * 1.6,
        y: (Math.random() - 0.5) * 1.2,
      };
      lastJumpAt.current = time;
    }
    current.current.x += (target.current.x - current.current.x) * 0.08;
    current.current.y += (target.current.y - current.current.y) * 0.08;
    if (ref.current) {
      ref.current.setAttribute(
        'transform',
        `translate(${current.current.x.toFixed(2)}, ${current.current.y.toFixed(2)})`,
      );
    }
  });

  return <g ref={ref}>{children}</g>;
}

export default function ForceGraph({ projects }: { projects: Project[] }) {
  const nodes = useMemo(() => computeLayout(projects), [projects]);
  const fibers = useMemo(() => buildFibers(), []);
  const crypts = useMemo(() => buildCrypts(), []);
  const gradId = useId();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | 'all'>('all');
  const [activeYear, setActiveYear] = useState<number | null>(null);

  const focused = useMemo(() => {
    const id = hoverId ?? selectedId;
    return id ? nodes.find((n) => n.id === id) ?? null : null;
  }, [hoverId, selectedId, nodes]);

  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((p) => p.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [projects]);

  const years = useMemo(
    () => Array.from(new Set(nodes.map((n) => n.year))).sort((a, b) => a - b),
    [nodes],
  );

  const highlightId = focused?.id;
  const highlightYear = activeYear ?? focused?.year ?? null;

  useEffect(() => {
    if (!selectedId) return;
    const n = nodes.find((x) => x.id === selectedId);
    if (!n) return;
    let cancelled = false;
    void supabase.from('visitor_events').insert({
      visitor_id: (typeof window !== 'undefined' && localStorage.getItem('intel:v1:vid')) || 'anon',
      type: 'iris_select',
      payload: { project_id: n.project.id, year: n.year, title: n.project.title },
    }).then(() => {
      if (cancelled) return;
    });
    return () => { cancelled = true; };
  }, [selectedId]);

  if (!nodes.length) return null;

  const isDimmed = (n: ProjectLayout) => {
    if (activeTag !== 'all' && !n.project.tags.includes(activeTag)) return true;
    if (highlightYear != null && n.year !== highlightYear && activeTag === 'all' && !focused) return true;
    return false;
  };

  const pupilScale = focused || activeYear != null ? 1.55 : 1;
  const focusSectorAngle = focused?.angleDeg ?? null;

  return (
    <section
      id="archive"
      className="relative py-20 md:py-28 border-b border-[#1f1c17] overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="flex items-center gap-3 text-xs mb-3">
          <span className="text-[#e7b766]">$</span>
          <span className="text-[#efe6d4]">
            optic-nerve --scan /career --view=iris_archive --subject=boswell.m
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl text-[#efe6d4] mb-2">
          <span className="br-sign">iris archive</span>
          <span className="font-jp text-[#5ec8d8] text-base md:text-lg ml-3">虹彩記憶</span>
        </h2>
        <p className="text-xs text-[#7a6e62] mb-6 max-w-2xl leading-relaxed">
          # every project is a photoreceptor implanted in the subject&apos;s iris.
          angle = year, counter-clockwise into the past. featured work sits near the limbus;
          archive nests closer to the pupil. the pupil dilates on what you focus on.
        </p>

        <div className="flex flex-wrap items-center gap-2 mb-5">
          <button
            onClick={() => setActiveTag('all')}
            className={`px-3 py-1 text-[10px] border transition-colors ${
              activeTag === 'all'
                ? 'border-[#ff9a3c] text-[#ff9a3c] bg-[#1a1008]'
                : 'border-[#2a2620] text-[#7a6e62] hover:text-[#efe6d4] hover:border-[#3a342c]'
            }`}
          >
            ALL · {nodes.length}
          </button>
          {topTags.map(([t, n]) => {
            const on = activeTag === t;
            return (
              <button
                key={t}
                onClick={() => setActiveTag(on ? 'all' : t)}
                className={`px-3 py-1 text-[10px] border transition-colors ${
                  on
                    ? 'border-[#5ec8d8] text-[#5ec8d8] bg-[#081418]'
                    : 'border-[#2a2620] text-[#a8a29e] hover:text-[#efe6d4] hover:border-[#3a342c]'
                }`}
              >
                {t} · {n}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 lg:col-span-8 relative border border-[#2a1810] bg-[#060403] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a1810] text-[10px] tracking-[0.4em] uppercase">
              <span className="text-[#ff9a3c]">optic · visual cortex link</span>
              <span className="text-[#7a6e62]">
                {nodes.length} receptors · focus {focused ? `#${focused.project.id.slice(0, 4)}` : 'idle'}
              </span>
            </div>

            <div className="relative aspect-square max-h-[720px]">
              <svg
                viewBox={`0 0 ${VIEW} ${VIEW}`}
                className="absolute inset-0 w-full h-full"
                onClick={() => {
                  setSelectedId(null);
                  setActiveYear(null);
                }}
              >
                <defs>
                  <radialGradient id={`${gradId}-sky`} cx="50%" cy="50%" r="60%">
                    <stop offset="0%" stopColor="#1a0a06" />
                    <stop offset="55%" stopColor="#0a0604" />
                    <stop offset="100%" stopColor="#000" />
                  </radialGradient>
                  <radialGradient id={`${gradId}-iris`} cx="50%" cy="50%" r="52%">
                    <stop offset="0%" stopColor="#ffb347" stopOpacity="0.22" />
                    <stop offset="40%" stopColor="#8a5a2a" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#1a0a06" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id={`${gradId}-pupil`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#000" />
                    <stop offset="80%" stopColor="#000" />
                    <stop offset="100%" stopColor="#1a0a06" />
                  </radialGradient>
                  <filter id={`${gradId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <pattern id={`${gradId}-scan`} width="4" height="4" patternUnits="userSpaceOnUse">
                    <rect width="4" height="1" fill="#000" />
                  </pattern>
                </defs>

                <rect width={VIEW} height={VIEW} fill={`url(#${gradId}-sky)`} />

                <MicroSaccade>
                  <circle cx={CENTER} cy={CENTER} r={IRIS_R_OUTER} fill={`url(#${gradId}-iris)`} />

                  <g>
                    {fibers.map((f, i) => (
                      <path
                        key={i}
                        d={f.d}
                        stroke={f.stroke}
                        strokeWidth={f.width}
                        fill="none"
                        opacity={f.opacity}
                        strokeLinecap="round"
                      />
                    ))}
                  </g>

                  <g>
                    {crypts.map((c, i) => (
                      <ellipse
                        key={i}
                        cx={c.x}
                        cy={c.y}
                        rx={c.rx}
                        ry={c.ry}
                        fill="#1a0a06"
                        opacity={c.alpha}
                        transform={`rotate(${c.rot} ${c.x} ${c.y})`}
                      />
                    ))}
                  </g>

                  {[0.35, 0.6, 0.85].map((t, i) => (
                    <circle
                      key={i}
                      cx={CENTER}
                      cy={CENTER}
                      r={IRIS_R_INNER + (IRIS_R_OUTER - IRIS_R_INNER) * t}
                      fill="none"
                      stroke="#e7b766"
                      strokeOpacity={0.06}
                      strokeWidth={0.7}
                    />
                  ))}

                  <AnimatePresence>
                    {focusSectorAngle != null && (
                      <motion.path
                        key={`${focusSectorAngle}-${focused?.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.35 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        d={sectorPath(focusSectorAngle, 8, IRIS_R_INNER, IRIS_R_OUTER)}
                        fill={focused?.color ?? '#ff9a3c'}
                        style={{ mixBlendMode: 'screen' }}
                      />
                    )}
                  </AnimatePresence>

                  <g opacity={0.75}>
                    {years.map((y) => {
                      const t = (y - years[0]) / Math.max(1, years[years.length - 1] - years[0]);
                      const start = -90 + GAP_DEG / 2;
                      const ang = start - (1 - t) * ARC_DEG;
                      const inner = polar(ang, LIMBUS_R + 4);
                      const outer = polar(ang, LIMBUS_R + 14);
                      const label = polar(ang, LIMBUS_R + 30);
                      const on = highlightYear === y;
                      return (
                        <g key={y}>
                          <line
                            x1={inner.x}
                            y1={inner.y}
                            x2={outer.x}
                            y2={outer.y}
                            stroke={on ? '#ff9a3c' : '#4a4036'}
                            strokeWidth={on ? 1.6 : 0.9}
                          />
                          {(on || y % 5 === 0 || y === years[0] || y === years[years.length - 1]) && (
                            <text
                              x={label.x}
                              y={label.y}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize={9}
                              fontFamily="'JetBrains Mono', monospace"
                              letterSpacing="2"
                              fill={on ? '#ff9a3c' : '#7a6e62'}
                              style={{ cursor: 'pointer' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveYear((v) => (v === y ? null : y));
                              }}
                            >
                              {y}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </g>

                  <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={LIMBUS_R}
                    fill="none"
                    stroke="#1a0a06"
                    strokeWidth={6}
                  />
                  <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={LIMBUS_R - 6}
                    fill="none"
                    stroke="#e7b766"
                    strokeOpacity={0.08}
                    strokeWidth={1}
                  />

                  <g>
                    {nodes.map((n) => {
                      const { x, y } = polar(n.angleDeg, n.radius);
                      const dim = isDimmed(n);
                      const isFocus = highlightId === n.id;
                      const isYearMatch = highlightYear === n.year;
                      const isHL = isFocus || (isYearMatch && activeTag === 'all');
                      return (
                        <g key={n.id}>
                          {isHL && (
                            <circle
                              cx={x}
                              cy={y}
                              r={n.size + 6}
                              fill={n.color}
                              opacity={0.18}
                              filter={`url(#${gradId}-glow)`}
                            />
                          )}
                          <motion.circle
                            cx={x}
                            cy={y}
                            initial={false}
                            animate={{
                              r: isFocus ? n.size + 3 : n.size,
                              opacity: dim ? 0.18 : isHL ? 1 : 0.9,
                            }}
                            transition={{ duration: 0.3 }}
                            fill={n.color}
                            filter={`url(#${gradId}-glow)`}
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() => setHoverId(n.id)}
                            onMouseLeave={() => setHoverId(null)}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(n.id);
                              setActiveYear(null);
                            }}
                          />
                          <circle cx={x} cy={y} r={Math.max(1, n.size * 0.35)} fill="#fff8e0" opacity={0.7} />
                        </g>
                      );
                    })}
                  </g>

                  <motion.g
                    animate={{ scale: pupilScale }}
                    transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                    style={{ transformOrigin: `${CENTER}px ${CENTER}px`, transformBox: 'fill-box' }}
                  >
                    <circle cx={CENTER} cy={CENTER} r={PUPIL_R} fill={`url(#${gradId}-pupil)`} />
                    <circle
                      cx={CENTER}
                      cy={CENTER}
                      r={PUPIL_R}
                      fill="none"
                      stroke="#000"
                      strokeWidth={2}
                    />
                    <circle cx={CENTER - 14} cy={CENTER - 18} r={7} fill="#fff" opacity={0.12} />
                    <circle cx={CENTER + 20} cy={CENTER + 10} r={3} fill="#fff" opacity={0.08} />
                  </motion.g>
                </MicroSaccade>

                <rect
                  width={VIEW}
                  height={VIEW}
                  fill={`url(#${gradId}-scan)`}
                  opacity={0.08}
                  pointerEvents="none"
                />
              </svg>

              <div
                className="pointer-events-none absolute top-3 left-3 text-[9px] font-mono tracking-widest text-[#ff9a3c]"
                style={{ textShadow: '0 0 6px rgba(255,148,58,0.6)' }}
              >
                ▲ IRIS.SCAN · subject = boswell.m · integrity 0.98
              </div>
              <div
                className="pointer-events-none absolute bottom-3 right-3 text-[9px] font-mono tracking-widest text-[#5ec8d8]"
                style={{ textShadow: '0 0 6px rgba(94,200,216,0.4)' }}
              >
                REM 0.0 · SACCADE ACTIVE
              </div>
              <div className="pointer-events-none absolute bottom-3 left-3 font-jp text-[10px] tracking-widest text-[#ff7a5c]">
                虹彩 · {highlightYear ?? '全'}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-3">
            <AnimatePresence mode="wait">
              {focused ? (
                <motion.div
                  key={focused.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="border bg-[#0a0604]/95 p-5"
                  style={{
                    borderColor: `${focused.color}88`,
                    boxShadow: `0 0 28px ${focused.color}33`,
                  }}
                >
                  <div className="text-[10px] tracking-[0.45em] uppercase" style={{ color: focused.color }}>
                    implant · {focused.year} · {focused.project.client}
                  </div>
                  <div className="mt-2 text-xl text-[#efe6d4] leading-snug">{focused.project.title}</div>
                  <div className="mt-1 text-[11px] text-[#a8a29e]">{focused.project.role}</div>
                  <div className="mt-3 text-[12px] text-[#c9c2b4] leading-relaxed">
                    {focused.project.summary}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {focused.project.tags.slice(0, 8).map((t) => (
                      <span
                        key={t}
                        className="text-[9px] tracking-widest uppercase text-[#5ec8d8] border border-[#2a2620] px-1.5 py-0.5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#2a1810] flex items-center justify-between text-[9px] tracking-[0.4em] uppercase">
                    <span className="text-[#5c544a]">
                      polar · {focused.angleDeg.toFixed(1)}° · r{focused.radius.toFixed(0)}
                    </span>
                    <button
                      onClick={() => setSelectedId(null)}
                      className="text-[#7a6e62] hover:text-white transition-colors"
                    >
                      release
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border border-[#2a1810] bg-[#0a0604]/70 p-5"
                >
                  <div className="text-[10px] tracking-[0.4em] uppercase text-[#7a6e62]">awaiting focus</div>
                  <div className="mt-2 text-[13px] text-[#c9c2b4] leading-relaxed">
                    Hover a photoreceptor to surface its memory. Click to lock focus and dilate the pupil.
                    Click a year around the limbus to illuminate that band of the iris.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="border border-[#2a1810] bg-[#0a0604]/70 p-4">
              <div className="text-[9px] tracking-[0.5em] uppercase text-[#7a6e62] mb-3">
                year band · quick focus
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {years.map((y) => {
                  const on = highlightYear === y;
                  return (
                    <button
                      key={y}
                      onClick={() => {
                        setActiveYear((v) => (v === y ? null : y));
                        setSelectedId(null);
                      }}
                      className="text-[10px] tabular-nums py-1 border transition-colors"
                      style={{
                        borderColor: on ? '#ff9a3c' : '#2a2620',
                        color: on ? '#ff9a3c' : '#7a6e62',
                        background: on ? '#1a1008' : 'transparent',
                      }}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function sectorPath(centerAngleDeg: number, widthDeg: number, rInner: number, rOuter: number) {
  const a0 = ((centerAngleDeg - widthDeg / 2) * Math.PI) / 180;
  const a1 = ((centerAngleDeg + widthDeg / 2) * Math.PI) / 180;
  const p0 = { x: CENTER + Math.cos(a0) * rInner, y: CENTER + Math.sin(a0) * rInner };
  const p1 = { x: CENTER + Math.cos(a0) * rOuter, y: CENTER + Math.sin(a0) * rOuter };
  const p2 = { x: CENTER + Math.cos(a1) * rOuter, y: CENTER + Math.sin(a1) * rOuter };
  const p3 = { x: CENTER + Math.cos(a1) * rInner, y: CENTER + Math.sin(a1) * rInner };
  return `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 0 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 0 0 ${p0.x} ${p0.y} Z`;
}

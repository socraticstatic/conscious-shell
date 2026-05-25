import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { LinkedInArticle } from '../lib/supabase';

// Cells interlinked within cells interlinked within one stem.
// Each transmission is a star. The edges are what they share.
// You are reading one of them. The others are still up there, waiting.

function tagOverlap(a: string[], b: string[]): number {
  const setB = new Set(b);
  let n = 0;
  for (const t of a) if (setB.has(t)) n++;
  return n;
}

const TAG_HUE: Record<string, number> = {
  ai: 188,
  ux: 38,
  method: 28,
  strategy: 12,
  philosophy: 280,
  sustainability: 140,
  practice: 200,
  memoir: 0,
  personal: 0,
  essay: 220,
};

function articleHue(tags: string[]): number {
  for (const t of tags) if (t in TAG_HUE) return TAG_HUE[t];
  return 200;
}

export default function ArticleConstellation({
  articles,
  currentId,
  onSelect,
}: {
  articles: LinkedInArticle[];
  currentId: string;
  onSelect: (id: string) => void;
}) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const layout = useMemo(() => {
    const W = 720;
    const H = 320;
    const cx = W / 2;
    const cy = H / 2;
    const maxRadius = Math.min(W, H) * 0.42;

    const current = articles.find((a) => a.id === currentId);
    if (!current) return { W, H, nodes: [], edges: [] };

    const others = articles.filter((a) => a.id !== currentId);
    const ranked = others
      .map((a) => ({
        article: a,
        shared: tagOverlap(current.tags || [], a.tags || []),
      }))
      .sort((a, b) => b.shared - a.shared);

    // Polar layout. Angle by index, radius by relatedness (more shared tags = closer).
    const nodes = ranked.map((r, i) => {
      const angle = (i / ranked.length) * Math.PI * 2 - Math.PI / 2;
      const closeness = r.shared === 0 ? 1 : 1 / (1 + r.shared);
      const radius = maxRadius * (0.45 + 0.55 * closeness);
      return {
        id: r.article.id,
        title: r.article.title,
        date: r.article.published_date,
        tags: r.article.tags,
        shared: r.shared,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        radius: 7 + Math.min(10, (r.article.reading_minutes || 1) * 0.7),
        hue: articleHue(r.article.tags),
      };
    });

    const edges = nodes
      .filter((n) => n.shared > 0)
      .map((n) => ({ id: n.id, x: n.x, y: n.y, shared: n.shared, hue: n.hue }));

    return { W, H, cx, cy, nodes, edges, currentHue: articleHue(current.tags) };
  }, [articles, currentId]);

  if (!layout.nodes.length) return null;

  return (
    <div className="mt-10 pt-8 border-t border-dashed border-[#1f1c17]">
      <div className="flex items-baseline justify-between mb-4">
        <div className="text-[10px] font-mono text-[#7dd6e8] tracking-[0.35em] uppercase">
          ▸ cells interlinked · transmission map
        </div>
        <div className="text-[10px] font-mono text-[#5c544a] tracking-widest">
          edges = shared tags · click any star to retune
        </div>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${layout.W} ${layout.H}`}
          className="block w-full h-auto"
          style={{ maxHeight: 360 }}
        >
          <defs>
            <radialGradient id="centerGlow">
              <stop offset="0%" stopColor={`hsl(${layout.currentHue}, 70%, 60%)`} stopOpacity="0.5" />
              <stop offset="60%" stopColor={`hsl(${layout.currentHue}, 70%, 50%)`} stopOpacity="0.15" />
              <stop offset="100%" stopColor={`hsl(${layout.currentHue}, 70%, 40%)`} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Center glow */}
          <circle cx={layout.cx} cy={layout.cy} r="38" fill="url(#centerGlow)" />

          {/* Edges from center to related nodes */}
          {layout.edges.map((e, i) => {
            const isHover = hoverId === e.id;
            return (
              <motion.line
                key={`e-${e.id}`}
                x1={layout.cx}
                y1={layout.cy}
                x2={e.x}
                y2={e.y}
                stroke={`hsl(${e.hue}, 60%, ${isHover ? 70 : 45}%)`}
                strokeOpacity={isHover ? 0.85 : 0.18 + e.shared * 0.18}
                strokeWidth={isHover ? 1.4 : 0.6 + e.shared * 0.3}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: i * 0.02 }}
              />
            );
          })}

          {/* Current article node */}
          <motion.circle
            cx={layout.cx}
            cy={layout.cy}
            r="11"
            fill={`hsl(${layout.currentHue}, 80%, 65%)`}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.4, 1] }}
            transition={{ duration: 0.6 }}
          />
          <motion.circle
            cx={layout.cx}
            cy={layout.cy}
            r="11"
            fill="none"
            stroke={`hsl(${layout.currentHue}, 80%, 65%)`}
            strokeOpacity="0.5"
            animate={{ r: [11, 22, 11], strokeOpacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.6, repeat: Infinity }}
          />
          <text
            x={layout.cx}
            y={layout.cy - 14}
            textAnchor="middle"
            className="font-mono"
            fontSize="9"
            fill="#e7b766"
          >
            ▸ you are here
          </text>

          {/* Other article nodes */}
          {layout.nodes.map((n, i) => {
            const isHover = hoverId === n.id;
            return (
              <g
                key={n.id}
                onMouseEnter={() => setHoverId(n.id)}
                onMouseLeave={() => setHoverId(null)}
                onClick={() => onSelect(n.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* invisible hit area */}
                <circle cx={n.x} cy={n.y} r="14" fill="transparent" />
                <motion.circle
                  cx={n.x}
                  cy={n.y}
                  r={n.radius}
                  fill={`hsl(${n.hue}, 55%, ${isHover ? 70 : 45}%)`}
                  fillOpacity={isHover ? 1 : n.shared > 0 ? 0.85 : 0.35}
                  stroke={isHover ? `hsl(${n.hue}, 80%, 75%)` : 'none'}
                  strokeWidth="1"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.025 }}
                />
                {isHover && (
                  <>
                    <rect
                      x={n.x + 10}
                      y={n.y - 22}
                      width={Math.min(280, n.title.length * 5.6 + 18)}
                      height="34"
                      fill="#0a0a0e"
                      stroke={`hsl(${n.hue}, 60%, 50%)`}
                      strokeOpacity="0.6"
                    />
                    <text
                      x={n.x + 18}
                      y={n.y - 8}
                      className="font-mono"
                      fontSize="9"
                      fill="#e7b766"
                    >
                      {n.title.length > 46 ? n.title.slice(0, 44) + '…' : n.title}
                    </text>
                    <text
                      x={n.x + 18}
                      y={n.y + 4}
                      className="font-mono"
                      fontSize="8"
                      fill="#7dd6e8"
                    >
                      {n.date} · {n.shared > 0 ? `${n.shared} shared tag${n.shared > 1 ? 's' : ''}` : 'no shared tags'}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] font-mono text-[#5c544a]">
        <span className="text-[#7a6e62]">legend:</span>
        <span>distance = inverse of shared tags</span>
        <span>·</span>
        <span>node size = reading minutes</span>
        <span>·</span>
        <span>hue = primary tag</span>
      </div>
    </div>
  );
}

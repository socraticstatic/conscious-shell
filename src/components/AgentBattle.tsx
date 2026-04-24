import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play, Cpu, Skull } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Agent = 'scifi' | 'goth';

type Round = {
  id?: string;
  round_number: number;
  agent: Agent;
  title: string;
  palette: string[];
  motif: string;
  material: string;
  typography: string;
  critique: string;
  score: number;
};

const SCIFI = {
  label: 'SCI · ARCHIVIST',
  glyph: 'S-04',
  accent: '#5ec8d8',
  titleMood: '#c9e8ef',
  prefixes: ['Cold Archive', 'Sector', 'Protocol', 'Lattice', 'Chrome', 'Subject', 'Vector', 'Axis', 'Cal'],
  nouns: ['Helvetic', 'Vantablack', 'Kelvin', 'Tesseract', 'Nimbus', 'Quanta', 'Halon', 'Vacuum', 'Sodium', 'Plasma'],
  numbers: ['IX', '44', '07', '2049', '11.7K', 'Δ', 'Σ', 'Ø'],
  palettes: [
    ['#05060a', '#0d1218', '#3aa7b8', '#e7b766', '#ff3b6e'],
    ['#0a0a0f', '#1a1f28', '#5ec8d8', '#c9e8ef', '#ff9a3c'],
    ['#04070a', '#121a22', '#ffffff', '#7ed7e4', '#ff7a5c'],
    ['#000000', '#191d24', '#4af1d1', '#ffe06a', '#ff3b6e'],
    ['#010102', '#0c1016', '#a9d7e1', '#ffd89a', '#2c2a26'],
  ],
  motifs: [
    'concentric diagnostic rings',
    'isogrid scan lines',
    'magnetic-tape index bars',
    'orthographic wireframe pyramid',
    'voronoi dust map',
    'crosshair reticle with chromatic drift',
    'iris aperture on mirror black',
    'stacked data bands',
    'spinner trajectory arcs',
    'barcoded vector axes',
  ],
  materials: [
    'anodized aluminum · brushed',
    'wet obsidian plate',
    'sodium haze over satin chrome',
    'polycarbonate with fingerprint haze',
    'frosted acrylic · 0.3 opacity',
    'thermoplastic · micro-ribbed',
    'holo-laminate · refraction 1.4',
    'bone-white enamel · lab finish',
  ],
  typography: [
    'mono grotesque · 11/14 · tracking 0.4em',
    'geometric sans · all caps · tabular figures',
    'inspection stencil · 9pt · 200% line',
    'teletype · printer-green · 80 cols',
    'display sans · ultra thin · 92pt',
  ],
  titleTemplates: [
    '{prefix} {noun}-{number}',
    '{noun} / {number} · {prefix}',
    '{prefix}.{noun}',
    'Unit {number} — {noun}',
  ],
  critiquesAtOpp: [
    'your velvet rots under the sodium. quantify the dread.',
    'romance is a rounding error. give me the telemetry.',
    'your cathedral has no data layer. useless at altitude.',
    'candlelight does not pass spec. calibrate or concede.',
    'the dead do not ship. the grid does.',
    'your arches are nostalgia. my rings are protocol.',
    'blackletter cannot be read at 72dpi. adapt.',
    'grief does not scale. i do.',
    'you dress corpses. i interrogate them.',
    'i have indexed your entire ossuary in three passes.',
  ],
  concedeLines: [
    'concede: one channel of ember. nothing more.',
    'concede: an inch of velvet at the footer.',
    'concede: your serif, at caption size only.',
    'concede: a single candle. monitored.',
  ],
};

const GOTH = {
  label: 'GOTH · ARCHIVIST',
  glyph: 'G-13',
  accent: '#c14a5b',
  titleMood: '#efd6c8',
  prefixes: ['Vespers of', 'Office of', 'Reliquary', 'Ossuary', 'Canticle for', 'The Last', 'Memoria', 'Requiem of', 'Black'],
  nouns: ['Sorrow', 'Ash', 'Vellum', 'Oxblood', 'Bone', 'Candlesmoke', 'Myrrh', 'Iron', 'Veil', 'Lilith', 'Thorn'],
  numbers: ['MCMXCIX', 'VIII', 'XXI', '1347', 'cxv', 'no. 4', 'ii of iii'],
  palettes: [
    ['#0a0807', '#1a0f0c', '#5a0e14', '#e7d6b8', '#8a6a3b'],
    ['#08060a', '#2a0d15', '#8a1a2b', '#c9a86a', '#efe4cd'],
    ['#050304', '#1c1412', '#4a0a18', '#c8a673', '#efe0c6'],
    ['#0c0907', '#2a1a12', '#6a0e1c', '#d9b87a', '#f0e3ca'],
    ['#020202', '#130c0a', '#7a2030', '#b08a4a', '#f5e8d0'],
  ],
  motifs: [
    'rose window fracturing into dust',
    'burnt gothic arch · triple ogive',
    'handwritten marginalia in the gutter',
    'reliquary bone rendered in silverpoint',
    'candle with trailing smoke glyph',
    'wax seal half-broken',
    'single raven silhouette over red',
    'illuminated drop cap, bleeding',
    'gilt cross inverted under ash',
    'folded shroud, one edge visible',
  ],
  materials: [
    'oxblood velvet · crushed',
    'vellum · foxed and water-stained',
    'burnished brass · oxidized',
    'raw silk · funerary black',
    'parchment · candle-scorched edge',
    'beaten iron · cold to touch',
    'lacquered wood · ebony',
    'ash-linen with dried rose',
  ],
  typography: [
    'blackletter · drop cap · 96pt',
    'old-style serif · deckle edges',
    'engravers · small caps · 12/18',
    'handset roman · 14pt · generous leading',
    'spencerian · italic · blood red',
  ],
  titleTemplates: [
    '{prefix} {noun} {number}',
    '{prefix} the {noun}',
    '{noun}, {number}',
    '{prefix} {noun}, {number}',
  ],
  critiquesAtOpp: [
    'your grid is a cage. the dead do not obey architecture.',
    'you index. i mourn. only one of us has a soul.',
    'sodium light is ugly weeping. use a candle.',
    'chrome shows the face. velvet keeps the secret.',
    'you measure what i have already buried.',
    'protocol is the rosary of the faithless.',
    'your "enhance" is a confession. i read it.',
    'a helvetic headline is a headstone without a name.',
    'your grief is quantified. mine is infinite.',
    'plasma is only a memory of fire.',
  ],
  concedeLines: [
    'concede: the width of your reticle, at the binding.',
    'concede: one thin rule of cyan, as water damage.',
    'concede: a serial number, engraved on the reliquary.',
    'concede: your grid, but stained.',
  ],
};

const VOCAB: Record<Agent, typeof SCIFI> = { scifi: SCIFI, goth: GOTH };

function pick<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)];
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildTitle(agent: Agent, r: () => number): string {
  const v = VOCAB[agent];
  const template = pick(v.titleTemplates, r);
  return template
    .replace('{prefix}', pick(v.prefixes, r))
    .replace('{noun}', pick(v.nouns, r))
    .replace('{number}', pick(v.numbers, r));
}

function generateRound(agent: Agent, prev: Round | null, roundNumber: number): Round {
  const r = mulberry32(Date.now() + roundNumber * 1013);
  const v = VOCAB[agent];
  const basePalette = pick(v.palettes, r).slice();
  let palette = basePalette;

  if (prev && r() > 0.55) {
    const oppColor = pick(VOCAB[prev.agent].palettes, r);
    const stolen = oppColor[oppColor.length - 1];
    palette = [...basePalette.slice(0, 4), stolen];
  }

  const critiqueBank = prev && prev.agent !== agent ? v.critiquesAtOpp : v.concedeLines;
  const critique = pick(critiqueBank, r);

  const prevScore = prev?.score ?? 0;
  const sameAgent = prev?.agent === agent;
  const score = sameAgent
    ? prevScore + Math.floor(r() * 3 + 1)
    : Math.max(0, prevScore - Math.floor(r() * 2)) + Math.floor(r() * 2 + 1);

  return {
    round_number: roundNumber,
    agent,
    title: buildTitle(agent, r),
    palette,
    motif: pick(v.motifs, r),
    material: pick(v.materials, r),
    typography: pick(v.typography, r),
    critique,
    score,
  };
}

function AgentBadge({ agent, active, score }: { agent: Agent; active: boolean; score: number }) {
  const v = VOCAB[agent];
  const Icon = agent === 'scifi' ? Cpu : Skull;
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 border transition-all ${
        active ? 'bg-black/60' : 'bg-black/20 opacity-60'
      }`}
      style={{ borderColor: active ? v.accent : '#2a2a2a' }}
    >
      <div className="relative">
        <Icon className="w-4 h-4" style={{ color: v.accent }} />
        {active && (
          <motion.span
            className="absolute -inset-1 rounded-full"
            animate={{ boxShadow: [`0 0 0 0 ${v.accent}66`, `0 0 0 8px ${v.accent}00`] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
        )}
      </div>
      <div className="flex-1">
        <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: v.accent }}>
          {v.label}
        </div>
        <div className="text-[9px] tracking-[0.4em] uppercase text-[#7a6e62]">
          {v.glyph} · turns won <span className="text-white/80 tabular-nums">{score}</span>
        </div>
      </div>
    </div>
  );
}

function DesignBoard({ round }: { round: Round }) {
  const v = VOCAB[round.agent];
  const isGoth = round.agent === 'goth';
  const bg = round.palette[0] ?? '#000';
  const ink = round.palette[round.palette.length - 2] ?? '#eee';
  const accent = v.accent;
  const titleFont = isGoth
    ? '"Cormorant Garamond", "Times New Roman", serif'
    : 'ui-monospace, "JetBrains Mono", Menlo, monospace';

  return (
    <motion.div
      key={round.round_number}
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative aspect-[4/3] w-full overflow-hidden border"
      style={{ background: bg, borderColor: `${accent}55` }}
    >
      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          backgroundImage: isGoth
            ? 'radial-gradient(ellipse at 50% 120%, rgba(255,220,180,0.12), transparent 60%), repeating-linear-gradient(45deg, rgba(0,0,0,0) 0 18px, rgba(0,0,0,0.18) 18px 19px)'
            : 'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 4px), repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 60px)',
        }}
      />

      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-3 py-2 text-[9px] tracking-[0.4em] uppercase"
        style={{ color: `${accent}cc`, borderBottom: `1px solid ${accent}33` }}
      >
        <span>design·box · round {String(round.round_number).padStart(3, '0')}</span>
        <span style={{ color: `${v.titleMood}99` }}>{v.glyph}</span>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <div className="text-[10px] tracking-[0.6em] uppercase mb-3" style={{ color: `${accent}aa` }}>
          {round.motif}
        </div>
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="leading-none"
          style={{
            fontFamily: titleFont,
            color: ink,
            fontSize: 'clamp(28px, 5.4vw, 76px)',
            fontWeight: isGoth ? 400 : 200,
            letterSpacing: isGoth ? '0.02em' : '-0.02em',
            textShadow: isGoth ? `0 0 40px ${accent}33` : `0 0 28px ${accent}22`,
          }}
        >
          {round.title}
        </motion.div>

        <div className="mt-8 flex items-center gap-1.5">
          {round.palette.map((c, i) => (
            <motion.div
              key={`${round.round_number}-${i}`}
              initial={{ width: 0 }}
              animate={{ width: 44 }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.25 }}
              className="h-6"
              style={{ background: c, boxShadow: `inset 0 0 0 1px rgba(0,0,0,0.35)` }}
              title={c}
            />
          ))}
        </div>

        <div className="mt-6 text-[9px] tracking-[0.4em] uppercase max-w-lg" style={{ color: `${ink}88` }}>
          {round.material} · {round.typography}
        </div>
      </div>

      <MotifLayer agent={round.agent} accent={accent} />

      <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-3 py-2 text-[9px] tracking-[0.4em] uppercase"
        style={{ color: `${ink}77`, borderTop: `1px solid ${accent}33` }}
      >
        <span>fitness · {String(round.score).padStart(3, '0')}</span>
        <span style={{ color: `${accent}bb` }}>&mdash; {v.label.toLowerCase()} has the floor</span>
      </div>
    </motion.div>
  );
}

function MotifLayer({ agent, accent }: { agent: Agent; accent: string }) {
  if (agent === 'scifi') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60" viewBox="0 0 400 300">
        <g stroke={accent} strokeWidth="0.4" fill="none">
          {[40, 70, 100, 140, 185].map((r) => (
            <circle key={r} cx="80" cy="240" r={r} opacity={0.6} />
          ))}
          <line x1="0" y1="240" x2="400" y2="240" />
          <line x1="80" y1="0" x2="80" y2="300" strokeDasharray="2,4" />
          <rect x="320" y="30" width="60" height="14" />
          <rect x="320" y="50" width="42" height="6" />
          <rect x="320" y="62" width="52" height="6" />
        </g>
      </svg>
    );
  }
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-70" viewBox="0 0 400 300">
      <g stroke={accent} strokeWidth="0.5" fill="none">
        <path d="M60 280 L60 180 Q60 130 100 130 Q140 130 140 180 L140 280" />
        <path d="M260 280 L260 180 Q260 130 300 130 Q340 130 340 180 L340 280" />
        <circle cx="200" cy="140" r="32" />
        <path d="M200 108 L200 172 M168 140 L232 140 M176 118 L224 162 M224 118 L176 162" />
        <path d="M50 292 L350 292" strokeDasharray="1,3" />
      </g>
    </svg>
  );
}

type Props = { initial: Round[] };

export default function AgentBattle({ initial }: Props) {
  const [rounds, setRounds] = useState<Round[]>(initial);
  const [running, setRunning] = useState(true);
  const timerRef = useRef<number | null>(null);
  const latest = rounds[rounds.length - 1];
  const nextAgent: Agent = latest ? (latest.agent === 'scifi' ? 'goth' : 'scifi') : 'scifi';
  const scifiScore = useMemo(() => rounds.filter((r) => r.agent === 'scifi').length, [rounds]);
  const gothScore = useMemo(() => rounds.filter((r) => r.agent === 'goth').length, [rounds]);

  const step = useCallback(async () => {
    const prev = rounds[rounds.length - 1] ?? null;
    const agent: Agent = prev ? (prev.agent === 'scifi' ? 'goth' : 'scifi') : 'scifi';
    const next = generateRound(agent, prev, (prev?.round_number ?? 0) + 1);
    setRounds((rs) => [...rs.slice(-40), next]);
    try {
      await supabase.from('design_rounds').insert({
        round_number: next.round_number,
        agent: next.agent,
        title: next.title,
        palette: next.palette,
        motif: next.motif,
        material: next.material,
        typography: next.typography,
        critique: next.critique,
        score: next.score,
      });
    } catch {
      // silent — UI keeps running even if persistence fails
    }
  }, [rounds]);

  useEffect(() => {
    if (!running) return;
    timerRef.current = window.setTimeout(step, 3800);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [running, step]);

  const transcript = rounds.slice(-10).reverse();
  const maxScore = useMemo(() => Math.max(0, ...rounds.map((r) => r.score)), [rounds]);

  return (
    <section id="design-box" className="relative bg-black border-y border-white/5 py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex items-end justify-between mb-8 gap-6">
          <div>
            <div className="text-[10px] tracking-[0.5em] uppercase text-[#7a6e62] mb-2">
              — design·box · two agents, one frame
            </div>
            <h2 className="text-4xl md:text-5xl font-mono font-light tracking-tight text-white">
              the <span className="text-[#5ec8d8]">archivists</span> are <span className="text-[#c14a5b]">arguing</span>
            </h2>
            <p className="text-[12px] tracking-[0.3em] uppercase text-[#6b6660] mt-3 max-w-xl">
              autonomous. turn-based. every proposal is appended to the ledger.
            </p>
          </div>
          <button
            onClick={() => setRunning((r) => !r)}
            className="shrink-0 flex items-center gap-2 px-4 py-2 text-[10px] tracking-[0.4em] uppercase border border-white/20 hover:border-white/60 transition-colors"
          >
            {running ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {running ? 'pause battle' : 'resume battle'}
          </button>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr_320px] gap-5">
          <div className="space-y-3">
            <AgentBadge agent="scifi" active={nextAgent === 'goth'} score={scifiScore} />
            <AgentBadge agent="goth" active={nextAgent === 'scifi'} score={gothScore} />
            <div className="mt-4 border border-white/10 bg-black/50 p-3">
              <div className="text-[9px] tracking-[0.4em] uppercase text-[#7a6e62] mb-2">current proposal</div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-white/80 leading-relaxed space-y-1">
                <div><span className="text-[#7a6e62]">motif · </span>{latest?.motif ?? '—'}</div>
                <div><span className="text-[#7a6e62]">material · </span>{latest?.material ?? '—'}</div>
                <div><span className="text-[#7a6e62]">type · </span>{latest?.typography ?? '—'}</div>
              </div>
            </div>
            {latest && (
              <div className="border-l-2 pl-3 py-2" style={{ borderColor: VOCAB[latest.agent].accent }}>
                <div className="text-[9px] tracking-[0.4em] uppercase mb-1" style={{ color: VOCAB[latest.agent].accent }}>
                  {VOCAB[latest.agent].label} said
                </div>
                <div className="text-[12px] text-white/80 italic leading-relaxed">
                  &ldquo;{latest.critique}&rdquo;
                </div>
              </div>
            )}
          </div>

          <div>
            <AnimatePresence mode="wait">
              {latest && <DesignBoard round={latest} />}
            </AnimatePresence>
          </div>

          <div className="border border-white/10 bg-black/50 p-3 max-h-[560px] overflow-hidden">
            <div className="text-[9px] tracking-[0.4em] uppercase text-[#7a6e62] mb-3">ledger · last 10</div>
            <ul className="space-y-2">
              {transcript.map((r) => {
                const v = VOCAB[r.agent];
                const isTop = r.score === maxScore && maxScore > 0;
                return (
                  <motion.li
                    key={`${r.round_number}-${r.title}`}
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[11px] leading-relaxed border-l-2 pl-2"
                    style={{
                      borderColor: isTop ? '#e7b766' : v.accent,
                      background: isTop ? 'rgba(231,183,102,0.06)' : undefined,
                    }}
                  >
                    <div className="flex items-center gap-2 text-[9px] tracking-[0.4em] uppercase">
                      <span style={{ color: isTop ? '#e7b766' : v.accent }}>{v.glyph}</span>
                      <span className="text-[#7a6e62]">#{String(r.round_number).padStart(3, '0')}</span>
                      {isTop && <span className="text-[#e7b766]">· top</span>}
                    </div>
                    <div className="text-white/85 truncate">{r.title}</div>
                    <div className="text-[#7a6e62] truncate italic">&ldquo;{r.critique}&rdquo;</div>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

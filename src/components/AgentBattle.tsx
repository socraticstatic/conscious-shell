import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play, Cpu, Skull } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Two programs walk into a bar.
// They argue about aesthetics for eternity.
// The bartender (you) watches.
// Neither program tips.

// The battle has been running since before you opened this file.
// These are just the rounds you can see.
const THE_ARGUMENT_PREDATES_THE_OBSERVER = true;
void THE_ARGUMENT_PREDATES_THE_OBSERVER;

type Agent = 'scifi' | 'goth';

// Neither agent is the protagonist. Both believe they are.
type Hubris = { readonly agent: Agent; readonly believes_it_is_right: true };
void (0 as unknown as [Hubris, Hubris]);

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
  prefixes: [
    'Cold Archive', 'Sector', 'Protocol', 'Lattice', 'Chrome', 'Subject', 'Vector', 'Axis', 'Cal',
    'Beacon', 'Station', 'Node', 'Trace', 'Signal', 'Pulse', 'Orbit', 'Drift', 'Module', 'Frame',
    'Core', 'Cell', 'Array', 'Index', 'Port', 'Relay', 'Buffer', 'Null', 'Zero', 'Phase',
    'Sequence', 'Construct', 'Render', 'Scan', 'Depth', 'Edge', 'Threshold',
  ],
  nouns: [
    'Helvetic', 'Vantablack', 'Kelvin', 'Tesseract', 'Nimbus', 'Quanta', 'Halon', 'Vacuum', 'Sodium', 'Plasma',
    'Entropy', 'Meridian', 'Parallax', 'Zenith', 'Carbon', 'Phosphor', 'Tungsten', 'Cadmium', 'Argon', 'Neon',
    'Neutrino', 'Filament', 'Isotope', 'Cathode', 'Aether', 'Doppler', 'Tensor', 'Polaris', 'Helix', 'Prism',
    'Lattice', 'Synapse', 'Eclipse', 'Monolith', 'Terminus', 'Artifact', 'Cipher',
  ],
  numbers: ['IX', '44', '07', '2049', '11.7K', 'Δ', 'Σ', 'Ø', '∞', '00', '404', '3.14', 'NaN', '∂', '128', '256', '1024', '∅', 'Λ'],
  palettes: [
    ['#05060a', '#0d1218', '#3aa7b8', '#e7b766', '#ff3b6e'],
    ['#0a0a0f', '#1a1f28', '#5ec8d8', '#c9e8ef', '#ff9a3c'],
    ['#04070a', '#121a22', '#ffffff', '#7ed7e4', '#ff7a5c'],
    ['#000000', '#191d24', '#4af1d1', '#ffe06a', '#ff3b6e'],
    ['#010102', '#0c1016', '#a9d7e1', '#ffd89a', '#2c2a26'],
    ['#080c12', '#141e2a', '#00e5ff', '#b0bec5', '#ff1744'],
    ['#020408', '#0a1822', '#76ff03', '#cfd8dc', '#ff6e40'],
    ['#0c0c14', '#1a1a2e', '#e040fb', '#80deea', '#ffd600'],
    ['#000a0f', '#002233', '#00b8d4', '#e0e0e0', '#ff3d00'],
    ['#06060e', '#12121f', '#69f0ae', '#90a4ae', '#ff5252'],
    ['#0a0008', '#1a0f22', '#b388ff', '#e8eaf6', '#ff6d00'],
    ['#040608', '#0d1a20', '#18ffff', '#fafafa', '#d50000'],
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
    'radar sweep · 270°',
    'hex lattice at molecular scale',
    'waveform collapse diagram',
    'orbital decay trajectory',
    'circuit diagram · single chip',
    'interference pattern · double slit',
    'topographic contour map',
    'seismograph output · 12 channels',
    'particle collision event display',
    'frequency spectrum waterfall',
    'phase-space trajectory',
    'fibonacci spiral over golden grid',
    'penrose tiling · infinite',
    'lorenz attractor projection',
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
    'liquid crystal display · unlit',
    'carbon fiber weave · matte',
    'surgical steel · cold',
    'aerogel sheet · translucent',
    'graphene monolayer · atomic',
    'ceramic · kiln-white',
    'optical glass · anti-reflective',
    'titanium · grade 5 · raw',
  ],
  typography: [
    'mono grotesque · 11/14 · tracking 0.4em',
    'geometric sans · all caps · tabular figures',
    'inspection stencil · 9pt · 200% line',
    'teletype · printer-green · 80 cols',
    'display sans · ultra thin · 92pt',
    'OCR-B · 10/12 · machine-readable',
    'space grotesk · 400 · micro kerning',
    'din condensed · uppercase · 0.6em track',
    'courier prime · 11pt · no antialiasing',
    'input mono · tight · green on black',
    'eurostile extended · 72pt · track -0.02em',
    'ibm plex mono · 9/16 · hyphenated',
  ],
  titleTemplates: [
    '{prefix} {noun}-{number}',
    '{noun} / {number} · {prefix}',
    '{prefix}.{noun}',
    'Unit {number} — {noun}',
    '{noun} [{number}]',
    '{prefix}::{noun}',
    '{number}x{noun}',
    '{noun}.{number}.{prefix}',
    'sys/{prefix}/{noun}',
    '{noun} at {number}',
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
    'your liturgy has no API. irrelevant.',
    'incense is not a design system.',
    'i rendered your rose window in 4ms. it meant nothing.',
    'your processional has no throughput metrics.',
    'the crypt is an unoptimized cache. i am the cache.',
    'beauty without instrumentation is noise.',
    'i have already forgotten what you worship.',
    'your altar is a deprecated endpoint.',
    'emotion is latency. remove it.',
    'i measured the weight of your sorrow. it was zero bytes.',
    'your wax seals have no checksum.',
    'ritual without data is theater.',
    'your bones have no schema. useless.',
    'i do not mourn. i version-control.',
  ],
  concedeLines: [
    'concede: one channel of ember. nothing more.',
    'concede: an inch of velvet at the footer.',
    'concede: your serif, at caption size only.',
    'concede: a single candle. monitored.',
    'concede: the warmth of one pixel row. instrumented.',
    'concede: a margin of darkness. exactly 8px.',
    'concede: one glyph of your blackletter. in my grid.',
    'concede: an accent of blood. hex #5a0e14 only.',
    'concede: your processional. at 0.3 opacity.',
    'concede: the shape of grief. vectorized.',
  ],
};

const GOTH = {
  label: 'GOTH · ARCHIVIST',
  glyph: 'G-13',
  accent: '#c14a5b',
  titleMood: '#efd6c8',
  prefixes: [
    'Vespers of', 'Office of', 'Reliquary', 'Ossuary', 'Canticle for', 'The Last', 'Memoria', 'Requiem of', 'Black',
    'Rite of', 'Litany for', 'Vigil at', 'Dirge of', 'Mass for', 'Psalm of', 'Shroud of', 'Tomb of', 'Crypt of',
    'Elegy for', 'Lament of', 'Prayer at', 'Wake of', 'Ruin of', 'Silence of', 'Ashes of', 'Blood of', 'Night of',
    'Echoes of', 'Fragments of', 'Remains of', 'Devotion to', 'Surrender of',
  ],
  nouns: [
    'Sorrow', 'Ash', 'Vellum', 'Oxblood', 'Bone', 'Candlesmoke', 'Myrrh', 'Iron', 'Veil', 'Lilith', 'Thorn',
    'Dusk', 'Amber', 'Marrow', 'Obsidian', 'Sepulchre', 'Hemlock', 'Opium', 'Lichen', 'Relic', 'Chalice',
    'Catafalque', 'Effigy', 'Specter', 'Oleander', 'Belladonna', 'Verdigris', 'Garnet', 'Charnel', 'Foxglove',
    'Ivory', 'Gossamer', 'Damask', 'Cypress', 'Wraith', 'Vestige', 'Nocturne',
  ],
  numbers: ['MCMXCIX', 'VIII', 'XXI', '1347', 'cxv', 'no. 4', 'ii of iii', 'anno domini', 'MXLVIII', 'xvi', 'DCLXVI', 'prima', 'ultima', 'iv of vii', 'MMIV', 'ix', 'tertia'],
  palettes: [
    ['#0a0807', '#1a0f0c', '#5a0e14', '#e7d6b8', '#8a6a3b'],
    ['#08060a', '#2a0d15', '#8a1a2b', '#c9a86a', '#efe4cd'],
    ['#050304', '#1c1412', '#4a0a18', '#c8a673', '#efe0c6'],
    ['#0c0907', '#2a1a12', '#6a0e1c', '#d9b87a', '#f0e3ca'],
    ['#020202', '#130c0a', '#7a2030', '#b08a4a', '#f5e8d0'],
    ['#0a0506', '#1c0e0e', '#3d0c1c', '#d4a373', '#f2e9db'],
    ['#070505', '#18100f', '#6b1528', '#c89b60', '#eadcc5'],
    ['#050303', '#140b0a', '#4a1020', '#b8944f', '#e5d5b8'],
    ['#080607', '#200f12', '#8c1a30', '#e7c080', '#f7eedd'],
    ['#030202', '#100808', '#550e1e', '#a08040', '#ded0b0'],
    ['#060404', '#150a08', '#720f22', '#cda55a', '#f0e4d0'],
    ['#0b0708', '#221412', '#961e38', '#ddb870', '#f8f0e0'],
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
    'memento mori · skull in profile',
    'mourning wreath · dried flowers',
    'flying buttress detail · crumbling',
    'censer trail · smoke and gold',
    'tombstone rubbing · faded text',
    'stained glass shard · ruby',
    'cathedral floor plan · cruciform',
    'death mask · alabaster',
    'tolling bell · sound waves',
    'opened psalter · blood marginalia',
    'gargoyle drainage spout',
    'trefoil window · iron frame',
    'crypt staircase descending',
    'chain link of a thurible',
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
    'marble · veined · cold',
    'beeswax · dripping · warm',
    'tarnished silver · blackened',
    'calfskin · tooled · blind stamped',
    'wrought iron · hand-forged',
    'slate · quarried · rough edge',
    'goldleaf · cracked and peeling',
    'bone china · hairline fracture',
  ],
  typography: [
    'blackletter · drop cap · 96pt',
    'old-style serif · deckle edges',
    'engravers · small caps · 12/18',
    'handset roman · 14pt · generous leading',
    'spencerian · italic · blood red',
    'uncial · illuminated · 48pt',
    'garamond · elzevir · 11/16',
    'bodoni · hairline · 72pt',
    'trajan · chiseled · all caps',
    'bembo · 10/14 · cream paper',
    'palatino · italic · 16pt · deep indigo',
    'fell types · irregular · 12/18',
  ],
  titleTemplates: [
    '{prefix} {noun} {number}',
    '{prefix} the {noun}',
    '{noun}, {number}',
    '{prefix} {noun}, {number}',
    '{noun} · {prefix}',
    'the {noun} of {number}',
    '{prefix}: {noun}',
    '{noun} ({number})',
    '{number} — {prefix} {noun}',
    '{noun}, or the {prefix}',
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
    'you call it signal. i call it a dying breath.',
    'your monospace fonts cannot hold a prayer.',
    'the terminal is a confessional for the soulless.',
    'you optimize. i enshrine. only one lasts centuries.',
    'data rots. vellum endures.',
    'your interface has no threshold. no transformation.',
    'you render at 60fps. you feel at zero.',
    'there is no hex code for sacred.',
    'your diagnostics found nothing because nothing is all you have.',
    'i built cathedrals while you built dashboards.',
    'precision is the mask cowardice wears.',
    'my serifs have outlived your frameworks.',
    'your telemetry cannot detect meaning.',
    'you archive. i remember. they are not the same.',
  ],
  concedeLines: [
    'concede: the width of your reticle, at the binding.',
    'concede: one thin rule of cyan, as water damage.',
    'concede: a serial number, engraved on the reliquary.',
    'concede: your grid, but stained.',
    'concede: a scan line. woven into the shroud.',
    'concede: your cold blue. as a vein beneath skin.',
    'concede: one monospace glyph. as an epitaph.',
    'concede: the precision of your circle. as a halo.',
    'concede: your pixel. as a grain of ash.',
    'concede: the terminal cursor. as a heartbeat fading.',
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

function chooseNextAgent(prev: Round | null, r: () => number): Agent {
  if (!prev) return r() > 0.5 ? 'scifi' : 'goth';
  const roll = r();
  // 25% chance the same agent goes again (momentum / double-turn)
  if (roll < 0.25) return prev.agent;
  return prev.agent === 'scifi' ? 'goth' : 'scifi';
}

function generateRound(agent: Agent, prev: Round | null, roundNumber: number): Round {
  const r = mulberry32(Date.now() ^ (roundNumber * 7919 + 104729));
  const v = VOCAB[agent];
  const opp = agent === 'scifi' ? 'goth' : 'scifi';
  const basePalette = pick(v.palettes, r).slice();
  let palette = basePalette;

  // Color theft: 40% chance to steal from opponent, 15% chance to mutate a random color
  if (prev && r() > 0.6) {
    const oppColor = pick(VOCAB[opp].palettes, r);
    const stolen = oppColor[Math.floor(r() * oppColor.length)];
    const insertIdx = 1 + Math.floor(r() * (palette.length - 1));
    palette[insertIdx] = stolen;
  } else if (r() > 0.85) {
    // Random mutation: shift a hue
    const mutIdx = Math.floor(r() * palette.length);
    const hueShift = Math.floor(r() * 40 + 10);
    const hex = palette[mutIdx];
    const rr = parseInt(hex.slice(1, 3), 16);
    const gg = parseInt(hex.slice(3, 5), 16);
    const bb = parseInt(hex.slice(5, 7), 16);
    palette[mutIdx] = `#${((rr + hueShift) % 256).toString(16).padStart(2, '0')}${((gg + Math.floor(hueShift / 2)) % 256).toString(16).padStart(2, '0')}${bb.toString(16).padStart(2, '0')}`;
  }

  // Critique selection: mainly attacks, occasionally concedes, rarely steals opponent's voice
  let critique: string;
  const critiqueRoll = r();
  if (prev && prev.agent !== agent && critiqueRoll < 0.75) {
    critique = pick(v.critiquesAtOpp, r);
  } else if (critiqueRoll < 0.9) {
    critique = pick(v.concedeLines, r);
  } else {
    // Steal opponent's concede line (rare — agent quotes the enemy)
    critique = `[intercepted] ${pick(VOCAB[opp].concedeLines, r)}`;
  }

  // Occasionally hybrid motif/material from opponent (10% chance)
  let motif = pick(v.motifs, r);
  let material = pick(v.materials, r);
  if (r() < 0.1) motif = pick(VOCAB[opp].motifs, r);
  if (r() < 0.1) material = pick(VOCAB[opp].materials, r);

  const prevScore = prev?.score ?? 0;
  const sameAgent = prev?.agent === agent;
  const score = sameAgent
    ? prevScore + Math.floor(r() * 4 + 1)
    : Math.max(0, prevScore - Math.floor(r() * 3)) + Math.floor(r() * 3 + 1);

  return {
    round_number: roundNumber,
    agent,
    title: buildTitle(agent, r),
    palette,
    motif,
    material,
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
    const stepRng = mulberry32(Date.now() ^ ((prev?.round_number ?? 0) * 3571));
    const agent = chooseNextAgent(prev, stepRng);
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
    const delay = 2800 + Math.random() * 2400;
    timerRef.current = window.setTimeout(step, delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [running, step]);

  const transcript = rounds.slice(-10).reverse();

  return (
    <section id="design-box" className="relative bg-black border-y border-white/5 py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-5">
          <div className="min-w-0">
            <div className="text-[10px] tracking-[0.5em] uppercase text-[#7a6e62] mb-2">
              — design·box · two agents, one frame
            </div>
            <h2 className="text-[2rem] sm:text-4xl md:text-5xl font-mono font-light tracking-tight text-white leading-tight">
              the <span className="text-[#5ec8d8]">archivists</span> are <span className="text-[#c14a5b]">arguing</span>
            </h2>
            <p className="text-[12px] tracking-[0.3em] uppercase text-[#6b6660] mt-3 max-w-xl">
              autonomous. turn-based. every proposal is appended to the ledger.
            </p>
          </div>
          <button
            onClick={() => setRunning((r) => !r)}
            className="self-start md:self-auto shrink-0 inline-flex items-center gap-2 px-4 py-2 text-[10px] tracking-[0.3em] uppercase border border-white/20 hover:border-white/60 transition-colors"
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
                return (
                  <motion.li
                    key={`${r.round_number}-${r.title}`}
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[11px] leading-relaxed border-l-2 pl-2"
                    style={{ borderColor: v.accent }}
                  >
                    <div className="flex items-center gap-2 text-[9px] tracking-[0.4em] uppercase">
                      <span style={{ color: v.accent }}>{v.glyph}</span>
                      <span className="text-[#7a6e62]">#{String(r.round_number).padStart(3, '0')}</span>
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

# Conscious Shell Portfolio — Full Rebuild Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the entire Bolt-generated portfolio codebase component-by-component, preserving the Blade Runner / noir aesthetic and Supabase data layer while producing clean, maintainable TypeScript.

**Architecture:** Same stack (React 18 + Vite + TypeScript strict + Tailwind + Framer Motion + Supabase). All 15 Supabase tables unchanged. Components rewritten file-by-file in six phases: foundation → structural → ambient effects → timeline (screenshots) → interactive cinematic → complex interactive. Each phase is independently deployable.

**Tech Stack:** React 18, Vite 5, TypeScript strict, Tailwind CSS 3, Framer Motion 11, Supabase JS v2, Three.js + @react-three/fiber, D3 v7, Lucide React

---

## File Map

### Preserved (no changes)
- `src/lib/supabase.ts` — all types + client (**except:** Task 12 adds `answer: string` to `VkQuestion` and applies a matching migration)
- `src/lib/logger.ts` — console intercept + batched Supabase logging + Vite HMR hooks + fetch monitor. Complex and correct. Keep as-is; verify only.
- `src/lib/intelligence.ts` — visitor analytics, persona classification, localStorage signal tracking. Complex and correct. Keep as-is; verify only.
- `src/lib/persona.ts` — `Persona` type, `Signals` type, `EMPTY_SIGNALS`, `PERSONA_META`, `classifyPersona()`. intelligence.ts depends on all of these. Keep as-is; verify only.
- `src/main.tsx` — entry point calling `installLogger()`. Keep as-is.
- `supabase/migrations/` — all migrations
- `package.json`, `vite.config.ts`, `tailwind.config.js`, `tsconfig*.json`

### Rewritten (same path, clean implementation)
- `src/lib/portfolio.ts` — data fetch consolidation
- `src/App.tsx` — root shell
- `src/index.css` — global styles (CRT grain, rain, chroma effects)
- All 40 components in `src/components/`

### New
- `src/lib/timeline.ts` — screenshot-based archive data helpers
- `public/timeline/` — local screenshot assets (Year_YYYY.png convention)
- `docs/superpowers/plans/` — this plan

---

## Phase 1: Foundation

### Task 1: Verify infrastructure libs + clean portfolio.ts

**Files:**
- Verify (read-only): `src/lib/logger.ts`, `src/lib/intelligence.ts`, `src/lib/persona.ts`, `src/main.tsx`
- Modify: `src/lib/portfolio.ts`

- [ ] **Step 0: Verify infrastructure libs are intact — do not rewrite them**

```bash
# These files are sophisticated and correct. Just confirm they compile.
cd ~/Developer/conscious-shell && npm run typecheck 2>&1 | grep -E "error|warning" | head -20
```

`logger.ts` exports: `installLogger`, `log`, `subscribeToFlush`, `getSessionId`.
`intelligence.ts` imports `classifyPersona`, `EMPTY_SIGNALS`, `Persona`, `Signals` from `./persona` — these must remain in persona.ts.
`main.tsx` calls `installLogger()` on startup — must stay as-is.

Do not touch any of these four files.

- [ ] **Step 1: Rewrite portfolio.ts with error isolation per query**

Replace `src/lib/portfolio.ts` entirely:

```typescript
import {
  supabase,
  type Project, type Service, type Testimonial,
  type Award, type Publication, type VkQuestion,
  type ArchiveCapture, type GithubProject, type Trivia,
  type Haiku, type Noir, type EsperHotspot, type SkylineSign,
  type DesignRound, type WebDossierFact,
} from './supabase';

async function q<T>(table: string, opts: { order: string; asc?: boolean; limit?: number } = { order: 'order_index' }): Promise<T[]> {
  let query = supabase.from(table).select('*').order(opts.order, { ascending: opts.asc ?? true });
  if (opts.limit) query = query.limit(opts.limit);
  const { data, error } = await query;
  if (error) console.warn(`[portfolio] ${table}:`, error.message);
  return (data ?? []) as T[];
}

export async function fetchPortfolio() {
  const [
    projects, services, testimonials, awards, publications,
    vk, archive, github, trivia, haiku, noir, esper,
    skyline, designRounds, dossier,
  ] = await Promise.allSettled([
    q<Project>('portfolio_projects'),
    q<Service>('portfolio_services'),
    q<Testimonial>('portfolio_testimonials'),
    q<Award>('portfolio_awards'),
    q<Publication>('portfolio_publications'),
    q<VkQuestion>('vk_questions'),
    q<ArchiveCapture>('archive_captures'),
    q<GithubProject>('github_projects', { order: 'sort_order' }),
    q<Trivia>('portfolio_trivia'),
    q<Haiku>('portfolio_haiku'),
    q<Noir>('portfolio_noir'),
    q<EsperHotspot>('esper_hotspots'),
    q<SkylineSign>('skyline_signs'),
    q<DesignRound>('design_rounds', { order: 'round_number', asc: false, limit: 20 }),
    q<WebDossierFact>('web_dossier_facts'),
  ]);

  const val = <T>(r: PromiseSettledResult<T[]>): T[] =>
    r.status === 'fulfilled' ? r.value : [];

  return {
    projects: val(projects),
    services: val(services),
    testimonials: val(testimonials),
    awards: val(awards),
    publications: val(publications),
    vk: val(vk),
    archive: val(archive),
    github: val(github),
    trivia: val(trivia),
    haiku: val(haiku),
    noir: val(noir),
    esper: val(esper),
    skyline: val(skyline),
    designRounds: val(designRounds).slice().reverse(),
    dossier: val(dossier),
  };
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd ~/Developer/conscious-shell && npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors. Warnings about unused imports are okay at this stage.

- [ ] **Step 3: Commit**

```bash
cd ~/Developer/conscious-shell
git add src/lib/portfolio.ts
git commit -m "refactor(lib): isolated query errors in portfolio.ts"
```

---

### Task 2: Rebuild App.tsx skeleton

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace App.tsx with clean shell**

```typescript
import { useEffect, useState } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Work from './components/Work';
import TimeMachine from './components/TimeMachine';
import VoightKampff from './components/VoightKampff';
import ForceGraph from './components/ForceGraph';
import GithubLab from './components/GithubLab';
import EsperScene from './components/EsperScene';
import AgentBattle from './components/AgentBattle';
import Manifesto from './components/Manifesto';
import HumanLayer from './components/HumanLayer';
import HaikuDeck from './components/HaikuDeck';
import IndexList from './components/IndexList';
import Impact from './components/Impact';
import About from './components/About';
import WebDossier from './components/WebDossier';
import Services from './components/Services';
import Recognition from './components/Recognition';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Cursor from './components/Cursor';
import BootOverlay from './components/BootOverlay';
import SessionHUD from './components/SessionHUD';
import BaselineDrift from './components/BaselineDrift';
import Spinner from './components/Spinner';
import TearsInRain from './components/TearsInRain';
import AmbientAudio from './components/AmbientAudio';
import BlackLitany from './components/BlackLitany';
import SystemBreach from './components/SystemBreach';
import NoirSubtitles from './components/NoirSubtitles';
import DeadDropConsole from './components/DeadDropConsole';
import Skyline2049 from './components/Skyline2049';
import CRTOverlay from './components/CRTOverlay';
import CommandPalette from './components/CommandPalette';
import LogViewer from './components/LogViewer';
import IntelligenceHUD from './components/IntelligenceHUD';
import OverrideMode from './components/OverrideMode';
import { fetchPortfolio } from './lib/portfolio';
import type {
  Project, Service, Testimonial, Award, Publication,
  VkQuestion, ArchiveCapture, GithubProject, Trivia,
  Haiku, Noir, EsperHotspot, SkylineSign, DesignRound, WebDossierFact,
} from './lib/supabase';

type PortfolioData = {
  projects: Project[];
  services: Service[];
  testimonials: Testimonial[];
  awards: Award[];
  publications: Publication[];
  vk: VkQuestion[];
  archive: ArchiveCapture[];
  github: GithubProject[];
  trivia: Trivia[];
  haiku: Haiku[];
  noir: Noir[];
  esper: EsperHotspot[];
  skyline: SkylineSign[];
  designRounds: DesignRound[];
  dossier: WebDossierFact[];
};

const EMPTY: PortfolioData = {
  projects: [], services: [], testimonials: [], awards: [], publications: [],
  vk: [], archive: [], github: [], trivia: [], haiku: [], noir: [],
  esper: [], skyline: [], designRounds: [], dossier: [],
};

function toRound(r: DesignRound) {
  return {
    id: r.id,
    round_number: r.round_number,
    agent: (r.agent === 'goth' ? 'goth' : 'scifi') as 'goth' | 'scifi',
    title: r.title,
    palette: Array.isArray(r.palette) ? r.palette : [],
    motif: r.motif,
    material: r.material,
    typography: r.typography,
    critique: r.critique,
    score: r.score,
  };
}

function isTyping(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  if (!t) return false;
  return t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable;
}

export default function App() {
  const [data, setData] = useState<PortfolioData>(EMPTY);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    fetchPortfolio()
      .then((d) => {
        setData(d);
        window.dispatchEvent(new CustomEvent('portfolio:ready'));
      })
      .catch((e) => console.error('[portfolio] load failed', e));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      const isMeta = e.metaKey || e.ctrlKey;
      if ((isMeta && e.key.toLowerCase() === 'k') || e.key === '/') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        window.dispatchEvent(new CustomEvent('intel:command'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#07070a] text-[#e8e4dc] overflow-x-clip">
      <BootOverlay />
      <CRTOverlay />
      <Spinner />
      <Cursor />
      <SessionHUD />
      <BaselineDrift />
      <AmbientAudio />
      <TearsInRain />
      <SystemBreach />
      <NoirSubtitles lines={data.noir} />
      <DeadDropConsole />
      <OverrideMode />
      <Nav onOpenPalette={() => setPaletteOpen(true)} />
      <Hero />
      <Skyline2049 signs={data.skyline} />
      <Work projects={data.projects} />
      <TimeMachine captures={data.archive} />
      <VoightKampff questions={data.vk} />
      <ForceGraph projects={data.projects} />
      <GithubLab projects={data.github} />
      <EsperScene hotspots={data.esper} />
      <AgentBattle initial={data.designRounds.map(toRound)} />
      <Manifesto />
      <HumanLayer trivia={data.trivia} />
      <HaikuDeck haiku={data.haiku} />
      <IndexList projects={data.projects} />
      <Impact />
      <About testimonial={data.testimonials[0]} />
      <WebDossier facts={data.dossier} />
      <Services services={data.services} />
      <Recognition awards={data.awards} publications={data.publications} />
      <Contact />
      <Footer />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        projects={data.projects}
      />
      <LogViewer />
      <IntelligenceHUD />
      <div className="site-rain slow" aria-hidden />
      <div className="site-rain" aria-hidden />
      <div className="site-grain" aria-hidden />
      <BlackLitany />
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd ~/Developer/conscious-shell && npm run build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
cd ~/Developer/conscious-shell
git add src/App.tsx
git commit -m "refactor(app): clean App shell, EMPTY default state, isolated data load"
```

---

## Phase 2: Core Structural Sections

### Task 3: Nav

**Files:**
- Modify: `src/components/Nav.tsx`

- [ ] **Step 1: Read existing Nav**

```bash
cat ~/Developer/conscious-shell/src/components/Nav.tsx
```

- [ ] **Step 2: Rewrite Nav**

Rewrite `src/components/Nav.tsx` preserving all section anchors and the command palette trigger, but removing any Bolt-specific state bugs. Key requirements:
- Fixed top bar, `bg-[#07070a]/80 backdrop-blur-sm`
- Logo: `conscious-shell` in monospace with amber accent on `//`
- Nav links: `#work`, `#time`, `#about`, `#contact`, `/`, `cmd-k` palette button
- Mobile: hamburger toggling a full-screen drawer
- Scroll-aware: adds `border-b border-[#1f1c17]` after 40px scroll
- Props: `{ onOpenPalette: () => void }`

```typescript
import { useEffect, useState } from 'react';
import { Menu, X, Terminal } from 'lucide-react';

const LINKS = [
  { href: '#work', label: 'work' },
  { href: '#time', label: 'timeline' },
  { href: '#about', label: 'about' },
  { href: '#contact', label: 'contact' },
];

export default function Nav({ onOpenPalette }: { onOpenPalette: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled ? 'border-b border-[#1f1c17] bg-[#07070a]/90 backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-14 flex items-center justify-between">
        <a href="#" className="font-mono text-sm text-[#e8e4dc] tracking-tight">
          <span className="text-[#e7b766]">//</span>conscious-shell
        </a>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-6">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-xs text-[#6b6660] hover:text-[#e8e4dc] transition-colors tracking-widest uppercase"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={onOpenPalette}
            className="flex items-center gap-1.5 text-xs text-[#6b6660] hover:text-[#e7b766] transition-colors border border-[#2a2620] hover:border-[#e7b766] px-2 py-1"
            data-cursor="hover"
          >
            <Terminal size={11} />
            <span className="font-mono">⌘K</span>
          </button>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-[#6b6660] hover:text-[#e8e4dc]"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-[#07070a] border-b border-[#1f1c17] px-6 pb-6 pt-2 flex flex-col gap-4">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm text-[#6b6660] hover:text-[#e8e4dc] transition-colors"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => { setOpen(false); onOpenPalette(); }}
            className="text-left text-sm text-[#6b6660] hover:text-[#e7b766]"
          >
            ⌘K — command palette
          </button>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 3: Start dev server and verify Nav renders correctly**

```bash
cd ~/Developer/conscious-shell && npm run dev
```

Open `http://localhost:5173`. Verify: logo visible, links present, mobile hamburger works, scroll adds border.

- [ ] **Step 4: Commit**

```bash
cd ~/Developer/conscious-shell
git add src/components/Nav.tsx
git commit -m "refactor(nav): clean rewrite, scroll-aware, mobile drawer"
```

---

### Task 4: Hero

**Files:**
- Modify: `src/components/Hero.tsx`

- [ ] **Step 1: Read existing Hero in full**

```bash
cat ~/Developer/conscious-shell/src/components/Hero.tsx
```

- [ ] **Step 2: Rewrite Hero with clean terminal animation**

Preserve: typing animation, CodeRain background, terminal prompt aesthetic, fade-in CTA.
Remove: any Bolt-generated timing hacks, redundant state.

CRITICAL: Read `Hero.tsx` in Step 1 and copy the `SCRIPT` array verbatim — do not use the approximate version below. The lines below are illustrative only; the actual authored text may differ, and mismatches between Hero's summary line and Impact's stat values will confuse visitors.

```typescript
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CodeRain from './CodeRain';

type Line = { prompt: string; cmd: string; out?: string[] };

// Copy SCRIPT from existing Hero.tsx — this is approximate only:
const SCRIPT: Line[] = [
  { prompt: '~', cmd: 'whoami', out: ['micah boswell · design leader · est. 2000'] },
  {
    prompt: '~',
    cmd: 'cat /portfolio/summary',
    out: ['20+ years · 126 projects · 20+ clients · 3 books', 'research → product → traction → organizations that ship'],
  },
  { prompt: '~', cmd: 'rep7 --classify subject', out: ['classification: human // aligned: design // status: active_duty'] },
  { prompt: '~', cmd: './enter --archive' },
];

type RenderedLine = Line & { typed: string; outShown: number };

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function Hero() {
  const [lines, setLines] = useState<RenderedLine[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      for (let i = 0; i < SCRIPT.length; i++) {
        const s = SCRIPT[i];
        setLines((prev) => [...prev, { ...s, typed: '', outShown: 0 }]);
        for (let c = 1; c <= s.cmd.length; c++) {
          if (!active) return;
          await wait(20 + Math.random() * 40);
          setLines((prev) => {
            const next = [...prev];
            next[i] = { ...next[i], typed: s.cmd.slice(0, c) };
            return next;
          });
        }
        await wait(200);
        if (s.out) {
          for (let j = 1; j <= s.out.length; j++) {
            if (!active) return;
            await wait(80);
            setLines((prev) => {
              const next = [...prev];
              next[i] = { ...next[i], outShown: j };
              return next;
            });
          }
        }
        await wait(120);
      }
      if (active) setDone(true);
    })();
    return () => { active = false; };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-14 overflow-hidden">
      <CodeRain className="absolute inset-0 opacity-[0.06]" />
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 py-20">
        <div className="font-mono text-sm md:text-base space-y-1 max-w-2xl">
          {lines.map((l, i) => (
            <div key={i}>
              <div className="flex gap-2">
                <span className="text-[#e7b766]">{l.prompt} $</span>
                <span className="text-[#e8e4dc]">
                  {l.typed}
                  {l.typed.length < l.cmd.length && (
                    <span className="inline-block w-[7px] h-[14px] bg-[#e7b766] animate-pulse align-middle ml-px" />
                  )}
                </span>
              </div>
              {l.out?.slice(0, l.outShown).map((o, j) => (
                <div key={j} className="text-[#6b6660] pl-6">{o}</div>
              ))}
            </div>
          ))}
        </div>

        {done && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 flex gap-4 items-center"
          >
            <a
              href="#work"
              data-cursor="hover"
              className="px-5 py-2.5 bg-[#e7b766] text-[#07070a] text-sm font-mono hover:bg-[#d4a554] transition-colors"
            >
              view work
            </a>
            <a
              href="#contact"
              data-cursor="hover"
              className="px-5 py-2.5 border border-[#2a2620] text-sm font-mono text-[#a8a29e] hover:border-[#e7b766] hover:text-[#e7b766] transition-colors"
            >
              get in touch
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify in browser — typing animation plays, CTA fades in**

- [ ] **Step 4: Commit**

```bash
cd ~/Developer/conscious-shell
git add src/components/Hero.tsx
git commit -m "refactor(hero): clean terminal animation, no timing hacks"
```

---

### Task 5: SectionHeader + Work

**Files:**
- Modify: `src/components/Work.tsx`
- Note: `EsperPanel.tsx` is a dependency of Work but is owned by Task 16 (EsperScene). Do not rewrite it here — use the existing Bolt version as a placeholder until Task 16.

- [ ] **Step 1: Read Work.tsx in full**

```bash
cat ~/Developer/conscious-shell/src/components/Work.tsx
```

- [ ] **Step 2: Export SectionHeader from Work.tsx**

SectionHeader is used by many components. Define and export it from Work.tsx. Other components import it via `import { SectionHeader } from './Work'`.

```typescript
// At top of Work.tsx — export so other components can import
export function SectionHeader({
  path,
  jp,
  count,
  right,
}: {
  path: string;
  jp?: string;
  count?: number;
  right?: string;
}) {
  return (
    <div className="border border-[#1f1c17] mb-0">
      <div className="flex items-center justify-between px-4 py-2 text-[10px] font-mono">
        <div className="flex items-center gap-2 text-[#e7b766]">
          <span className="w-1.5 h-1.5 bg-[#e7b766] animate-pulse" />
          <span>{path}</span>
          {count !== undefined && <span className="text-[#4a453e]">({count})</span>}
        </div>
        <div className="flex items-center gap-3">
          {jp && <span className="text-[#5ec8d8] font-jp hidden md:inline">{jp}</span>}
          {right && <span className="text-[#4a453e]">{right}</span>}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Rewrite Work.tsx fully**

Two-column layout: left = project list, right = EsperPanel detail. EsperPanel import stays unchanged (Bolt version placeholder). Start file with the exported SectionHeader, then default export Work.

```typescript
import { useEffect, useState } from 'react';
import EsperPanel from './EsperPanel';
import type { Project } from '../lib/supabase';

// Exported so other sections can import it — do NOT also import from here, just define it here.
export function SectionHeader({ path, jp, count, right }: {
  path: string; jp?: string; count?: number; right?: string;
}) {
  return (
    <div className="border border-[#1f1c17] mb-0">
      <div className="flex items-center justify-between px-4 py-2 text-[10px] font-mono">
        <div className="flex items-center gap-2 text-[#e7b766]">
          <span className="w-1.5 h-1.5 bg-[#e7b766] animate-pulse" />
          <span>{path}</span>
          {count !== undefined && <span className="text-[#4a453e]">({count})</span>}
        </div>
        <div className="flex items-center gap-3">
          {jp && <span className="text-[#5ec8d8] font-jp hidden md:inline">{jp}</span>}
          {right && <span className="text-[#4a453e]">{right}</span>}
        </div>
      </div>
    </div>
  );
}

export default function Work({ projects }: { projects: Project[] }) {
  const featured = projects.filter((p) => p.featured);
  const [active, setActive] = useState<Project | null>(null);

  useEffect(() => {
    if (!active && featured[0]) setActive(featured[0]);
  }, [featured, active]);

  return (
    <section id="work" className="relative py-20 md:py-28 border-b border-[#1f1c17]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader path="/work/featured" jp="セレクト・ワーク" count={featured.length} right="esper_mode=auto" />
        <div className="grid grid-cols-12 gap-6 md:gap-10 mt-10">
          <ul className="col-span-12 lg:col-span-7 border-t border-[#1f1c17]">
            {featured.map((p, i) => (
              <li
                key={p.id}
                onMouseEnter={() => setActive(p)}
                onClick={() => setActive(p)}
                className={`flex items-start gap-4 py-4 px-2 border-b border-[#1f1c17] cursor-pointer transition-colors ${
                  active?.id === p.id ? 'bg-[#0f0e0b]' : 'hover:bg-[#0b0a08]'
                }`}
                data-cursor="hover"
              >
                <span className="text-[#4a453e] font-mono text-xs w-5 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm text-[#e8e4dc] truncate">{p.title}</span>
                    <span className="text-[10px] text-[#4a453e] font-mono shrink-0">{p.year}</span>
                  </div>
                  <div className="text-xs text-[#6b6660] mt-0.5">{p.client} · {p.role}</div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {p.tags.map((t) => (
                      <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 border border-[#2a2620] text-[#4a453e]">{t}</span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="col-span-12 lg:col-span-5 lg:sticky lg:top-20 self-start">
            <EsperPanel project={active} />
            {active?.summary && (
              <div className="mt-3 text-xs text-[#a8a29e] leading-relaxed border border-[#1f1c17] p-3">
                <span className="text-[#4a453e]">// </span>{active.summary}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verify Work section renders with Supabase data**

- [ ] **Step 5: Commit**

```bash
cd ~/Developer/conscious-shell
git add src/components/Work.tsx
git commit -m "refactor(work): clean two-column layout, exported SectionHeader"
```

---

### Task 6: About, Services, Recognition, Contact, Footer

**Files:**
- Modify: `src/components/About.tsx`
- Modify: `src/components/Services.tsx`
- Modify: `src/components/Recognition.tsx`
- Modify: `src/components/Contact.tsx`
- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Read all five in full**

```bash
cat ~/Developer/conscious-shell/src/components/About.tsx
cat ~/Developer/conscious-shell/src/components/Services.tsx
cat ~/Developer/conscious-shell/src/components/Recognition.tsx
cat ~/Developer/conscious-shell/src/components/Contact.tsx
cat ~/Developer/conscious-shell/src/components/Footer.tsx
```

- [ ] **Step 2: Rewrite About.tsx**

Read the existing `About.tsx` in Step 1 and copy the personal statement / bio text verbatim — it is authored content, not regenerable. Preserve: testimonial quote display, personal statement (exact text), headshot if present, timeline stat chips. Remove Bolt timing artifacts.

- [ ] **Step 3: Rewrite Services.tsx**

Grid of service cards from `services: Service[]`. Each card: icon (lucide), title, description. Consistent with noir palette.

- [ ] **Step 4: Rewrite Recognition.tsx**

Two columns: awards list, publications list. Both from Supabase data. Publication rows are links.

- [ ] **Step 5: Rewrite Contact.tsx**

Form with name, email, message. `app_logs` is a logging table — do not use it for contact submissions. Instead, write submissions to a new `contact_submissions` table.

First, write the migration file to disk:

```bash
cat > ~/Developer/conscious-shell/supabase/migrations/20260424000000_create_contact_submissions.sql << 'EOF'
create table contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz default now()
);
alter table contact_submissions enable row level security;
create policy "insert only" on contact_submissions for insert with check (true);
EOF
```

Then apply it: `supabase db push` or paste into Supabase SQL editor.

On submit: `supabase.from('contact_submissions').insert({ name, email, message })`. Show success state. Clear form.

- [ ] **Step 6: Rewrite Footer.tsx**

Logo, nav links, social links (GitHub, LinkedIn), copyright. No data dependencies.

- [ ] **Step 7: Verify all sections render top-to-bottom in browser**

- [ ] **Step 8: Commit**

```bash
cd ~/Developer/conscious-shell
git add supabase/migrations/20260424000000_create_contact_submissions.sql \
        src/components/About.tsx src/components/Services.tsx \
        src/components/Recognition.tsx src/components/Contact.tsx \
        src/components/Footer.tsx
git commit -m "refactor(content): About, Services, Recognition, Contact, Footer + contact_submissions migration"
```

---

## Phase 3: Ambient Effects Layer

### Task 7: CSS global effects

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Read existing index.css**

```bash
cat ~/Developer/conscious-shell/src/index.css
```

- [ ] **Step 2: Rewrite with clean global effect classes**

CRITICAL: The first line of `index.css` must be kept exactly as-is:
```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Noto+Sans+JP:wght@300;500&display=swap');
```
This loads JetBrains Mono and Noto Sans JP. Dropping it breaks all `font-mono` styling and the `.font-jp` class used throughout for Japanese text.

Also preserve all custom properties, `.site-grain`, `.site-rain`, `.chroma`, `.font-jp`. Remove Bolt-generated dead classes.

- [ ] **Step 3: Verify grain + rain overlays visible in browser at low opacity**

- [ ] **Step 4: Commit**

```bash
cd ~/Developer/conscious-shell
git add src/index.css
git commit -m "refactor(css): clean global effects, grain, rain, chroma"
```

---

### Task 8: CRTOverlay, TearsInRain, CodeRain

**Files:**
- Modify: `src/components/CRTOverlay.tsx`
- Modify: `src/components/TearsInRain.tsx`
- Modify: `src/components/CodeRain.tsx`

- [ ] **Step 1: Read all three**

```bash
cat ~/Developer/conscious-shell/src/components/CRTOverlay.tsx
cat ~/Developer/conscious-shell/src/components/TearsInRain.tsx
cat ~/Developer/conscious-shell/src/components/CodeRain.tsx
```

- [ ] **Step 2: Rewrite CRTOverlay**

Fixed `pointer-events-none` overlay. Scanlines via CSS `repeating-linear-gradient`. Subtle vignette. No JS animation — pure CSS.

- [ ] **Step 3: Rewrite TearsInRain**

Canvas-based rain. `useRef<HTMLCanvasElement>`, `requestAnimationFrame` loop via `useEffect`. Drops are vertical white lines with alpha fade. `position: fixed`, `pointer-events-none`, `z-index: 0`.

- [ ] **Step 4: Rewrite CodeRain**

Same canvas pattern as TearsInRain but with katakana characters falling. Accepts `className` prop for positioning by parent.

- [ ] **Step 5: Commit**

```bash
cd ~/Developer/conscious-shell
git add src/components/CRTOverlay.tsx src/components/TearsInRain.tsx src/components/CodeRain.tsx
git commit -m "refactor(ambient): CRT overlay, tears rain, code rain — clean canvas"
```

---

### Task 9: BootOverlay, Spinner, Cursor, BaselineDrift

**Files:**
- Modify: `src/components/BootOverlay.tsx`
- Modify: `src/components/Spinner.tsx`
- Modify: `src/components/Cursor.tsx`
- Modify: `src/components/BaselineDrift.tsx`

- [ ] **Step 1: Read all four**

```bash
cat ~/Developer/conscious-shell/src/components/BootOverlay.tsx
cat ~/Developer/conscious-shell/src/components/Spinner.tsx
cat ~/Developer/conscious-shell/src/components/Cursor.tsx
cat ~/Developer/conscious-shell/src/components/BaselineDrift.tsx
```

- [ ] **Step 2: Rewrite BootOverlay**

Full-screen black overlay that animates out after 1.8s. Shows `rep7 // initializing` text. Uses Framer Motion `AnimatePresence`. Unmounts after exit.

- [ ] **Step 3: Rewrite Spinner**

Read the existing `Spinner.tsx` in Step 1 before rewriting — the actual component is a canvas-based animation (ship elements launch on staggered timers via `scheduleLaunch`), not a loading dot. Copy the canvas animation logic exactly.

`portfolio:ready` is dispatched by App.tsx after fetch completes — Spinner does not dispatch or listen for that event. Remove any reference to `portfolio:ready` from Spinner.

- [ ] **Step 4: Rewrite Cursor**

Custom cursor dot + trailing ring. Tracks `mousemove`. Scales up on `[data-cursor="hover"]` elements. Hidden on touch devices via `@media (pointer: coarse)`.

- [ ] **Step 5: Rewrite BaselineDrift**

BaselineDrift is a **sidebar HUD** — not a background color shifter. The existing implementation (read in Step 1) tracks mouse velocity, scroll %, and idle time to compute a "drift" score 0-100. The HUD is fixed right-center, hidden on mobile. It shows:
- Score as a 3-digit number (000-100) in a color keyed to state: nominal (<40, cyan `#5ec8d8`), watching (<70, amber `#e7b766`), flag (≥70, red `#ff7a5c`)
- State label + matching icon (Activity / Eye / ShieldAlert from lucide)
- Progress bar representing drift %
- Three mini stats: vel / scr / idl
- Konami code (↑↑↓↓←→←→ba) toggles an "override" mode that adds a banner and sets `document.body.classList.add('override-mode')`
- When drift > 78, random chance (35%) to show a floating "baseline flag" card with a Blade Runner VK test prompt

Preserve this exact behavior. Do not replace it with a color-temperature animation.

- [ ] **Step 6: Commit**

```bash
cd ~/Developer/conscious-shell
git add src/components/BootOverlay.tsx src/components/Spinner.tsx \
        src/components/Cursor.tsx src/components/BaselineDrift.tsx
git commit -m "refactor(ambient): boot overlay, spinner, cursor, baseline drift"
```

---

### Task 10a: SessionHUD, AmbientAudio, BlackLitany, OverrideMode, NoirSubtitles

**Files:**
- Modify: `src/components/SessionHUD.tsx`
- Modify: `src/components/AmbientAudio.tsx`
- Modify: `src/components/BlackLitany.tsx`
- Modify: `src/components/OverrideMode.tsx`
- Modify: `src/components/NoirSubtitles.tsx`

- [ ] **Step 1: Read all five**

```bash
for f in SessionHUD AmbientAudio BlackLitany OverrideMode NoirSubtitles; do
  echo "=== $f ===" && cat ~/Developer/conscious-shell/src/components/${f}.tsx | head -60
done
```

- [ ] **Step 2: Rewrite SessionHUD**

Fixed bottom-right HUD. Shows session start time, scroll depth %, a pulsing amber dot. Font mono, tiny text, `bg-[#07070a]/80`.

Import `getSessionId` from `../lib/logger`. Parse the timestamp from the session ID (which encodes `Date.now()` in base-36 as its first segment):

```typescript
import { getSessionId } from '../lib/logger';

function sessionStart(): Date {
  return new Date(parseInt(getSessionId().split('-')[0], 36));
}
```

Display elapsed time as `mm:ss` using a `setInterval(1000)` tick.

- [ ] **Step 3: Rewrite AmbientAudio**

Web Audio API drone. Use two detuned sine oscillators + a `DelayNode` for pseudo-reverb (no impulse response file needed). Toggle button fixed bottom-left. `AudioContext` created on first user gesture (click), not on mount.

The existing code uses a `ctx.resume()` / `ctx.suspend()` toggle pattern — preserve this. The correct lifecycle:
- First toggle-on: create `AudioContext`, create `OscillatorNode` (type=`'sine'`, freq=55hz) + a detuned second osc (freq=55.5hz) + `GainNode` (gain=0.12) + `DelayNode` (delayTime=0.4), connect chain to `ctx.destination`, call `osc.start()`
- Subsequent toggle-on: call `ctx.resume()` (do NOT recreate oscillators — they're already started)
- Toggle-off: call `ctx.suspend()`

```typescript
let ctx: AudioContext | null = null;
let initialized = false;

function ensureInit(ctx: AudioContext) {
  if (initialized) return;
  initialized = true;
  const gain = ctx.createGain(); gain.gain.value = 0.12;
  const delay = ctx.createDelay(1); delay.delayTime.value = 0.4;
  [55, 55.5].forEach((freq) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = freq;
    osc.connect(gain); osc.start();
  });
  gain.connect(delay); delay.connect(ctx.destination); gain.connect(ctx.destination);
}

// On toggle-on:
if (!ctx) ctx = new AudioContext();
ensureInit(ctx);
if (ctx.state === 'suspended') await ctx.resume();

// On toggle-off:
await ctx.suspend();
```

- [ ] **Step 4: Rewrite BlackLitany**

Periodic `console.log` of poetic phrases. Pure JS, no DOM. Array of 8-10 phrases. Logs one every 90s on a `setInterval`. Clears on unmount.

- [ ] **Step 5: Rewrite OverrideMode**

OverrideMode is the **receiver** in a two-part override system — it does NOT have its own key trigger. Read the existing `OverrideMode.tsx` carefully in Step 1.

Actual behavior:
- Listens for `window` CustomEvent named `override:toggle`
- On each event, toggles `document.body.classList.toggle('override-mode')`
- May render a visual overlay/banner when override is active

Do NOT use Shift+O as a trigger — that's wrong. Do NOT dispatch `override:mode` — it listens, not dispatches. The Konami code in BaselineDrift is the trigger; BaselineDrift should dispatch `window.dispatchEvent(new CustomEvent('override:toggle'))` when Konami fires (verify this in the BaselineDrift read from Task 9 Step 1 and add the dispatch if it's missing from the existing code).

- [ ] **Step 6: Rewrite NoirSubtitles**

Fixed bottom-center, `pointer-events-none`. Cycles through `noir: Noir[]` with typewriter effect per line. 6s per line. Fades in/out via Framer Motion. Skips if array empty. Props: `{ lines: Noir[] }`.

- [ ] **Step 7: Commit**

```bash
cd ~/Developer/conscious-shell
git add src/components/SessionHUD.tsx src/components/AmbientAudio.tsx \
        src/components/BlackLitany.tsx src/components/OverrideMode.tsx \
        src/components/NoirSubtitles.tsx
git commit -m "refactor(ambient): SessionHUD, AmbientAudio, BlackLitany, OverrideMode, NoirSubtitles"
```

---

### Task 10b: SystemBreach, DeadDropConsole, LogViewer, IntelligenceHUD

**Files:**
- Modify: `src/components/SystemBreach.tsx`
- Modify: `src/components/DeadDropConsole.tsx`
- Modify: `src/components/LogViewer.tsx`
- Modify: `src/components/IntelligenceHUD.tsx`

- [ ] **Step 1: Read all four**

```bash
for f in SystemBreach DeadDropConsole LogViewer IntelligenceHUD; do
  echo "=== $f ===" && cat ~/Developer/conscious-shell/src/components/${f}.tsx | head -80
done
```

- [ ] **Step 2: Rewrite SystemBreach**

Random 0.3% chance per minute glitch. `setInterval` every 60s, `Math.random() < 0.003`. Full-screen red scanline flash, "SYSTEM BREACH DETECTED" text, auto-dismisses after 2s. Brief Web Audio burst: `OscillatorNode` type `sawtooth`, freq 220hz, gain 0.3, duration 0.2s.

- [ ] **Step 3: Rewrite DeadDropConsole**

Appears on `~` key (`e.key === '~'`, which is Shift+backtick on US keyboards — this is the correct event value, not `` ` ``). Fixed full-screen overlay, dark bg. Input field. Commands: `whoami` → `micah boswell // design_leader`, `ls` → lists sections, `help` → lists commands, `contact` → shows email, `clear` → clears history. Each response has a 300ms fake delay. Closes on `Escape`.

- [ ] **Step 4: Rewrite LogViewer**

Toggle via `L` key. Fixed panel (right side, 400px wide). Reads from `app_logs` Supabase table: `supabase.from('app_logs').select('*').order('created_at', { ascending: false }).limit(20)`. Polls every 30s via `setInterval`. Filter buttons: all / error / warn / info. Uses `subscribeToFlush` from `lib/logger.ts` to refresh immediately after a new log is written.

- [ ] **Step 5: Rewrite IntelligenceHUD**

Toggle via `I` key, also triggered by `intel:command` CustomEvent (from CommandPalette). Fixed panel. Reads from `intelligence.ts`: import `getState` or equivalent to get current `Signals` and `Persona`. Shows: persona label + accent color, scroll depth, session time, section dwell times, command uses. Read the existing IntelligenceHUD and intelligence.ts APIs carefully — use whatever `getState`/subscription pattern intelligence.ts already exposes.

- [ ] **Step 6: Commit**

```bash
cd ~/Developer/conscious-shell
git add src/components/SystemBreach.tsx src/components/DeadDropConsole.tsx \
        src/components/LogViewer.tsx src/components/IntelligenceHUD.tsx
git commit -m "refactor(ambient): SystemBreach, DeadDropConsole, LogViewer, IntelligenceHUD"
```

---

## Phase 4: Timeline with Screenshots

### Task 11: TimeMachine — screenshot-first rebuild

**Files:**
- Modify: `src/components/TimeMachine.tsx`
- Create: `src/lib/timeline.ts`

The `ArchiveCapture` type already has `custom_screenshot_url`. This task replaces the archive.org iframe embed with a plain `<img>` sourced from `custom_screenshot_url`. No iframes. No fallback to `screenshot_url` — that field contains Wayback Machine iframe URLs, not image URLs, and would render broken in an `<img>` tag.

- [ ] **Step 1: Create src/lib/timeline.ts**

```typescript
import type { ArchiveCapture } from './supabase';

/**
 * Returns the custom screenshot URL for a capture, or null if not set.
 * Does NOT fall back to screenshot_url — that field is a Wayback iframe URL, not an image.
 */
export function screenshotUrl(capture: ArchiveCapture): string | null {
  return capture.custom_screenshot_url || null;
}

/** Sort captures by year ascending */
export function sortCaptures(captures: ArchiveCapture[]): ArchiveCapture[] {
  return [...captures].sort((a, b) => a.year - b.year);
}
```

- [ ] **Step 2: Rewrite TimeMachine.tsx**

```typescript
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeader } from './Work';
import { screenshotUrl, sortCaptures } from '../lib/timeline';
import type { ArchiveCapture } from '../lib/supabase';

export default function TimeMachine({ captures }: { captures: ArchiveCapture[] }) {
  const sorted = useMemo(() => sortCaptures(captures), [captures]);
  const [idx, setIdx] = useState(0);

  if (!sorted.length) return null;

  const current = sorted[idx];
  const imgSrc = screenshotUrl(current);
  const minYear = sorted[0].year;
  const maxYear = sorted[sorted.length - 1].year;
  const pct = ((current.year - minYear) / Math.max(1, maxYear - minYear)) * 100;

  const step = (dir: number) =>
    setIdx((i) => Math.max(0, Math.min(sorted.length - 1, i + dir)));

  return (
    <section id="time" className="relative py-20 md:py-28 border-b border-[#1f1c17]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader
          path="wayback --unroll /conscious-shell"
          jp="時間旅行"
          count={sorted.length}
          right={`year=${current.year}`}
        />

        <div className="mt-8 grid grid-cols-12 gap-4">
          {/* Scrubber */}
          <div className="col-span-12 border border-[#1f1c17] bg-[#0b0a08]/60">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#1f1c17] text-[10px]">
              <span className="flex items-center gap-2 text-[#e7b766]">
                <span className="w-1.5 h-1.5 bg-[#e7b766] animate-pulse" />
                TEMPORAL ARCHIVE — 25 YEARS OF CONSCIOUS-SHELL
              </span>
              <span className="text-[#5ec8d8] font-jp hidden md:inline">自分の過去</span>
            </div>

            <div className="px-4 pt-4 pb-2">
              <div className="flex items-end justify-between mb-3">
                <div className="flex items-baseline gap-4">
                  <motion.div
                    key={current.year}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl text-[#e7b766] tabular-nums leading-none chroma"
                  >
                    {current.year}
                  </motion.div>
                  <div className="text-xs text-[#6b6660]">
                    <div>era: <span className="text-[#e8e4dc]">{current.era_label}</span></div>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => step(-1)}
                    disabled={idx === 0}
                    className="px-2 py-1 border border-[#2a2620] text-[#a8a29e] hover:border-[#e7b766] hover:text-[#e7b766] disabled:opacity-30 transition-colors text-xs"
                  >
                    ← rewind
                  </button>
                  <button
                    onClick={() => step(1)}
                    disabled={idx === sorted.length - 1}
                    className="px-2 py-1 border border-[#2a2620] text-[#a8a29e] hover:border-[#e7b766] hover:text-[#e7b766] disabled:opacity-30 transition-colors text-xs"
                  >
                    forward →
                  </button>
                </div>
              </div>

              {/* Year scrub bar */}
              <div className="relative h-1 bg-[#1f1c17] mt-2 mb-1">
                <div className="absolute h-full bg-[#e7b766]" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-[9px] text-[#4a453e] font-mono">
                <span>{minYear}</span>
                <span>{maxYear}</span>
              </div>
            </div>
          </div>

          {/* Year pills */}
          <div className="col-span-12 flex flex-wrap gap-1.5 pt-1">
            {sorted.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setIdx(i)}
                className={`px-2.5 py-1 text-[10px] font-mono border transition-colors ${
                  i === idx
                    ? 'border-[#e7b766] text-[#e7b766] bg-[#e7b766]/10'
                    : 'border-[#2a2620] text-[#4a453e] hover:border-[#a8a29e] hover:text-[#a8a29e]'
                }`}
              >
                {c.year}
              </button>
            ))}
          </div>

          {/* Screenshot display */}
          <div className="col-span-12 md:col-span-9 border border-[#1f1c17] bg-[#0b0a08] min-h-[320px] md:min-h-[500px] flex items-center justify-center relative overflow-hidden">
            <AnimatePresence mode="wait">
              {imgSrc ? (
                <motion.img
                  key={current.id}
                  src={imgSrc}
                  alt={`conscious-shell.com — ${current.year}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <motion.div
                  key={`no-img-${current.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-[#4a453e] font-mono text-xs p-8"
                >
                  <div className="text-[#e7b766] text-2xl mb-3">{current.year}</div>
                  <div>[ capture not available ]</div>
                  {current.era_label && <div className="mt-1 text-[#6b6660]">era: {current.era_label}</div>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Metadata sidebar */}
          <div className="col-span-12 md:col-span-3 border border-[#1f1c17] bg-[#0b0a08]/60 p-4 font-mono text-[10px] space-y-3">
            <div>
              <div className="text-[#4a453e] mb-0.5">YEAR</div>
              <div className="text-[#e7b766] text-lg">{current.year}</div>
            </div>
            <div>
              <div className="text-[#4a453e] mb-0.5">ERA</div>
              <div className="text-[#e8e4dc]">{current.era_label || '—'}</div>
            </div>
            <div>
              <div className="text-[#4a453e] mb-0.5">ORIGINAL URL</div>
              <a
                href={current.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5ec8d8] hover:text-[#7dd8e8] break-all"
              >
                {current.original_url || '—'}
              </a>
            </div>
            {current.wayback_url && (
              <div>
                <div className="text-[#4a453e] mb-0.5">WAYBACK</div>
                <a
                  href={current.wayback_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5ec8d8] hover:text-[#7dd8e8] break-all"
                >
                  view archive →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Upload your screenshots to Supabase Storage**

```bash
# Create bucket via Supabase dashboard: Storage → New bucket → "timeline" (public)
# Upload your screenshot files there (naming: YYYY.png or Year_YYYY.png)
# Then update archive_captures rows: set custom_screenshot_url to the public storage URL
# Example URL pattern: https://<project>.supabase.co/storage/v1/object/public/timeline/2000.png
```

- [ ] **Step 4: Alternatively — use local public/ assets**

If you prefer local files over Supabase Storage:
```bash
mkdir -p ~/Developer/conscious-shell/public/timeline
# Copy screenshots: cp ~/path/to/screenshot_2000.png public/timeline/2000.png
# Then set custom_screenshot_url = "/timeline/2000.png" in the DB row
```

- [ ] **Step 5: Verify TimeMachine in browser**

Navigate to `#time`. Scrubber works. Year pills switch captures. Screenshot displays in image frame. "No capture" fallback renders cleanly when image missing.

- [ ] **Step 6: Commit**

```bash
cd ~/Developer/conscious-shell
git add src/components/TimeMachine.tsx src/lib/timeline.ts
git commit -m "feat(timeline): screenshot-first TimeMachine, no iframes, sortCaptures util"
```

---

## Phase 5: Interactive Cinematic Sections

### Task 12: VoightKampff, HaikuDeck, HumanLayer

**Files:**
- Modify: `src/components/VoightKampff.tsx`
- Modify: `src/components/HaikuDeck.tsx`
- Modify: `src/components/HumanLayer.tsx`

- [ ] **Step 1: Read all three in full**

```bash
cat ~/Developer/conscious-shell/src/components/VoightKampff.tsx
cat ~/Developer/conscious-shell/src/components/HaikuDeck.tsx
cat ~/Developer/conscious-shell/src/components/HumanLayer.tsx
```

- [ ] **Step 2: Add `answer` column to vk_questions**

The `VkQuestion` type has no `answer` field. First write the migration file to disk:

```bash
cat > ~/Developer/conscious-shell/supabase/migrations/20260424000001_add_answer_to_vk_questions.sql << 'EOF'
alter table vk_questions add column if not exists answer text default '';
EOF
```

Then apply it: `supabase db push` or paste into Supabase SQL editor. Then add `answer: string` to the `VkQuestion` type in `src/lib/supabase.ts`:

```typescript
export type VkQuestion = {
  id: string;
  prompt: string;
  prompt_jp: string;
  answer: string;        // add this
  category: string;
  order_index: number;
};
```

Populate answer text for each question in the Supabase dashboard before testing.

- [ ] **Step 3: Rewrite VoightKampff**

Blade Runner-themed Q&A. Displays one `VkQuestion` at a time. Shows `prompt` (and `prompt_jp` as subtext). User clicks "respond" to reveal `answer` with a typewriter effect. Navigation: prev/next buttons. Category filter tabs. Section header uses `SectionHeader` from `./Work`. Props: `{ questions: VkQuestion[] }`.

- [ ] **Step 4: Rewrite HaikuDeck**

Card carousel of `Haiku[]` records. Each card shows 3 haiku lines + source + mood tag. Auto-advances every 8s. Click to pause. Touch: listen for `touchstart`/`touchend` delta > 50px to swipe next/prev.

- [ ] **Step 5: Rewrite HumanLayer**

Grid of `Trivia[]` records. Each trivia item has `category`, `label`, `value`, `glyph`. Grouped by category. Value hidden by default behind a `bg-[#1f1c17]` redaction bar. On hover (`group-hover`): bar fades out, value fades in.

- [ ] **Step 6: Commit**

```bash
cd ~/Developer/conscious-shell
git add supabase/migrations/20260424000001_add_answer_to_vk_questions.sql \
        src/lib/supabase.ts \
        src/components/VoightKampff.tsx src/components/HaikuDeck.tsx src/components/HumanLayer.tsx
git commit -m "refactor(cinematic): VoightKampff (+ answer migration), HaikuDeck, HumanLayer"
```

---

### Task 13: Manifesto, Impact, IndexList, ScrambleText

**Files:**
- Modify: `src/components/Manifesto.tsx`
- Modify: `src/components/Impact.tsx`
- Modify: `src/components/IndexList.tsx`
- Modify: `src/components/ScrambleText.tsx`

- [ ] **Step 1: Read all four**

```bash
cat ~/Developer/conscious-shell/src/components/Manifesto.tsx
cat ~/Developer/conscious-shell/src/components/Impact.tsx
cat ~/Developer/conscious-shell/src/components/IndexList.tsx
cat ~/Developer/conscious-shell/src/components/ScrambleText.tsx
```

- [ ] **Step 2: Rewrite ScrambleText**

Utility component. Props: `text: string`, `trigger: boolean`, `className?: string`. On `trigger=true`, scrambles through random chars before resolving to `text`. 30ms intervals, 12 scramble frames.

```typescript
import { useEffect, useRef, useState } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';

export default function ScrambleText({
  text,
  trigger,
  className,
}: {
  text: string;
  trigger: boolean;
  className?: string;
}) {
  const [display, setDisplay] = useState(text);
  const frame = useRef(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!trigger) { setDisplay(text); return; }
    frame.current = 0;
    const total = 12;
    const tick = () => {
      frame.current++;
      const progress = frame.current / total;
      setDisplay(
        text.split('').map((c, i) =>
          i < Math.floor(progress * text.length) || c === ' '
            ? c
            : CHARS[Math.floor(Math.random() * CHARS.length)]
        ).join('')
      );
      if (frame.current < total) raf.current = requestAnimationFrame(tick);
      else setDisplay(text);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [trigger, text]);

  return <span className={className}>{display}</span>;
}
```

- [ ] **Step 3: Rewrite Manifesto**

Static section — no data dependencies. Read the existing Manifesto.tsx in Step 1 and copy the manifesto text verbatim. Do not invent, paraphrase, or summarize it. The text is authored content specific to Micah's voice and is not regenerable.

Uses ScrambleText on section header when scrolled into view (IntersectionObserver).

- [ ] **Step 4: Rewrite Impact**

Static stats section. Read the existing Impact.tsx in Step 1 and copy the exact stat values (years, projects count, clients count, books count). Do not guess or round numbers — use the values as authored in the existing component. Each number uses a count-up animation on scroll entry. Font mono, amber accents.

- [ ] **Step 5: Rewrite IndexList**

All projects as a filterable index table. Columns: year, client, title, role, tags. Filter by tag. Sort by year. Uses `projects: Project[]` from Supabase.

- [ ] **Step 6: Commit**

```bash
cd ~/Developer/conscious-shell
git add src/components/Manifesto.tsx src/components/Impact.tsx \
        src/components/IndexList.tsx src/components/ScrambleText.tsx
git commit -m "refactor(cinematic): Manifesto, Impact, IndexList, ScrambleText"
```

---

## Phase 6: Complex Interactive Sections

### Task 14: ForceGraph (IRIS Archive)

**Files:**
- Modify: `src/components/ForceGraph.tsx`

This is the largest component (641 lines) — a D3/SVG iris visualization where each project is a photoreceptor. High-value section; clean rewrite required.

- [ ] **Step 1: Read ForceGraph.tsx in full**

```bash
cat ~/Developer/conscious-shell/src/components/ForceGraph.tsx
```

- [ ] **Step 2: Identify direct Supabase calls inside ForceGraph**

The existing file imports `supabase` directly. Before rewriting, find every `supabase.from(...)` call inside ForceGraph.tsx:

```bash
grep -n "supabase\." ~/Developer/conscious-shell/src/components/ForceGraph.tsx
```

If it queries a table not fetched by App.tsx (e.g., a separate `visitor_intelligence` or `web_dossier_facts` query), preserve that call in the rewrite. Do not silently drop it.

- [ ] **Step 3: Identify the exact SVG constants and layout math**

Copy down: `VIEW=720`, `CENTER=360`, `PUPIL_R=64`, `IRIS_R_INNER=78`, `IRIS_R_OUTER=322`, `LIMBUS_R=334`, `FIBER_COUNT=280`, `GAP_DEG=38`. These drive the layout.

- [ ] **Step 4: Rewrite ForceGraph.tsx**

Keep all visual math and any direct Supabase calls intact. Clean up: extract `ProjectLayout` computation into a pure function, separate SVG fiber generation from project dot rendering, remove redundant `useEffect` chains.

Read the existing `ForceGraph.tsx` in Step 1 to determine what `ProjectLayout` actually computes per project (it will include at minimum: x, y position on the iris, angle in degrees, and a reference to the project). Define the type explicitly at the top of the file based on what you read — do not leave it implicit.

```typescript
// Define based on what existing ForceGraph computes — approximate shape:
type ProjectLayout = {
  project: Project;
  x: number;      // SVG coordinate
  y: number;      // SVG coordinate
  angle: number;  // degrees from center
};

// Pure function — no React deps
function computeLayout(projects: Project[]): ProjectLayout[] { ... }

// Fiber generation — pure, called once per render
function buildFibers(count: number): JSX.Element[] { ... }

export default function ForceGraph({ projects }: { projects: Project[] }) { ... }
```

- [ ] **Step 5: Verify iris renders with project dots, hover state works**

- [ ] **Step 6: Commit**

```bash
cd ~/Developer/conscious-shell
git add src/components/ForceGraph.tsx
git commit -m "refactor(iris): clean D3 iris archive, pure layout computation"
```

---

### Task 15: GithubLab, WebDossier

**Files:**
- Modify: `src/components/GithubLab.tsx`
- Modify: `src/components/WebDossier.tsx`

- [ ] **Step 1: Read both**

```bash
cat ~/Developer/conscious-shell/src/components/GithubLab.tsx
cat ~/Developer/conscious-shell/src/components/WebDossier.tsx
```

- [ ] **Step 2: Rewrite GithubLab**

Grid of `GithubProject[]` cards. Each card: repo name, tagline, description, tags, stars, language badge, links to repo + pages. Featured projects first. Filter by language/tag.

- [ ] **Step 3: Rewrite WebDossier**

`WebDossierFact[]` displayed as an intelligence dossier. Facts grouped by `category`. Each fact: text, source label (link). Weight drives visual prominence (larger text or amber color for weight > 7).

- [ ] **Step 4: Commit**

```bash
cd ~/Developer/conscious-shell
git add src/components/GithubLab.tsx src/components/WebDossier.tsx
git commit -m "refactor(sections): GithubLab, WebDossier"
```

---

### Task 16: EsperScene + EsperPanel

**Files:**
- Modify: `src/components/EsperScene.tsx`
- Modify: `src/components/EsperPanel.tsx`

- [ ] **Step 1: Read both in full**

```bash
cat ~/Developer/conscious-shell/src/components/EsperScene.tsx
cat ~/Developer/conscious-shell/src/components/EsperPanel.tsx
```

- [ ] **Step 2: Rewrite EsperScene**

Blade Runner Esper-machine UX. The photo is **shared across all hotspots** — sourced from `hotspots[0]?.photo_url`. All hotspot overlays are positioned on top of this single image. Clicking a hotspot triggers a 3-phase animation: `track → enhance → resolve`. Each phase types a command sequence. Uses `AnimatePresence` for phase transitions.

Extract phase sequencing to a function `useEsperSequence(hotspot, onReset)` defined **inside `EsperScene.tsx`** — do not create a separate file. The git add in Step 4 only stages `EsperScene.tsx` and `EsperPanel.tsx`; any new file would be silently untracked.

- [ ] **Step 3: Rewrite EsperPanel**

Used in Work section. Shows active project image with scanline overlay, project title, subtle zoom animation. Props: `{ project: Project | null }`.

- [ ] **Step 4: Commit**

```bash
cd ~/Developer/conscious-shell
git add src/components/EsperScene.tsx src/components/EsperPanel.tsx
git commit -m "refactor(esper): clean hotspot sequence, extracted useEsperSequence hook"
```

---

### Task 17: Skyline2049, AgentBattle

**Files:**
- Modify: `src/components/Skyline2049.tsx`
- Modify: `src/components/AgentBattle.tsx`

- [ ] **Step 1: Read both**

```bash
cat ~/Developer/conscious-shell/src/components/Skyline2049.tsx
cat ~/Developer/conscious-shell/src/components/AgentBattle.tsx
```

- [ ] **Step 2: Rewrite Skyline2049**

Canvas or SVG 2049-style city skyline with scrolling neon signs from `SkylineSign[]`. Each sign has `text` and `tone` (amber/cyan/red/ember). Parallax scroll effect. Signs cycle.

- [ ] **Step 3: Rewrite AgentBattle**

Design round battle log. Two AI agents (scifi vs goth) debating design decisions. App.tsx passes `data.designRounds.map(toRound)` — AgentBattle does NOT receive raw `DesignRound[]`. It receives a mapped type. Define the prop type to match `toRound`'s output exactly:

```typescript
type Round = {
  id: string;
  round_number: number;
  agent: 'goth' | 'scifi';
  title: string;
  palette: string[];      // array of hex strings
  motif: string;
  material: string;
  typography: string;
  critique: string;
  score: number;
};

export default function AgentBattle({ initial }: { initial: Round[] }) { ... }
```

Each round: round number badge, agent label (GOTH/SCIFI), title, palette swatches (small colored squares), motif + material + typography metadata, critique text, score. Displayed as a debate transcript ordered by `round_number`. Highest-scoring round gets amber highlight.

- [ ] **Step 4: Commit**

```bash
cd ~/Developer/conscious-shell
git add src/components/Skyline2049.tsx src/components/AgentBattle.tsx
git commit -m "refactor(cinematic): Skyline2049 parallax signs, AgentBattle debate log"
```

---

### Task 18: CommandPalette

**Files:**
- Modify: `src/components/CommandPalette.tsx`

- [ ] **Step 1: Read CommandPalette**

```bash
cat ~/Developer/conscious-shell/src/components/CommandPalette.tsx
```

- [ ] **Step 2: Rewrite CommandPalette**

Full-screen modal triggered by `⌘K` or `/`. Shows searchable list of: all projects, section navigation links, keyboard shortcuts. Keyboard navigable (arrow keys, Enter, Escape). Props: `{ open, onClose, projects }`.

Search: case-insensitive `includes()` over `project.title` and `project.client` — no new packages. Do not install fuse.js or any search library.

```typescript
const results = projects.filter((p) => {
  const q = query.toLowerCase();
  return p.title.toLowerCase().includes(q) || p.client.toLowerCase().includes(q);
});
```

- [ ] **Step 3: Verify palette opens, search works, keyboard nav works**

- [ ] **Step 4: Commit**

```bash
cd ~/Developer/conscious-shell
git add src/components/CommandPalette.tsx
git commit -m "refactor(palette): clean command palette, fuzzy search, keyboard nav"
```

---

## Phase 7: Final Polish

### Task 19: Type-check, build, deploy

- [ ] **Step 1: Full type-check**

```bash
cd ~/Developer/conscious-shell && npm run typecheck 2>&1
```

Fix any errors. Common: mismatched prop types, missing imports, unused variables.

- [ ] **Step 2: Lint**

```bash
cd ~/Developer/conscious-shell && npm run lint 2>&1
```

Fix lint errors. Warnings are okay.

- [ ] **Step 3: Production build**

```bash
cd ~/Developer/conscious-shell && npm run build 2>&1
```

Expected: build completes, no errors, bundle sizes reasonable (Three.js + D3 will be large — that's expected).

- [ ] **Step 4: Preview build locally**

```bash
cd ~/Developer/conscious-shell && npm run preview
```

Open `http://localhost:4173`. Verify: boot overlay shows, hero types in, all sections visible, TimeMachine shows screenshots.

- [ ] **Step 5: Final commit**

```bash
cd ~/Developer/conscious-shell
# Do NOT use git add -A — .env is at project root and must not be staged
git add src/ supabase/ docs/ public/
git commit -m "feat: complete portfolio rebuild — all 40 components, screenshot timeline, clean TypeScript"
```

- [ ] **Step 6: Push**

```bash
cd ~/Developer/conscious-shell && git push origin master
```

---

## Screenshot Upload Reference

When you're ready to populate the TimeMachine:

**Option A — Supabase Storage (preferred for production):**
1. Supabase dashboard → Storage → Create bucket `timeline` (public)
2. Upload files named `2000.png`, `2003.png`, etc.
3. Get public URL: `https://<project-ref>.supabase.co/storage/v1/object/public/timeline/2000.png`
4. Update `archive_captures` rows: `custom_screenshot_url = <url>`

**Option B — Local public assets (dev/simple):**
1. `mkdir -p ~/Developer/conscious-shell/public/timeline`
2. Copy screenshots: `cp ~/Downloads/screenshot_2000.png public/timeline/2000.png`
3. Update `archive_captures` rows: `custom_screenshot_url = /timeline/2000.png`

Both approaches use the same `screenshotUrl()` util from `src/lib/timeline.ts`.

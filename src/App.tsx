import { Suspense, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { lazyWithRetry as lazy } from './lib/lazyWithRetry';
import { ErrorBoundary } from './components/ErrorBoundary';
import Nav from './components/Nav';
import Hero from './components/Hero';
import DevtoolsEasterEggs from './components/DevtoolsEasterEggs';
import Work from './components/Work';
import BootOverlay from './components/BootOverlay';
import SessionHUD from './components/SessionHUD';
import CaseStudy from './components/CaseStudy';
import { useScrollToHash } from './lib/useScrollToHash';

import AmbientAudio from './components/AmbientAudio';
import MobileControlDock from './components/MobileControlDock';
import CRTOverlay from './components/CRTOverlay';
import SoulLayer from './components/SoulLayer';
import { NarratorProvider } from './lib/narrator';
import { PersonalizationProvider } from './lib/personalization';
import { fetchPortfolio } from './lib/portfolio';
import { startWitness } from './lib/witness';
import type {
  Project,
  Service,
  Testimonial,
  Award,
  Publication,
  VkQuestion,
  GithubProject,
  Trivia,
  Haiku,
  Noir,
  EsperHotspot,
  SkylineSign,
  DesignRound,
  WebDossierFact,
  Certification,
  LinkedInRecommendation,
  LinkedInArticle,
  Poem,
} from './lib/supabase';

// Heavy / below-the-fold / on-demand → split into separate chunks and
// mount after the first paint settles. Saves ~hundreds of KB on the
// critical path and stops the initial render from competing with
// every ambient effect on the page.
const LiveSites = lazy(() => import('./components/LiveSites'));
const VoightKampff = lazy(() => import('./components/VoightKampff'));
const TimeMachine = lazy(() => import('./components/TimeMachine'));
const IndexList = lazy(() => import('./components/IndexList'));
const Impact = lazy(() => import('./components/Impact'));
const Manifesto = lazy(() => import('./components/Manifesto'));
const HumanLayer = lazy(() => import('./components/HumanLayer'));
const HaikuDeck = lazy(() => import('./components/HaikuDeck'));
const About = lazy(() => import('./components/About'));
const Services = lazy(() => import('./components/Services'));
const Recognition = lazy(() => import('./components/Recognition'));
const Contact = lazy(() => import('./components/Contact'));
const Footer = lazy(() => import('./components/Footer'));
const TearsInRain = lazy(() => import('./components/TearsInRain'));
const BlackLitany = lazy(() => import('./components/BlackLitany'));
const SystemBreach = lazy(() => import('./components/SystemBreach'));
const NoirSubtitles = lazy(() => import('./components/NoirSubtitles'));
const DeadDropConsole = lazy(() => import('./components/DeadDropConsole'));
const EsperScene = lazy(() => import('./components/EsperScene'));
const WebDossier = lazy(() => import('./components/WebDossier'));
const OverrideMode = lazy(() => import('./components/OverrideMode'));
const CommandPalette = lazy(() => import('./components/CommandPalette'));
const LogViewer = lazy(() => import('./components/LogViewer'));
const IntelligenceHUD = lazy(() => import('./components/IntelligenceHUD'));
const SocraticStatic = lazy(() => import('./components/SocraticStatic'));
const OrigamiUnicorns = lazy(() => import('./components/OrigamiUnicorns'));
const GitArchaeology = lazy(() => import('./components/GitArchaeology'));
const BaselineGate = lazy(() => import('./components/BaselineGate'));
const BaselineUnlocked = lazy(() =>
  import('./components/BaselineGate').then((m) => ({ default: m.BaselineUnlocked })),
);
const ConsoleHijack = lazy(() => import('./components/ConsoleHijack'));
const LateNight = lazy(() => import('./components/LateNight'));
const SelfDestruct = lazy(() => import('./components/SelfDestruct'));
const Heartbeat = lazy(() => import('./components/Heartbeat'));
const TypingEchoes = lazy(() => import('./components/TypingEchoes'));
const VKInterview = lazy(() => import('./components/VKInterview'));
const Certifications = lazy(() => import('./components/Certifications'));
const NarratorOverlay = lazy(() => import('./components/NarratorOverlay'));
const VisitorDossier = lazy(() => import('./components/VisitorDossier'));
// Behavioral eggs — the shell watches how you move. See
// docs/superpowers/specs/2026-06-23-replicant-eggs-design.md
const WitnessProtocol = lazy(() => import('./components/WitnessProtocol'));
const FalseMemory = lazy(() => import('./components/FalseMemory'));
const MemoryDecay = lazy(() => import('./components/MemoryDecay'));
const TimeSkip = lazy(() => import('./components/TimeSkip'));
const GhostUnits = lazy(() => import('./components/GhostUnits'));
const ExitIntent = lazy(() => import('./components/ExitIntent'));

// If you are reading this source, you are now part of the performance.
// Your devtools are the fourth wall. Congratulations.
// Time remaining: undefined. Time elapsed: yes.

export default function App() {
  const [data, setData] = useState<{
    projects: Project[];
    services: Service[];
    testimonials: Testimonial[];
    awards: Award[];
    publications: Publication[];
    vk: VkQuestion[];
    github: GithubProject[];
    trivia: Trivia[];
    haiku: Haiku[];
    noir: Noir[];
    esper: EsperHotspot[];
    skyline: SkylineSign[];
    designRounds: DesignRound[];
    dossier: WebDossierFact[];
    certifications: Certification[];
    recommendations: LinkedInRecommendation[];
    articles: LinkedInArticle[];
    poems: Poem[];
  } | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const { pathname } = useLocation();
  // Computed once. crypto.randomUUID() is unavailable on iOS Safari < 15.4 and
  // throws there — calling it raw in render would crash the whole app.
  const [pid] = useState(safeUUID);

  useEffect(() => {
    fetchPortfolio().then(setData).catch((e) => console.error('[portfolio] load failed', e));
  }, []);

  // The shell starts watching how you move the moment it wakes.
  useEffect(() => {
    startWitness();
  }, []);

  // Defer all non-critical chunks until the browser is idle. Initial paint
  // ships with just Nav + Hero + Work + the ambient core.
  useEffect(() => {
    const cb = () => setHydrated(true);
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
    if (typeof ric === 'function') {
      const id = ric(cb, { timeout: 400 });
      return () => {
        const cic = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
        if (typeof cic === 'function') cic(id);
      };
    }
    const t = setTimeout(cb, 200);
    return () => clearTimeout(t);
  }, []);

  // Clamp body scrollHeight to actual content. Some fixed/animated overlays
  // were inflating documentElement.scrollHeight by several thousand pixels
  // on mobile, creating phantom blank space below the footer.
  //
  // `pathname` is a dependency so this re-attaches on every route change —
  // without it, navigating from a short page (e.g. a case study) to the
  // tall homepage left the ResizeObserver watching the OLD (now-unmounted)
  // root.firstElementChild, so body.style.height stayed frozen at the short
  // page's height forever, silently capping how far the page could scroll.
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;
    const sync = () => {
      const inner = root.firstElementChild as HTMLElement | null;
      const h = inner?.offsetHeight;
      if (h && h > 0) document.body.style.height = `${h}px`;
    };
    sync();
    const ro = new ResizeObserver(sync);
    const inner = root.firstElementChild;
    if (inner) ro.observe(inner);
    return () => ro.disconnect();
  }, [data, hydrated, pathname]);

  useScrollToHash();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if ((isMeta && e.key.toLowerCase() === 'k') || (e.key === '/' && !isTyping(e))) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        window.dispatchEvent(new CustomEvent('intel:command'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <ErrorBoundary
      label="root"
      fallback={(_err, reset) => (
        <div className="min-h-[100dvh] bg-[#07070a] text-[#e8e4dc] flex flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="font-mono text-sm opacity-70">the shell hit an error. it is still here.</p>
          <button
            onClick={reset}
            className="font-mono text-xs border border-[#e8e4dc]/30 rounded px-4 py-2 hover:bg-[#e8e4dc]/10"
          >
            retry
          </button>
        </div>
      )}
    >
    <NarratorProvider>
    <PersonalizationProvider>
    <Routes>
      <Route path="/work/:slug" element={<CaseStudy />} />
      <Route
        path="/*"
        element={
    <div className="relative min-h-[100dvh] bg-[#07070a] text-[#e8e4dc] overflow-clip" data-pid={pid} data-witness="true" data-last-words="all-those-moments-will-be-lost-in-time">
      <DevtoolsEasterEggs />
      <BootOverlay />
      <CRTOverlay />
      <SessionHUD />

      <AmbientAudio />
      <Nav onOpenPalette={() => setPaletteOpen(true)} />
      <Hero />
      <Work projects={data?.projects ?? []} />
      <SoulLayer />
      <div className="site-rain slow" aria-hidden />
      <div className="site-rain" aria-hidden />
      <div className="site-grain" aria-hidden />

      {hydrated && (
        <ErrorBoundary label="lazy-tree">
        <Suspense fallback={null}>
          <TearsInRain />
          <SystemBreach />
          <NoirSubtitles lines={data?.noir ?? []} />
          <DeadDropConsole poems={data?.poems ?? []} />
          <OverrideMode />
          <SocraticStatic />
          <OrigamiUnicorns />
          <ConsoleHijack />
          <LateNight />
          <SelfDestruct />
          <Heartbeat />
          <TypingEchoes />
          <TimeMachine />
          <VoightKampff questions={data?.vk ?? []} />
          <VKInterview recommendations={data?.recommendations ?? []} />
          <LiveSites />
          <Certifications certs={data?.certifications ?? []} />
          <EsperScene hotspots={data?.esper ?? []} />
          <Manifesto articles={data?.articles ?? []} />
          <BaselineGate>
            <BaselineUnlocked />
            <HumanLayer trivia={data?.trivia ?? []} />
            <HaikuDeck haiku={data?.haiku ?? []} />
          </BaselineGate>
          <IndexList projects={data?.projects ?? []} />
          <Impact />
          <About testimonial={data?.testimonials[0]} />
          <WebDossier facts={data?.dossier ?? []} recommendations={data?.recommendations ?? []} />
          <Services services={data?.services ?? []} />
          <Recognition awards={data?.awards ?? []} publications={data?.publications ?? []} />
          <GitArchaeology />
          <Contact />
          <Footer />
          <CommandPalette
            open={paletteOpen}
            onClose={() => setPaletteOpen(false)}
            projects={data?.projects ?? []}
          />
          <LogViewer />
          <IntelligenceHUD />
          <BlackLitany />
          <NarratorOverlay />
          <VisitorDossier />
          <WitnessProtocol />
          <FalseMemory />
          <MemoryDecay />
          <TimeSkip />
          <GhostUnits />
          <ExitIntent />
          <MobileControlDock />
        </Suspense>
        </ErrorBoundary>
      )}
    </div>
        }
      />
    </Routes>
    </PersonalizationProvider>
    </NarratorProvider>
    </ErrorBoundary>
  );
}

// crypto.randomUUID() is only defined in secure contexts on modern engines and
// throws on iOS Safari < 15.4. Degrade instead of crashing the whole render.
function safeUUID(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `p-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}

function isTyping(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  if (!t) return false;
  const tag = t.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable;
}

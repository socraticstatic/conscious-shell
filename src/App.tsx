import { Suspense, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { lazyWithRetry as lazy, isChunkLoadError } from './lib/lazyWithRetry';
import { ErrorBoundary } from './components/ErrorBoundary';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Work from './components/Work';
import BootOverlay from './components/BootOverlay';
import CaseStudy from './components/CaseStudy';
import { useScrollToHash } from './lib/useScrollToHash';
import { HomeMeta } from './lib/useDocumentMeta';
import { useShellTier } from './lib/shellTier';
import { saveRecoveryScroll } from './lib/recoveryScroll';

import AmbientAudio from './components/AmbientAudio';
import MobileControlDock from './components/MobileControlDock';
import { NarratorProvider } from './lib/narrator';
import { PersonalizationProvider } from './lib/personalization';
import { fetchPortfolio } from './lib/portfolio';
import { startWitness } from './lib/witness';
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
const TearsInRain = lazy(() => import('./components/TearsInRain'), { critical: false });
const BlackLitany = lazy(() => import('./components/BlackLitany'), { critical: false });
const SystemBreach = lazy(() => import('./components/SystemBreach'), { critical: false });
const NoirSubtitles = lazy(() => import('./components/NoirSubtitles'), { critical: false });
const DeadDropConsole = lazy(() => import('./components/DeadDropConsole'));
const EsperScene = lazy(() => import('./components/EsperScene'));
const WebDossier = lazy(() => import('./components/WebDossier'));
const OverrideMode = lazy(() => import('./components/OverrideMode'), { critical: false });
const CommandPalette = lazy(() => import('./components/CommandPalette'));
const LogViewer = lazy(() => import('./components/LogViewer'));
const IntelligenceHUD = lazy(() => import('./components/IntelligenceHUD'), { critical: false });
const SocraticStatic = lazy(() => import('./components/SocraticStatic'), { critical: false });
const OrigamiUnicorns = lazy(() => import('./components/OrigamiUnicorns'), { critical: false });
const GitArchaeology = lazy(() => import('./components/GitArchaeology'));
const BaselineGate = lazy(() => import('./components/BaselineGate'));
const BaselineUnlocked = lazy(() =>
  import('./components/BaselineGate').then((m) => ({ default: m.BaselineUnlocked })),
);
const ConsoleHijack = lazy(() => import('./components/ConsoleHijack'), { critical: false });
const LateNight = lazy(() => import('./components/LateNight'), { critical: false });
const Heartbeat = lazy(() => import('./components/Heartbeat'), { critical: false });
const TypingEchoes = lazy(() => import('./components/TypingEchoes'), { critical: false });
const VKInterview = lazy(() => import('./components/VKInterview'));
const Certifications = lazy(() => import('./components/Certifications'));
const NarratorOverlay = lazy(() => import('./components/NarratorOverlay'), { critical: false });
const VisitorDossier = lazy(() => import('./components/VisitorDossier'), { critical: false });
// Behavioral eggs — the shell watches how you move. See
// docs/superpowers/specs/2026-06-23-replicant-eggs-design.md
const WitnessProtocol = lazy(() => import('./components/WitnessProtocol'), { critical: false });
const FalseMemory = lazy(() => import('./components/FalseMemory'), { critical: false });
const MemoryDecay = lazy(() => import('./components/MemoryDecay'), { critical: false });
const TimeSkip = lazy(() => import('./components/TimeSkip'), { critical: false });
const GhostUnits = lazy(() => import('./components/GhostUnits'), { critical: false });
const ExitIntent = lazy(() => import('./components/ExitIntent'), { critical: false });

// Ambient / desktop-only decoration - the "theater". Full tier only; the
// calm reader never mounts these. See src/lib/shellTier.ts.
const CRTOverlay = lazy(() => import('./components/CRTOverlay'), { critical: false });
const SessionHUD = lazy(() => import('./components/SessionHUD'), { critical: false });
const SoulLayer = lazy(() => import('./components/SoulLayer'), { critical: false });
const DevtoolsEasterEggs = lazy(() => import('./components/DevtoolsEasterEggs'), { critical: false });

// If you are reading this source, you are now part of the performance.
// Your devtools are the fourth wall. Congratulations.
// Time remaining: undefined. Time elapsed: yes.

export default function App() {
  // Inferred from fetchPortfolio so the shape can never drift from what the
  // fetch actually returns (the hand-written copy silently dropped `offers`).
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchPortfolio>> | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const tier = useShellTier();
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
    // pb clears the fixed bottom band (marquee 0-22px, control dock 30-74px)
    // so the last thing on the page - the footer, and the contact form's final
    // fields - can always scroll above the chrome instead of resting under it.
    <div className="relative min-h-[100dvh] bg-[#07070a] text-[#e8e4dc] overflow-clip pb-[calc(88px+env(safe-area-inset-bottom,0px))]" data-pid={pid} data-witness="true" data-last-words="all-those-moments-will-be-lost-in-time">
      <HomeMeta />
      <BootOverlay />

      <AmbientAudio />
      <Nav onOpenPalette={() => setPaletteOpen(true)} />
      <Hero />
      <Work projects={data?.projects ?? []} />
      <div className="site-rain slow" aria-hidden />
      <div className="site-grain" aria-hidden />

      {hydrated && (
        <ErrorBoundary
          label="lazy-tree"
          fallback={(err, reset) => <ChunkFallback error={err} onRetry={reset} />}
        >
        <Suspense fallback={null}>
          <DeadDropConsole poems={data?.poems ?? []} />
          <TimeMachine />
          <VoightKampff questions={data?.vk ?? []} />
          <VKInterview recommendations={data?.recommendations ?? []} />
          <LiveSites />
          <Certifications certs={data?.certifications ?? []} />
          <EsperScene hotspots={data?.esper ?? []} frameLines={data?.esperFrames ?? []} />
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
          <Services services={data?.services ?? []} offers={data?.offers ?? []} />
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
          <MobileControlDock />
        </Suspense>
        </ErrorBoundary>
      )}

      {hydrated && tier === 'full' && (
        <ErrorBoundary label="ambient" fallback={() => null}>
        <Suspense fallback={null}>
          <DevtoolsEasterEggs />
          <CRTOverlay />
          <SessionHUD />
          <SoulLayer />
          <div className="site-rain" aria-hidden />
          <TearsInRain />
          <SystemBreach />
          <NoirSubtitles lines={data?.noir ?? []} />
          <OverrideMode />
          <SocraticStatic />
          <OrigamiUnicorns />
          <ConsoleHijack />
          <LateNight />
          <Heartbeat />
          <TypingEchoes />
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

// Shown in place of the content sections when a critical chunk is gone
// (stale deploy). A reload is already scheduled for the next time the tab
// hides; this button is for the reader who wants it now. The soft "try
// again without reloading" retry only appears for transient render errors -
// React.lazy caches a rejected chunk import, so retrying a stale-chunk
// failure would just re-throw the same cached rejection instantly.
function ChunkFallback({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="px-6 py-16 text-center font-mono">
      <p className="text-sm text-fg-muted">part of the shell failed to load.</p>
      <button
        onClick={() => {
          saveRecoveryScroll();
          window.location.reload();
        }}
        className="mt-4 text-sm border border-fg/30 rounded px-4 py-3 min-h-[44px] hover:bg-fg/10"
      >
        tap to reload
      </button>
      {!isChunkLoadError(error) && (
        <button onClick={onRetry} className="mt-4 ml-3 text-sm text-fg-dim underline min-h-[44px]">
          try again without reloading
        </button>
      )}
    </div>
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

import { lazy, Suspense, useEffect, useState } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import DevtoolsEasterEggs from './components/DevtoolsEasterEggs';
import Work from './components/Work';
import BootOverlay from './components/BootOverlay';
import SessionHUD from './components/SessionHUD';

import AmbientAudio from './components/AmbientAudio';
import CRTOverlay from './components/CRTOverlay';
import SoulLayer from './components/SoulLayer';
import { NarratorProvider } from './lib/narrator';
import { PersonalizationProvider } from './lib/personalization';
import { fetchPortfolio } from './lib/portfolio';
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
const HelenNarrates = lazy(() => import('./components/HelenNarrates'));
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
  } | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    fetchPortfolio().then(setData).catch((e) => console.error('[portfolio] load failed', e));
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
  }, [data, hydrated]);

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
    <NarratorProvider>
    <PersonalizationProvider>
    <div className="relative min-h-[100dvh] bg-[#07070a] text-[#e8e4dc] overflow-clip" data-pid={crypto.randomUUID()} data-witness="true" data-last-words="all-those-moments-will-be-lost-in-time">
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
        <Suspense fallback={null}>
          <TearsInRain />
          <SystemBreach />
          <NoirSubtitles lines={data?.noir ?? []} />
          <DeadDropConsole />
          <OverrideMode />
          <SocraticStatic />
          <OrigamiUnicorns />
          <HelenNarrates />
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
        </Suspense>
      )}
    </div>
    </PersonalizationProvider>
    </NarratorProvider>
  );
}

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
  const tag = t.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable;
}

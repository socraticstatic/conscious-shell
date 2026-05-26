import { useEffect, useState } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import DevtoolsEasterEggs from './components/DevtoolsEasterEggs';
import GithubLab from './components/GithubLab';
import Work from './components/Work';
import VoightKampff from './components/VoightKampff';
import TimeMachine from './components/TimeMachine';
import IndexList from './components/IndexList';
import Impact from './components/Impact';
import Manifesto from './components/Manifesto';
import HumanLayer from './components/HumanLayer';
import HaikuDeck from './components/HaikuDeck';
import About from './components/About';
import Services from './components/Services';
import Recognition from './components/Recognition';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Cursor from './components/Cursor';
import BootOverlay from './components/BootOverlay';
import SessionHUD from './components/SessionHUD';
import BaselineDrift from './components/BaselineDrift';
import TearsInRain from './components/TearsInRain';
import AmbientAudio from './components/AmbientAudio';
import BlackLitany from './components/BlackLitany';
import SystemBreach from './components/SystemBreach';
import NoirSubtitles from './components/NoirSubtitles';
import DeadDropConsole from './components/DeadDropConsole';
import EsperScene from './components/EsperScene';
import AgentBattle from './components/AgentBattle';
import WebDossier from './components/WebDossier';
import OverrideMode from './components/OverrideMode';
import CRTOverlay from './components/CRTOverlay';
import CommandPalette from './components/CommandPalette';
import LogViewer from './components/LogViewer';
import IntelligenceHUD from './components/IntelligenceHUD';
import SocraticStatic from './components/SocraticStatic';
import OrigamiUnicorns from './components/OrigamiUnicorns';
import HelenNarrates from './components/HelenNarrates';
import GitArchaeology from './components/GitArchaeology';
import BaselineGate, { BaselineUnlocked } from './components/BaselineGate';
import ConsoleHijack from './components/ConsoleHijack';
import GhostCursor from './components/GhostCursor';
import LateNight from './components/LateNight';
import SelfDestruct from './components/SelfDestruct';
import Heartbeat from './components/Heartbeat';
import TypingEchoes from './components/TypingEchoes';
import VKInterview from './components/VKInterview';
import Certifications from './components/Certifications';
import SoulLayer from './components/SoulLayer';
import NarratorOverlay from './components/NarratorOverlay';
import VisitorDossier from './components/VisitorDossier';
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
  ArchiveCapture,
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
    archive: ArchiveCapture[];
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

  useEffect(() => {
    fetchPortfolio().then(setData).catch((e) => console.error('[portfolio] load failed', e));
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
  }, [data]);

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
      <Cursor />
      <SessionHUD />
      <BaselineDrift />
      <AmbientAudio />
      <TearsInRain />
      <SystemBreach />
      <NoirSubtitles lines={data?.noir ?? []} />
      <DeadDropConsole />
      <OverrideMode />
      <SocraticStatic />
      <OrigamiUnicorns />
      <HelenNarrates />
      <ConsoleHijack />
      <GhostCursor />
      <LateNight />
      <SelfDestruct />
      <Heartbeat />
      <TypingEchoes />
      <Nav onOpenPalette={() => setPaletteOpen(true)} />
      <Hero />
      <Work projects={data?.projects ?? []} />
      <TimeMachine captures={data?.archive ?? []} />
      <VoightKampff questions={data?.vk ?? []} />
      <VKInterview recommendations={data?.recommendations ?? []} />
      <GithubLab projects={data?.github ?? []} />
      <Certifications certs={data?.certifications ?? []} />
      <EsperScene hotspots={data?.esper ?? []} />
      <AgentBattle initial={(data?.designRounds ?? []).map(toRound)} />
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
      <SoulLayer />
      <div className="site-rain slow" aria-hidden />
      <div className="site-rain" aria-hidden />
      <div className="site-grain" aria-hidden />
      <BlackLitany />
      <NarratorOverlay />
      <VisitorDossier />
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

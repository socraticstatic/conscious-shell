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

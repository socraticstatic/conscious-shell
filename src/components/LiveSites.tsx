import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { SectionHeader } from './Work';

type Site = {
  name: string;
  url: string;
  tagline: string;
  description: string;
  tags: string[];
  thumb: React.ReactNode;
  status: 'live' | 'beta' | 'wip';
  patent?: string;
};


const SITES: Site[] = [
  {
    name: 'Family Roots',
    url: 'https://familyroots.center',
    tagline: 'Your family\'s story, beautifully told.',
    description:
      'A patent-pending dual parent view renders maternal and paternal lineage as a single coherent branching network — not a fan chart, not a flat list. 7 distinct visualizations, AI historian, recipe archive, and migration maps.',
    tags: ['next.js', 'ai', 'genealogy', 'visualization'],
    thumb: <img src="/site-shots/family-roots.webp" alt="Family Roots homepage" className="w-full h-full object-cover" loading="lazy" />,
    patent: 'dual parent view',
    status: 'live',
  },
  {
    name: 'Pen & Paper',
    url: 'https://penpaperandink.app/pens',
    tagline: 'A fountain pen almanac.',
    description:
      'A patent-pending pairing engine models nib flex, paper sizing, ink flow rate, and bleed resistance to predict real-world compatibility before you buy. Thirty years of analog obsession distilled into an algorithm.',
    tags: ['react', 'editorial', 'catalogue', 'design'],
    thumb: <img src="/site-shots/pen-and-paper.webp" alt="Pen & Paper homepage" className="w-full h-full object-cover" loading="lazy" />,
    patent: 'pairing engine',
    status: 'live',
  },
  {
    name: 'GP Sailing',
    url: 'https://socraticstatic.github.io/GPSail/',
    tagline: 'High-speed hydrofoil racing.',
    description:
      'Season 6 live tracker for the F50 foiling catamaran circuit — 13 global venues, race-by-race standings, team profiles, and performance data from the fastest sailing series on water. Tracks the road to the Abu Dhabi Grand Final.',
    tags: ['react', 'sports', 'data', 'live'],
    thumb: <img src="/site-shots/gp-sailing.webp" alt="GP Sailing homepage" className="w-full h-full object-cover" loading="lazy" />,
    status: 'live',
  },
  {
    name: 'Chart System',
    url: 'https://socraticstatic.github.io/Visualizations/',
    tagline: 'Sane and useful color strategies.',
    description:
      'Systematic color design for data visualization from first principles: semantically assigned hues, WCAG 2.1 AA-verified palettes, dark and light modes, and six chart types. For teams who want charts that are readable by design.',
    tags: ['react', 'data-vis', 'color', 'design-system'],
    thumb: <img src="/site-shots/chart-system.webp" alt="Chart System homepage" className="w-full h-full object-cover" loading="lazy" />,
    status: 'live',
  },
];

const STATUS_COLOR: Record<Site['status'], string> = {
  live: '#00d4ff',
  beta: '#e040fb',
  wip: '#a78bfa',
};

export default function LiveSites() {
  return (
    <section id="lab" className="relative py-20 md:py-28 border-b border-[#1f1c17]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">
        <SectionHeader
          path="/lab/sites"
          jp="稼働中"
          count={SITES.length}
          right="deployed · independent products"
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SITES.map((site, i) => (
            <SiteCard key={site.url} site={site} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SiteCard({ site, index }: { site: Site; index: number }) {
  const statusColor = STATUS_COLOR[site.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="group flex flex-col border border-[#1f1c17] bg-[#0b0a08]/60 hover:border-[#2a2620] transition-colors overflow-hidden"
    >
      {/* Thumbnail — fixed aspect ratio, consistent across all cards */}
      <a
        href={site.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block shrink-0 overflow-hidden"
        aria-label={`Visit ${site.name}`}
      >
        <div className="relative overflow-hidden bg-[#07070a]" style={{ aspectRatio: '1200/630' }}>
          <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.03]">
            {site.thumb}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a08]/50 via-transparent to-transparent" />
        </div>
      </a>

      {/* Info — flex column so all cards fill the same height */}
      <div className="flex flex-col flex-1 px-4 py-4">

        {/* Top: status + name + link */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: statusColor }}>
                {site.status}
              </span>
              <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: statusColor }} />
            </div>
            <h3 className="text-[#e8e4dc] font-light text-base leading-tight">{site.name}</h3>
          </div>
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 mt-1 text-[#4a453e] hover:text-[#00d4ff] transition-colors"
            aria-label={`Open ${site.name}`}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Patent badge — renders as empty space when absent so description stays aligned */}
        <div className="mb-2 h-5">
          {site.patent && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#c9a030]/40">
              <span className="text-[8px] tracking-[0.4em] uppercase text-[#c9a030]">patent pending</span>
              <span className="text-[8px] text-[#8a6a10]">·</span>
              <span className="text-[8px] tracking-[0.2em] text-[#a07828]">{site.patent}</span>
            </div>
          )}
        </div>

        {/* Description — grows to fill remaining space */}
        <p className="flex-1 text-[11px] text-[#a8a29e] leading-relaxed">
          {site.description}
        </p>

        {/* Tags + URL — always pinned to bottom */}
        <div className="mt-4">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {site.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[9px] tracking-[0.3em] uppercase border border-[#1f1c17] text-[#6b6660]"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="pt-3 border-t border-[#1f1c17] text-[10px] text-[#4a453e] font-mono truncate">
            {site.url.replace('https://', '')}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

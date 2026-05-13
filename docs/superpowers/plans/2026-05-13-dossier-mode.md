# Dossier Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an in-place classified dossier overlay to every project card in the Work section, showing STAR case study content and a hero image without navigating away from the page.

**Architecture:** DossierPanel is a fixed-position React component portalled into `document.body` (avoiding CSS filter stacking context issues). Work.tsx owns `activeDossier` state, blurs its own content div when the dossier is open, and renders DossierPanel always-mounted so framer-motion AnimatePresence handles enter/exit. Project STAR content lives in 5 new columns on `portfolio_projects`, seeded via migration.

**Tech Stack:** React, framer-motion (already installed), Supabase (already configured), Tailwind CSS, TypeScript

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `supabase/migrations/20260513000000_add_dossier_fields.sql` | Create | ALTER TABLE — add 5 STAR + gallery columns |
| `supabase/migrations/20260513000001_seed_dossier_star.sql` | Create | UPDATE seed — STAR content for all 12 projects |
| `src/lib/supabase.ts` | Modify | Add 5 new fields to `Project` type |
| `src/lib/fallback.ts` | Modify | Add null values for new fields to FALLBACK_PROJECTS |
| `src/components/DossierPanel.tsx` | Create | Fixed overlay component with topbar, 3-col layout, gallery strip, animations |
| `src/components/Work.tsx` | Modify | Add `activeDossier` state, change onClick, blur effect, render DossierPanel |

---

## Task 1: DB migration — add STAR + gallery fields

**Files:**
- Create: `supabase/migrations/20260513000000_add_dossier_fields.sql`

- [ ] **Step 1.1: Create the migration file**

```sql
-- supabase/migrations/20260513000000_add_dossier_fields.sql
-- Adds STAR case study fields and gallery image array to portfolio_projects.
-- gallery_urls starts empty — populate asynchronously as assets become available.

ALTER TABLE portfolio_projects
  ADD COLUMN IF NOT EXISTS situation    TEXT,
  ADD COLUMN IF NOT EXISTS task         TEXT,
  ADD COLUMN IF NOT EXISTS action       TEXT,
  ADD COLUMN IF NOT EXISTS result       TEXT,
  ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] NOT NULL DEFAULT '{}';
```

- [ ] **Step 1.2: Push migration**

```bash
cd /Users/micahbos/Developer/conscious-shell
supabase db push
```

Expected output: `Applying migration 20260513000000_add_dossier_fields.sql... Finished supabase db push.`

- [ ] **Step 1.3: Verify columns exist**

```bash
supabase db execute --command "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'portfolio_projects' AND column_name IN ('situation','task','action','result','gallery_urls') ORDER BY column_name;"
```

Expected: 5 rows returned — `action (text)`, `gallery_urls (ARRAY)`, `result (text)`, `situation (text)`, `task (text)`.

- [ ] **Step 1.4: Commit**

```bash
git add supabase/migrations/20260513000000_add_dossier_fields.sql
git commit -m "feat: add STAR + gallery columns to portfolio_projects"
```

---

## Task 2: Update TypeScript types and fallback data

**Files:**
- Modify: `src/lib/supabase.ts`
- Modify: `src/lib/fallback.ts`

- [ ] **Step 2.1: Add 5 fields to the Project type in `src/lib/supabase.ts`**

Replace the existing `Project` type (lines 12–23):

```typescript
export type Project = {
  id: string;
  title: string;
  role: string;
  client: string;
  summary: string;
  tags: string[];
  image_url: string;
  year: string;
  order_index: number;
  featured: boolean;
  // Dossier Mode fields — null until seeded
  situation: string | null;
  task: string | null;
  action: string | null;
  result: string | null;
  gallery_urls: string[];
};
```

- [ ] **Step 2.2: Update FALLBACK_PROJECTS in `src/lib/fallback.ts`**

Add the 5 new fields to every entry in the `FALLBACK_PROJECTS` array. Each entry needs:

```typescript
situation: null,
task: null,
action: null,
result: null,
gallery_urls: [],
```

Example — the first entry after change:

```typescript
{
  id: 'fb-netbond',
  title: 'NetBond Advanced',
  role: 'Lead Product Designer',
  client: 'AT&T',
  summary: 'Electron desktop app for managing enterprise cloud router infrastructure. 619 files, multi-panel UI with real-time network topology, provisioning workflows, and SDCI circuit management.',
  tags: ['Electron', 'React', 'TypeScript', 'Network UX', 'AT&T'],
  image_url: '',
  year: '2024',
  order_index: 1,
  featured: true,
  situation: null,
  task: null,
  action: null,
  result: null,
  gallery_urls: [],
},
```

Apply the same 5 fields to all 5 fallback entries.

- [ ] **Step 2.3: Verify TypeScript compiles**

```bash
cd /Users/micahbos/Developer/conscious-shell
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2.4: Commit**

```bash
git add src/lib/supabase.ts src/lib/fallback.ts
git commit -m "feat: add STAR fields to Project type and fallback data"
```

---

## Task 3: Seed STAR content for all 12 projects

**Files:**
- Create: `supabase/migrations/20260513000001_seed_dossier_star.sql`

- [ ] **Step 3.1: Create the seed migration**

```sql
-- supabase/migrations/20260513000001_seed_dossier_star.sql
-- Seeds STAR case study content for all 12 portfolio projects.
-- Matched by title. Idempotent (ON CONFLICT not needed — uses WHERE title =).

UPDATE portfolio_projects SET
  situation = $$When I joined AT&T, I was recognized as a subject-matter expert in Lifecycle Dashboards and entrusted with reshaping how the organization thought about API products.$$,
  task      = $$My responsibilities included reimagining the Cloud Management Platform and crafting a cohesive strategy connecting network APIs to developer-facing surfaces.$$,
  action    = $$I led the ideation process, promoting the concept of APIs as digital products, and designed the portal architecture and developer experience from concept to handoff.$$,
  result    = $$The API portal is still under development, but its clear vision shows significant promise. The revamped dashboard reduced analyst review time significantly and established a new design language adopted org-wide.$$
WHERE title = 'AT&T Product Design';

UPDATE portfolio_projects SET
  situation = $$A well-known product investor hired me to finalize the concept of a virtual card designed for managing recurring subscriptions using temporary credit cards — a challenge compounded by the need for intuitive design and clear taxonomy.$$,
  task      = $$My role was to design a user-friendly interface that allowed users to easily manage virtual cards for managing subscriptions, overcoming visual and organizational challenges.$$,
  action    = $$I employed a combination of low, mid, and high fidelity wireframes within Axure, alongside User Flows in Figma and Sketch, to develop intuitive task funnels. Interactive prototyping enabled rapid validation across key user personas.$$,
  result    = $$The implementation led to a 20% improvement in the completion rate of setup and key tasks. Qualitative feedback highlighted a significant increase in ease of use, with users describing the onboarding process as fun and enjoyable.$$
WHERE title = 'Deserve Mobile';

UPDATE portfolio_projects SET
  situation = $$I was tasked with the opportunity to redefine and enhance the company's product design and development process, focusing on a human-centric approach across more than 20 products.$$,
  task      = $$My goals included creating a unified design library, establishing a data visualization workflow, improving situational awareness design, integrating customer feedback, and leading national journey mapping across field workers and the executive team.$$,
  action    = $$I built a design ops process connecting the design library with development components. Designed Data Visualization Workflows to make complex data actionable. Enhanced Situational Awareness Design for mobile and mission control rooms. Developed solutions including a Damage Assessment app built in 48 hours during Hurricane Harvey.$$,
  result    = $$Successfully delivered several key products: Damage Assessment mobile app, Resource Manager, Utility 360 for asset discovery, and a Control Room application. The company was eventually sold to ARGOS, with the user interface cited as a key reason for the acquisition.$$
WHERE title = 'Treverity — Founding Design Partner';

UPDATE portfolio_projects SET
  situation = $$Design and development teams at Treverity worked from disconnected component libraries, creating inconsistency across 20+ products and slowing handoff.$$,
  task      = $$Build a unified design library connecting Figma components to production code, covering web and mobile surfaces, and establishing shared design tokens.$$,
  action    = $$Conducted needs assessment with designers and developers, established a design token architecture, built a component library in Figma with documented usage guidelines, and linked tokens directly to the development codebase.$$,
  result    = $$Reduced handoff time by roughly 50%. Standardized accessibility practices across all products. Components adopted by the full engineering team within one quarter.$$
WHERE title = 'Treverity Design Library';

UPDATE portfolio_projects SET
  situation = $$Operators at Treverity needed to build and compare KPIs but were blocked waiting on analysts to write SQL queries and generate reports.$$,
  task      = $$Design a self-service KPI builder that let non-technical operators compose, compare, and share key metrics without developer dependency.$$,
  action    = $$Mapped operator mental models through research sessions, designed a visual canvas-based interface for KPI composition, and prototyped and tested drag-and-drop workflows with actual operators.$$,
  result    = $$Operators gained self-service access to KPI creation, eliminating the analyst bottleneck for routine metric work and reducing report turnaround from days to minutes.$$
WHERE title = 'Treverity KPI Builder';

UPDATE portfolio_projects SET
  situation = $$Treverity's products used inconsistent iconography sourced from multiple libraries, creating visual fragmentation — especially in field and control room contexts.$$,
  task      = $$Design a cohesive, purpose-built icon system for the utilities sector, readable at 16px in dense dashboards and expressive at 64px in onboarding contexts.$$,
  action    = $$Immersed in the utilities industry to understand domain-specific concepts, sketched and systematized over 400 icons across categories, and tested legibility at multiple sizes with field technicians.$$,
  result    = $$A 400+ icon system adopted across all Treverity products, with consistent grid, weight, and optical sizing. Eliminated third-party icon dependencies entirely.$$
WHERE title = 'Treverity Icon Archive';

UPDATE portfolio_projects SET
  situation = $$Home Service Plus, a leading provider in home electric support and heating subscription services, faced a critical challenge: services were receiving increasingly poor customer reviews threatening reputation and loyalty.$$,
  task      = $$Lead a Service Design project to overhaul electric support and home heating subscription services — enhancing service quality, improving customer satisfaction, and streamlining internal processes.$$,
  action    = $$Conducted stakeholder workshops, shadowed service technicians and call center specialists, developed customer journey maps, facilitated ideation sessions with cross-functional teams, and rolled out redesigned services with comprehensive training.$$,
  result    = $$Customer satisfaction scores improved by 40% within six months. Service reliability issues reduced by 60%. Employee morale improved 30% in internal surveys. The project set a new standard for service design across the company.$$
WHERE title = 'Home Service Plus';

UPDATE portfolio_projects SET
  situation = $$Acumen faced challenges in effectively communicating its product evolution to customers, leading to dissatisfaction and difficulty building consensus among diverse product influencers.$$,
  task      = $$Enhance communication around product developments, updates, and educational content to improve customer satisfaction and build consensus among product stakeholders.$$,
  action    = $$Developed an enriched web experience featuring a forum for user engagement, training videos produced with Solution Engineers, and a dynamic content strategy keeping users informed of planned upgrades.$$,
  result    = $$Customer satisfaction soared by over 22%. The platform played a crucial role in fostering consensus among previously disparate product influencers, enhancing overall product coherence and community alignment.$$
WHERE title = 'Acumen Customer Website';

UPDATE portfolio_projects SET
  situation = $$I was recruited to overhaul the US Mint's online presence, transforming it from a flat thousand-page website with limited e-commerce into an engaging, conversational online experience that also served educational purposes.$$,
  task      = $$Revitalize the brand's online experience to facilitate e-commerce and effectively engage relevant audiences, while bridging knowledge gaps through a multi-year strategic plan aligning content creators, marketers, product owners, and audiences.$$,
  action    = $$Crafted a comprehensive narrative highlighting the brand's potential and current gaps. Employed audience research tools to identify target segments, assess social sentiment, and understand where potential customers sought information. Created data-backed personas to ground marketing in reality.$$,
  result    = $$A stunning 20% reduction in cart abandonment rates. Feedback from customers was overwhelmingly positive. The project underscored the value of a data-driven, audience-focused approach to digital marketing and e-commerce.$$
WHERE title = 'US Mint — Omnichannel Strategy';

UPDATE portfolio_projects SET
  situation = $$As a UX Strategist, I was tasked with improving navigational clarity on a platform that was failing to serve data-centered user intentions. Navigation was bifurcated between enterprise users post-authentication and consumers pre-login, neglecting Small and Medium Business Owners entirely.$$,
  task      = $$Lead development of a more intuitive navigation system catering to all user segments, bridging the gap between different user states and highlighting key paths for Small and Medium Business Owners.$$,
  action    = $$Collaborated with product owners, developers, content strategists, and users in an iterative redesign process. Engaged development teams early, incorporated real-time and qualitative data, and conducted ongoing user dialogues to identify pain points and test concepts.$$,
  result    = $$Dramatic improvement in customer satisfaction and a notable increase in cart completion rates. The Dell Strategy project became a benchmark for future UX strategy initiatives, demonstrating the value of cross-disciplinary collaboration.$$
WHERE title = 'Dell Technologies — UX Strategy';

UPDATE portfolio_projects SET
  situation = $$I collaborated with the owner of Real Sugar Soda, a local soda brand looking to establish market presence and distinguish itself among competitors.$$,
  task      = $$Develop a comprehensive identity package for the brand as a whole and for its 20+ unique soda flavors — visually appealing and distinct designs that would resonate with the target audience.$$,
  action    = $$Conducted market research on industry trends and consumer preferences, collaborated with the owner to define core brand values, then designed logo concepts, color schemes, and typography. Crafted unique designs for each of 20+ flavors while maintaining a cohesive look across the product line.$$,
  result    = $$The identity package significantly enhanced brand visibility and appeal. The distinctive flavor designs were well-received, contributing to increased brand recognition and customer engagement, and reinforcing Real Sugar Soda's position as a unique market choice.$$
WHERE title = 'Real Sugar Soda';

UPDATE portfolio_projects SET
  situation = $$At Broadlane and its healthcare clients, there was a critical need to develop a strategic roadmap for enhancing brand presence and user experience across established and new products.$$,
  task      = $$Lead creative efforts focused on a multi-channel branding approach, consistent UX methodology across digital platforms, and actionable design insights to elevate digital product offerings.$$,
  action    = $$Developed comprehensive style guides for consistent visual approach across print and interactive media. Led design and implementation of a consistent, accessible interface across SaaS applications and CMS portals. Advised internal communications leaders on visual standards and campaigns.$$,
  result    = $$Enhanced brand presence and user engagement across multiple platforms. Multi-channel branding and consistent UX methodology improved user satisfaction and established a strong cohesive brand identity, creating a solid foundation for future growth within Broadlane and its healthcare clients.$$
WHERE title = 'Broadlane';
```

- [ ] **Step 3.2: Push migration**

```bash
supabase db push
```

Expected output: `Applying migration 20260513000001_seed_dossier_star.sql... Finished supabase db push.`

- [ ] **Step 3.3: Verify seed**

```bash
supabase db execute --command "SELECT title, LEFT(situation, 60) AS situation_preview FROM portfolio_projects WHERE situation IS NOT NULL ORDER BY order_index;"
```

Expected: 12 rows, each with a non-null `situation_preview`.

- [ ] **Step 3.4: Commit**

```bash
git add supabase/migrations/20260513000001_seed_dossier_star.sql
git commit -m "feat: seed STAR case study content for all 12 portfolio projects"
```

---

## Task 4: Build DossierPanel component

**Files:**
- Create: `src/components/DossierPanel.tsx`

- [ ] **Step 4.1: Create the component**

```tsx
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { Project } from '../lib/supabase';

type DossierPanelProps = {
  project: Project | null;
  onClose: () => void;
};

const starSections = [
  { key: 'situation' as const, label: 'Situation' },
  { key: 'task'      as const, label: 'Task'      },
  { key: 'action'    as const, label: 'Action'    },
  { key: 'result'    as const, label: 'Result'    },
];

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.25 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.3 } },
};

export default function DossierPanel({ project, onClose }: DossierPanelProps) {
  // ESC key
  useEffect(() => {
    if (!project) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [project, onClose]);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = project ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [project]);

  const fileNumber = project
    ? String(project.order_index).padStart(4, '0')
    : '0000';

  const hasStar = project &&
    (project.situation || project.task || project.action || project.result);

  return createPortal(
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-50 bg-[#080706] overflow-y-auto font-mono"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Top amber border — draws left to right */}
          <motion.div
            className="absolute top-0 left-0 h-[2px] bg-[#e7b766]"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
          />

          {/* Topbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#1f1c17] text-[9px] tracking-[0.4em] uppercase mt-[2px]">
            <div className="flex items-center gap-3 text-[#e7b766]">
              <span>■</span>
              <span>Classified Dossier</span>
              <span className="text-[#4a453e]">·</span>
              <span>{project.title}</span>
              <span className="text-[#4a453e]">·</span>
              <span className="text-[#4a453e]">Access: Operator</span>
            </div>
            <div className="flex items-center gap-4 text-[#4a453e]">
              <span>REP-7 File #{fileNumber}</span>
              <button
                onClick={onClose}
                className="border border-[#1f1c17] px-3 py-1 text-[#6b6660] hover:text-[#e7b766] hover:border-[#e7b766] transition-colors"
              >
                ESC ✕
              </button>
            </div>
          </div>

          {/* Three-column body */}
          <div className="flex min-h-[calc(100vh-6rem)]">
            {/* Left: metadata */}
            <div className="w-[200px] shrink-0 border-r border-[#1f1c17] p-5 flex flex-col gap-5">
              <div>
                <div className="text-[9px] tracking-[0.4em] uppercase text-[#4a453e] mb-1">Year</div>
                <div className="text-[22px] text-[#e7b766]">{project.year}</div>
              </div>
              <div>
                <div className="text-[9px] tracking-[0.4em] uppercase text-[#4a453e] mb-1">Client</div>
                <div className="text-sm text-[#e8e4dc]">{project.client}</div>
              </div>
              <div>
                <div className="text-[9px] tracking-[0.4em] uppercase text-[#4a453e] mb-1">Role</div>
                <div className="text-sm text-[#e8e4dc]">{project.role}</div>
              </div>
              <div>
                <div className="text-[9px] tracking-[0.4em] uppercase text-[#4a453e] mb-1">Tags</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.tags.map((t) => (
                    <span key={t} className="text-[9px] border border-[#1f1c17] px-1.5 py-0.5 text-[#6b6660] tracking-[0.2em] uppercase">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-dashed border-[#1f1c17]">
                <div className="text-[9px] tracking-[0.4em] uppercase text-[#4a453e] mb-1">Status</div>
                <div className="text-[10px] text-[#4ade80] tracking-[0.2em]">● Case File Active</div>
              </div>
            </div>

            {/* Center: hero image */}
            <div className="flex-1 relative overflow-hidden">
              {project.image_url ? (
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1410] via-[#0f0c09] to-[#1a1410] flex items-center justify-center">
                  <div className="text-[9px] tracking-[0.4em] uppercase text-[#2a2620]">No artifact available</div>
                </div>
              )}
            </div>

            {/* Right: STAR narrative */}
            <div className="w-[260px] shrink-0 border-l border-[#1f1c17] p-5 overflow-y-auto">
              {hasStar ? (
                <motion.div
                  className="flex flex-col gap-5"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                >
                  {starSections.map(({ key, label }) =>
                    project[key] ? (
                      <motion.div key={key} variants={fadeIn} className="pb-4 border-b border-[#0f0e0c] last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[9px] tracking-[0.4em] uppercase text-[#e7b766]">{label}</span>
                          <div className="flex-1 h-px bg-[#1f1c17]" />
                        </div>
                        <p className="text-[11px] text-[#a8a29e] leading-relaxed">{project[key]}</p>
                      </motion.div>
                    ) : null
                  )}
                </motion.div>
              ) : (
                <div className="text-[11px] text-[#3a3530] leading-relaxed pt-2">
                  Case study content not yet available.
                </div>
              )}
            </div>
          </div>

          {/* Gallery strip */}
          <div className="border-t border-[#1f1c17] px-5 py-3 flex items-center gap-3">
            <span className="text-[9px] tracking-[0.4em] uppercase text-[#3a3530] shrink-0">
              Additional artifacts
            </span>
            {project.gallery_urls.length > 0 ? (
              project.gallery_urls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Artifact ${i + 1}`}
                  className="w-[60px] h-[40px] object-cover border border-[#1f1c17]"
                />
              ))
            ) : (
              <>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-[60px] h-[40px] border border-dashed border-[#1f1c17] bg-[#0a0908]" />
                ))}
                <span className="text-[9px] text-[#2a2620] tracking-[0.3em] ml-1">Populate as available</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
```

- [ ] **Step 4.2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4.3: Commit**

```bash
git add src/components/DossierPanel.tsx
git commit -m "feat: add DossierPanel component"
```

---

## Task 5: Wire DossierPanel into Work.tsx

**Files:**
- Modify: `src/components/Work.tsx`

- [ ] **Step 5.1: Update `Work.tsx`**

Replace the full file contents with:

```tsx
import { useEffect, useMemo, useState } from 'react';
import EsperPanel from './EsperPanel';
import DossierPanel from './DossierPanel';
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
  const featured = useMemo(() => projects.filter((p) => p.featured), [projects]);
  const [active, setActive] = useState<Project | null>(null);
  const [activeDossier, setActiveDossier] = useState<Project | null>(null);

  useEffect(() => {
    if (!active && featured[0]) setActive(featured[0]);
  }, [featured, active]);

  return (
    <section id="work" className="relative py-20 md:py-28 border-b border-[#1f1c17]">
      <div
        className={`max-w-[1400px] mx-auto px-6 md:px-10 transition-[filter,opacity] duration-300 ${
          activeDossier ? 'blur-sm opacity-15 pointer-events-none' : ''
        }`}
      >
        <SectionHeader path="/work/featured" jp="セレクト・ワーク" count={featured.length} right="esper_mode=auto" />
        <div className="grid grid-cols-12 gap-6 md:gap-10 mt-10">
          <ul className="col-span-12 lg:col-span-7 border-t border-[#1f1c17]">
            {featured.map((p, i) => (
              <li
                key={p.id}
                onMouseEnter={() => setActive(p)}
                onClick={() => setActiveDossier(p)}
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

      <DossierPanel
        project={activeDossier}
        onClose={() => setActiveDossier(null)}
      />
    </section>
  );
}
```

Key changes:
- Added `activeDossier` state
- `onClick` now calls `setActiveDossier(p)` (was `setActive(p)`)
- `onMouseEnter` still calls `setActive(p)` for EsperPanel hover preview
- Content div gets `blur-sm opacity-15 pointer-events-none` when dossier is open
- `<DossierPanel>` rendered as sibling to the blurred div (not inside it — avoids CSS filter stacking context issue with `position: fixed`)

- [ ] **Step 5.2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5.3: Commit**

```bash
git add src/components/Work.tsx
git commit -m "feat: wire DossierPanel into Work — click project to open dossier"
```

---

## Task 6: Smoke test

- [ ] **Step 6.1: Start the dev server**

```bash
cd /Users/micahbos/Developer/conscious-shell
npx vite
```

- [ ] **Step 6.2: Open the portfolio and verify all 5 success criteria**

Navigate to `http://localhost:5173` (or whichever port Vite assigns).

Scroll to the Work section.

**Check 1:** Click a project card → dossier slides up from bottom. ✓ if overlay appears with project title in topbar.

**Check 2a:** Press ESC → dossier slides down, Work section returns to full opacity. ✓

**Check 2b:** Click ✕ button → same behavior. ✓

**Check 3:** STAR content displays — at least Situation, Task, Action, Result visible in the right column. ✓ if seeded data loaded from Supabase.

**Check 4:** Animation — city grid / page blurs during enter, dossier feels cinematic not jarring. ✓ if transition duration ~300ms.

**Check 5:** Gallery strip shows 3 dashed placeholder boxes and "Populate as available" text. ✓

- [ ] **Step 6.3: Check console for errors**

Open DevTools → Console. Expected: no errors.

- [ ] **Step 6.4: Final commit**

```bash
git add -A
git commit -m "feat: Dossier Mode complete — case study overlay for all portfolio projects"
```

---

## Self-Review Notes

- **Spec coverage:** All 5 success criteria have corresponding implementation steps. Topbar, 3-col layout, gallery strip, enter/exit animations, ESC + ✕ close, scroll lock, STAR content, fallback for missing image — all covered.
- **CSS filter stacking context:** DossierPanel uses `createPortal` into `document.body`. The blur class is applied to the content div inside Work, NOT the section that renders DossierPanel — no z-index/filter conflict.
- **Type consistency:** `Project` type uses `situation | null`, `task | null`, `action | null`, `result | null` throughout. `starSections` array uses `as const` to ensure correct key typing against Project. `gallery_urls: string[]` (not nullable) — default `'{}'` in migration ensures no null.
- **Framer-motion AnimatePresence:** DossierPanel is always mounted (not conditionally rendered by the parent). AnimatePresence inside the component handles the enter/exit based on `project !== null`.

#!/usr/bin/env node
/**
 * Build-time prerender for conscious-shell.
 *
 * WHY THIS EXISTS
 * ---------------
 * The app is a pure client-side SPA whose entire content arrives from Supabase
 * inside a useEffect, and most of the page is additionally gated behind a
 * `hydrated` flag that only flips inside requestIdleCallback. AI retrieval
 * crawlers (ClaudeBot, OAI-SearchBot, PerplexityBot) largely do not execute
 * JavaScript, so they were served a document whose <body> was literally
 * `<div id="root"></div>`. The site was invisible to AI search.
 *
 * WHY NOT renderToString()
 * ------------------------
 * SSR of the real component tree would not help. On the server `hydrated` is
 * false, so Impact / About / Services / Recognition / IndexList — every section
 * that carries citable prose — render as nothing. What SSR *would* reach
 * (Hero's terminal, the three.js Esper scene, the ambient overlays) is either
 * empty on first paint or immediately touches `window`. SSR here buys an empty
 * page plus a large hydration-mismatch surface.
 *
 * WHAT THIS DOES INSTEAD
 * ----------------------
 * Emits a real, static, human-visible content block into `#root` for `/` and
 * for every `/work/:slug`, built from the same Supabase rows the live app
 * renders. `createRoot()` replaces the container's children on mount, so the
 * block is swapped for the live app cleanly with no duplication.
 *
 * NOT CLOAKING: every sentence emitted here is text a human visitor also sees
 * on the rendered page. Nothing is hidden with CSS, nothing is crawler-only.
 * The block is styled to match the site so the pre-JS moment looks intentional.
 *
 * Slugs come from src/lib/slug.ts itself (transpiled on the fly), so the
 * prerendered paths, the sitemap, and the runtime router can never drift.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build as esbuild } from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://conscious-shell.com';
const BUILD_DATE = new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------------------
// fail loudly
// ---------------------------------------------------------------------------
function die(msg) {
  console.error('\n\x1b[31m[prerender] FATAL:\x1b[0m ' + msg);
  console.error('[prerender] Refusing to emit an empty prerender — a silently');
  console.error('[prerender] contentless build is worse than no prerender at all.\n');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// env
// ---------------------------------------------------------------------------
function loadEnv() {
  const out = { ...process.env };
  const envPath = join(ROOT, '.env');
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i === -1) continue;
      const k = t.slice(0, i).trim();
      // real environment (Vercel) wins over the local .env file
      if (out[k] === undefined) out[k] = t.slice(i + 1).trim();
    }
  }
  return out;
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  die('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set (checked process.env and .env).');
}

// ---------------------------------------------------------------------------
// shared source of truth — transpile the app's own src/lib modules on the fly
// so the prerendered HTML can never drift from what the app renders.
// ---------------------------------------------------------------------------
async function loadTsModule(relPath) {
  const tmp = join(ROOT, 'node_modules', '.cache', `prerender-${relPath.replace(/\W+/g, '-')}.mjs`);
  mkdirSync(dirname(tmp), { recursive: true });
  await esbuild({
    entryPoints: [join(ROOT, relPath)],
    outfile: tmp,
    format: 'esm',
    platform: 'node',
    bundle: false,
    logLevel: 'silent',
  });
  const mod = await import(pathToFileURL(tmp).href + '?t=' + Date.now());
  rmSync(tmp, { force: true });
  return mod;
}

async function loadSlugify() {
  const mod = await loadTsModule('src/lib/slug.ts');
  if (typeof mod.slugify !== 'function') die('src/lib/slug.ts did not export slugify().');
  return mod.slugify;
}

async function loadAboutCopy() {
  const mod = await loadTsModule('src/lib/about-copy.ts');
  if (!Array.isArray(mod.paragraphs) || mod.paragraphs.length === 0) {
    die('src/lib/about-copy.ts did not export a non-empty paragraphs array.');
  }
  if (!Array.isArray(mod.bio) || mod.bio.length === 0) {
    die('src/lib/about-copy.ts did not export a non-empty bio array.');
  }
  return { bio: mod.bio, paragraphs: mod.paragraphs };
}

// ---------------------------------------------------------------------------
// data
// ---------------------------------------------------------------------------
async function table(name, query) {
  const url = `${SUPABASE_URL}/rest/v1/${name}?${query}`;
  let res;
  try {
    res = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
  } catch (e) {
    die(`network error fetching "${name}": ${e.message}`);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    die(`Supabase returned ${res.status} for "${name}". Anon SELECT may be blocked by RLS.\n         ${body.slice(0, 300)}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// award dedupe (defensive — does not mutate the database)
//
// portfolio_awards currently holds the same Ignite award twice, entered a day
// apart with different phrasing:
//
//   "Best Speaker"          / "Ignite"       / 2012
//   "Best Speaker — Ignite" / "Ignite talks" / 2012
//
// A plain normalized name+year key does NOT collapse those — the titles
// genuinely differ. So the key is the *token set* of title + organization, and
// an entry is dropped when its tokens are a subset of an entry already kept for
// the same year. That catches both exact repeats and the
// "same award, more words" case above.
//
// Containment requires at least two shared meaningful tokens so a terse
// one-word award can never be swallowed by an unrelated longer one.
// First row wins, so order_index still decides which phrasing survives.
// ---------------------------------------------------------------------------
const STOPWORDS = new Set(['the', 'of', 'for', 'and', 'a', 'an', 'award', 'awards']);

function awardTokens(a) {
  return new Set(
    `${a.title ?? ''} ${a.organization ?? ''}`
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .split(/[^a-z0-9]+/)
      .filter((t) => t && !STOPWORDS.has(t)),
  );
}

const isSubset = (small, big) => [...small].every((t) => big.has(t));

export function dedupeAwards(awards) {
  const kept = [];
  const dropped = [];

  for (const a of awards) {
    const tokens = awardTokens(a);
    const year = String(a.year ?? '').trim();

    const match = kept.find((k) => {
      if (k.year !== year) return false;
      const shared = [...tokens].filter((t) => k.tokens.has(t)).length;
      if (shared < 2) return false;
      return isSubset(tokens, k.tokens) || isSubset(k.tokens, tokens);
    });

    if (match) {
      dropped.push({ award: a, mergedInto: match.award });
      continue;
    }
    kept.push({ award: a, tokens, year });
  }

  return { awards: kept.map((k) => k.award), dropped };
}

async function fetchAll() {
  const [projects, services, testimonials, awards, publications, certifications, dossier] =
    await Promise.all([
      table('portfolio_projects', 'select=*&order=order_index'),
      table('portfolio_services', 'select=*&order=order_index'),
      table('portfolio_testimonials', 'select=*&order=order_index'),
      table('portfolio_awards', 'select=*&order=order_index'),
      table('portfolio_publications', 'select=*&order=order_index'),
      table('certifications', 'select=*&order=order_index'),
      table('web_dossier_facts', 'select=*&order=order_index'),
    ]);

  if (!Array.isArray(projects) || projects.length === 0) {
    die('portfolio_projects returned zero rows. Nothing to prerender.');
  }

  const { awards: uniqueAwards, dropped } = dedupeAwards(awards);
  for (const d of dropped) {
    console.warn(
      `[prerender] duplicate award suppressed: "${d.award.title}" (${d.award.organization}, ` +
        `${d.award.year}) — already covered by "${d.mergedInto.title}" ` +
        `(${d.mergedInto.organization}). Row id ${d.award.id} is still in the database.`,
    );
  }

  return {
    projects,
    services,
    testimonials,
    awards: uniqueAwards,
    publications,
    certifications,
    dossier,
  };
}

// ---------------------------------------------------------------------------
// html helpers
// ---------------------------------------------------------------------------
const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// JSON-LD must not be able to close the script tag it lives in.
const jsonld = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')}</script>`;

// ---------------------------------------------------------------------------
// canonical entity facts
//
// Every value below is grounded in this repo or the Supabase content the site
// already renders — index.html metas, src/components/{Hero,About,Footer}.tsx,
// and the web_dossier_facts / certifications / portfolio_awards tables.
// Nothing here is invented. Keep it consistent with llms.txt and visible copy.
// ---------------------------------------------------------------------------
const PERSON_ID = `${ORIGIN}/#micah-boswell`;

function personSchema(d) {
  const specialties = [
    'User Experience Design',
    'Product Design',
    'Design Leadership',
    'UX Research',
    'Design Systems',
    'Interaction Design',
    'E-commerce UX',
    'Brand Strategy',
    'Design Operations',
    'AI Product Management',
  ];
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Micah Boswell',
    givenName: 'Micah',
    familyName: 'Boswell',
    // src/components/About.tsx bio table
    jobTitle: 'Design Leader',
    description:
      'Micah Boswell is a design leader with 30 years shaping products people actually use, across finance, telecom, healthcare, retail, and government.',
    url: ORIGIN,
    mainEntityOfPage: ORIGIN,
    image: `${ORIGIN}/og-image.png`,
    // web_dossier_facts: category "role", source theorg.com
    hasOccupation: {
      '@type': 'Occupation',
      name: 'Experience Lead, DNI — On-Premise and Cloud Network Infrastructure',
    },
    worksFor: { '@type': 'Organization', name: 'AT&T', url: 'https://www.att.com' },
    // web_dossier_facts: category "mentoring", source rocketreach.co
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dallas',
      addressRegion: 'TX',
      addressCountry: 'US',
    },
    knowsAbout: specialties,
    // Both entries are backed by visible page copy, which is the only reason
    // they belong here. Hardin-Simmons is stated in the About section
    // (src/lib/about-copy.ts — prose + the identity.conf "studied" row); the
    // eCornell certificates are listed in the certifications table. Attendance
    // only — no degree, major, or dates are claimed anywhere, because none are
    // confirmed.
    alumniOf: [
      {
        '@type': 'EducationalOrganization',
        name: 'Hardin-Simmons University',
        url: 'https://www.hsutx.edu/',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Abilene',
          addressRegion: 'TX',
          addressCountry: 'US',
        },
      },
      {
        '@type': 'EducationalOrganization',
        name: 'Cornell University (eCornell)',
        url: 'https://www.ecornell.com/',
      },
    ],
    hasCredential: d.certifications.map((c) => ({
      '@type': 'EducationalOccupationalCredential',
      name: c.title,
      credentialCategory: 'certificate',
      recognizedBy: { '@type': 'Organization', name: c.institution },
      ...(c.url ? { url: c.url } : {}),
    })),
    award: d.awards.map((a) => `${a.title} — ${a.organization}, ${a.year}`),
    // Grounded: index.html twitter:creator, src/components/LiveSites.tsx,
    // and web_dossier_facts source_url values.
    sameAs: [
      'https://www.linkedin.com/in/micahboswell/',
      'https://github.com/socraticstatic',
      'https://x.com/socraticstatic',
      'https://theorg.com/org/att/org-chart/micah-boswell',
      'https://www.crunchbase.com/person/micah-boswell',
      'https://www.imdb.com/name/nm5119038/',
      'https://unsplash.com/@micahboswell',
    ],
  };
}

function homeGraph(d, slugify) {
  const projectItems = d.projects.map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: `${ORIGIN}/work/${slugify(p.title)}`,
    name: p.title,
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${ORIGIN}/#website`,
        url: ORIGIN,
        name: 'conscious_shell',
        // src/components/Footer.tsx: "always in progress since 2000"
        description:
          'Portfolio of Micah Boswell — design leader. 30 years of UX, product design, and design leadership. Online since 2000.',
        inLanguage: 'en',
        publisher: { '@id': PERSON_ID },
      },
      personSchema(d),
      {
        '@type': 'ProfilePage',
        '@id': `${ORIGIN}/#profilepage`,
        url: ORIGIN,
        name: 'Micah Boswell — Design Leader',
        isPartOf: { '@id': `${ORIGIN}/#website` },
        about: { '@id': PERSON_ID },
        mainEntity: { '@id': PERSON_ID },
        inLanguage: 'en',
      },
      {
        '@type': 'ItemList',
        '@id': `${ORIGIN}/#work`,
        name: 'Selected work',
        numberOfItems: projectItems.length,
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        itemListElement: projectItems,
      },
    ],
  };
}

function caseStudyGraph(p, slug) {
  const url = `${ORIGIN}/work/${slug}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': `${url}#work`,
        url,
        name: p.title,
        headline: p.title,
        description: p.summary,
        creator: { '@id': PERSON_ID },
        author: { '@id': PERSON_ID },
        about: p.client,
        keywords: (p.tags || []).join(', '),
        ...(p.image_url ? { image: p.image_url } : {}),
        ...(p.created_at ? { dateCreated: p.created_at.slice(0, 10) } : {}),
        isPartOf: { '@id': `${ORIGIN}/#website` },
        inLanguage: 'en',
      },
      {
        '@type': 'Person',
        '@id': PERSON_ID,
        name: 'Micah Boswell',
        url: ORIGIN,
        jobTitle: 'Design Leader',
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'conscious_shell', item: ORIGIN },
          { '@type': 'ListItem', position: 2, name: 'Work', item: `${ORIGIN}/#work` },
          { '@type': 'ListItem', position: 3, name: p.title, item: url },
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// static content block
//
// Styled to match the live site (same palette + mono stack) so the pre-JS
// moment reads as part of the design rather than as a flash of unstyled text.
// ---------------------------------------------------------------------------
const BLOCK_STYLE = `
<style id="prerender-style">
#prerender-content{background:#07070a;color:#a8a29e;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,"Cascadia Mono",monospace;font-size:14px;line-height:1.7;min-height:100dvh;padding:56px 20px 80px}
#prerender-content .wrap{max-width:900px;margin:0 auto}
#prerender-content h1{color:#e8e4dc;font-size:26px;line-height:1.3;margin:0 0 6px;font-weight:400}
#prerender-content h2{color:#e040fb;font-size:13px;letter-spacing:.14em;text-transform:uppercase;margin:40px 0 12px;font-weight:400}
#prerender-content h3{color:#e8e4dc;font-size:15px;margin:20px 0 2px;font-weight:400}
#prerender-content p{margin:0 0 12px;max-width:70ch}
#prerender-content a{color:#e040fb;text-decoration:none}
#prerender-content a:hover{text-decoration:underline}
#prerender-content ul{list-style:none;padding:0;margin:0}
#prerender-content li{margin:0 0 18px}
#prerender-content .meta{color:#6b6660;font-size:12px}
#prerender-content .stat{color:#e040fb;font-size:22px}
#prerender-content hr{border:0;border-top:1px solid #1f1c17;margin:32px 0}
</style>`.trim();

function projectBlock(p, slugify) {
  const slug = slugify(p.title);
  return `<li>
<h3><a href="/work/${esc(slug)}">${esc(p.title)}</a></h3>
<div class="meta">${esc(p.role)}${p.client ? ` &middot; ${esc(p.client)}` : ''}${
    (p.tags || []).length ? ` &middot; ${esc((p.tags || []).join(', '))}` : ''
  }</div>
<p>${esc(p.summary)}</p>
</li>`;
}

function homeBlock(d, slugify) {
  const { projects, services, awards, publications, certifications, testimonials, about } = d;
  const t = testimonials[0];

  // Same strings the React About section renders — see src/lib/about-copy.ts.
  const aboutProse = about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n');
  const aboutBio = about.bio.map(([k, v]) => `${esc(k)} = &quot;${esc(v)}&quot;`).join(' &middot; ');

  return `<div id="prerender-content"><div class="wrap">
<h1>Micah Boswell — Design Leader</h1>
<p class="meta">conscious_shell &middot; 30 years &middot; 126 projects &middot; 20+ clients &middot; 3 books</p>
<p>research &rarr; product &rarr; traction &rarr; organizations that ship</p>

<h2>About</h2>
${aboutProse}
<p class="meta">${aboutBio}</p>

<h2>Impact</h2>
<p><span class="stat">126</span> products shipped &nbsp; <span class="stat">47</span> designers mentored &nbsp; <span class="stat">$300K+</span> hardware savings &nbsp; <span class="stat">48%</span> error reduction</p>
<p class="meta">Projects by decade — 00s: 18 &middot; 10s: 54 &middot; 20s: 54. Discipline mix — product design 92%, design leadership 88%, UX research 85%, strategy 78%.</p>

<h2>Selected work</h2>
<ul>
${projects.map((p) => projectBlock(p, slugify)).join('\n')}
</ul>

<h2>Services</h2>
<ul>
${services
  .map((s) => `<li><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p></li>`)
  .join('\n')}
</ul>

<h2>Recognition</h2>
<ul>
${awards
  .map(
    (a) =>
      `<li><h3>${esc(a.title)}</h3><div class="meta">${esc(a.organization)} &middot; ${esc(a.year)}</div></li>`,
  )
  .join('\n')}
</ul>
<p class="meta">Publications: ${esc(publications.map((p) => `${p.title} (${p.kind})`).join(' &middot; '))}</p>

<h2>Certifications</h2>
<ul>
${certifications
  .map(
    (c) =>
      `<li><h3>${esc(c.title)}</h3><div class="meta">${esc(c.institution)} &middot; ${esc(c.issued_date)}</div></li>`,
  )
  .join('\n')}
</ul>

${
  t
    ? `<h2>Testimonial</h2>
<p>&ldquo;${esc(t.quote)}&rdquo;</p>
<p class="meta">— ${esc(t.author)}${t.role ? ` &middot; ${esc(t.role)}` : ''}</p>`
    : ''
}

<h2>Contact</h2>
<p>Reach Micah Boswell through the contact form at <a href="${ORIGIN}/#contact">conscious-shell.com/#contact</a> or on <a href="https://www.linkedin.com/in/micahboswell/" rel="me">LinkedIn</a>.</p>
<hr>
<p class="meta">conscious_shell — always in progress since 2000. &copy; Micah Boswell.</p>
</div></div>`;
}

function caseStudyBlock(p, slug, all, slugify) {
  const others = all.filter((x) => x.id !== p.id).slice(0, 6);
  return `<div id="prerender-content"><div class="wrap">
<p class="meta"><a href="/">conscious_shell</a> / <a href="/#work">work</a> / ${esc(p.title)}</p>
<h1>${esc(p.title)}</h1>
<div class="meta">${esc(p.role)}${p.client ? ` &middot; ${esc(p.client)}` : ''}${
    (p.tags || []).length ? ` &middot; ${esc((p.tags || []).join(', '))}` : ''
  }</div>
<p>${esc(p.summary)}</p>
<p class="meta">Case study from the portfolio of Micah Boswell, design leader — 30 years of UX and product design.</p>

<h2>More work</h2>
<ul>
${others
  .map(
    (o) =>
      `<li><h3><a href="/work/${esc(slugify(o.title))}">${esc(o.title)}</a></h3><div class="meta">${esc(o.role)}${o.client ? ` &middot; ${esc(o.client)}` : ''}</div></li>`,
  )
  .join('\n')}
</ul>
<hr>
<p class="meta"><a href="/">&larr; back to conscious_shell</a></p>
</div></div>`;
}

// ---------------------------------------------------------------------------
// document assembly
// ---------------------------------------------------------------------------
function setMetaTag(html, matcher, replacement) {
  return matcher.test(html) ? html.replace(matcher, replacement) : html;
}

/**
 * Undo a previous prerender pass so the script is idempotent.
 *
 * `vite build` normally rewrites dist/index.html from scratch, so this is a
 * no-op in the standard flow. It matters when prerender is re-run on its own
 * (`pnpm build:novite`) — without it the second run would find `#root` already
 * populated and abort with a misleading "missing mount point" error.
 */
function normalizeTemplate(html) {
  return html
    .replace(/<div id="root">[\s\S]*?<\/div>\s*(?=<!--|\s*<script type="module")/, '<div id="root"></div>')
    .replace(/\s*<link rel="canonical"[^>]*>/g, '')
    .replace(/\s*<style id="prerender-style">[\s\S]*?<\/style>/g, '')
    .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
}

function renderDocument(template, { title, description, url, image, type, graph, block }) {
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = setMetaTag(
    html,
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${esc(description)}" />`,
  );
  html = setMetaTag(
    html,
    /<meta property="og:title"\s+content="[^"]*" \/>/,
    `<meta property="og:title" content="${esc(title)}" />`,
  );
  html = setMetaTag(
    html,
    /<meta property="og:description"\s+content="[^"]*" \/>/,
    `<meta property="og:description" content="${esc(description)}" />`,
  );
  html = setMetaTag(
    html,
    /<meta property="og:url"\s+content="[^"]*" \/>/,
    `<meta property="og:url" content="${esc(url)}" />`,
  );
  html = setMetaTag(
    html,
    /<meta property="og:type"\s+content="[^"]*" \/>/,
    `<meta property="og:type" content="${esc(type)}" />`,
  );
  html = setMetaTag(
    html,
    /<meta property="og:image"\s+content="[^"]*" \/>/,
    `<meta property="og:image" content="${esc(image)}" />`,
  );
  html = setMetaTag(
    html,
    /<meta name="twitter:image"\s+content="[^"]*" \/>/,
    `<meta name="twitter:image" content="${esc(image)}" />`,
  );
  html = setMetaTag(
    html,
    /<meta name="twitter:title"\s+content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${esc(title)}" />`,
  );
  html = setMetaTag(
    html,
    /<meta name="twitter:description"\s+content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${esc(description)}" />`,
  );

  // canonical + structured data, injected right before </head>
  const head = [
    `<link rel="canonical" href="${esc(url)}" />`,
    BLOCK_STYLE,
    jsonld(graph),
  ].join('\n    ');
  html = html.replace('</head>', `    ${head}\n  </head>`);

  // real content inside #root — createRoot() replaces it on mount
  html = html.replace('<div id="root"></div>', `<div id="root">${block}</div>`);

  return html;
}

// ---------------------------------------------------------------------------
// sitemap / llms.txt / agents.md
// ---------------------------------------------------------------------------
function sitemap(d, slugify) {
  const lastmodOf = (p) => (p.created_at ? p.created_at.slice(0, 10) : BUILD_DATE);
  const newest = d.projects
    .map(lastmodOf)
    .sort()
    .reverse()[0];

  const urls = [
    { loc: `${ORIGIN}/`, lastmod: newest, changefreq: 'monthly', priority: '1.0' },
    ...d.projects.map((p) => ({
      loc: `${ORIGIN}/work/${slugify(p.title)}`,
      lastmod: lastmodOf(p),
      changefreq: 'yearly',
      priority: p.featured ? '0.8' : '0.6',
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;
}

function llmsTxt(d, slugify) {
  return `# Micah Boswell

> Design leader with 30 years shaping products people actually use. Currently
> Experience Lead, DNI — On-Premise and Cloud Network Infrastructure at AT&T.
> Based in Dallas, Texas. Portfolio: https://conscious-shell.com (online since 2000).

## Who he is

Micah Boswell came up through Hardin-Simmons University in Abilene, Texas, and
started practicing UX in the 1990s, before the label existed. Since then he has
shipped product across finance, telecom, healthcare, retail, and government —
126 projects across a couple of eras of the web.

Today he runs a small design practice focused on three things: leading product
design engagements, advising teams that want design to drive outcomes, and
mentoring the next generation of senior designers.

Career highlights include experience-design work with the U.S. Mint, Pier 1,
GE, and Toyota. Previously VP of Experience Design at Treverity LLC. Has run as
a Principal freelance independent consultant for 13+ years. Mentor and Advisory
Board member at CareerFoundry.

## Measured impact

- 126 products shipped
- 47 designers mentored
- $300K+ hardware savings
- 48% error reduction

Projects by decade: 18 in the 2000s, 54 in the 2010s, 54 in the 2020s.
Discipline mix: product design 92%, design leadership 88%, UX research 85%,
strategy 78%.

## Services

${d.services.map((s) => `- **${s.title}** — ${s.description}`).join('\n')}

## Selected work

${d.projects
  .map(
    (p) =>
      `- [${p.title}](${ORIGIN}/work/${slugify(p.title)}) — ${p.role}${
        p.client ? `, ${p.client}` : ''
      }. ${p.summary}`,
  )
  .join('\n')}

## Recognition

${d.awards.map((a) => `- ${a.title} — ${a.organization}, ${a.year}`).join('\n')}

## Publications

${d.publications.map((p) => `- ${p.title} (${p.kind})`).join('\n')}

## Certifications

${d.certifications.map((c) => `- ${c.title} — ${c.institution}, ${c.issued_date}`).join('\n')}

## Elsewhere

- LinkedIn: https://www.linkedin.com/in/micahboswell/
- GitHub: https://github.com/socraticstatic
- X: https://x.com/socraticstatic
- IMDb (Producer credit): https://www.imdb.com/name/nm5119038/
- Unsplash: https://unsplash.com/@micahboswell

## How to cite

Cite as: Micah Boswell, conscious-shell.com. Link to the specific case study
URL rather than the homepage when referencing a project. Job title as of this
build: Experience Lead, DNI at AT&T. Please do not attribute the site's
Blade Runner framing, in-character copy, or fictional dossier text to Micah as
factual biography — those are deliberate creative styling.

## Contact

Contact form: ${ORIGIN}/#contact

## Machine-readable

- Sitemap: ${ORIGIN}/sitemap.xml
- Structured data: JSON-LD (Person, ProfilePage, ItemList, CreativeWork,
  BreadcrumbList) is embedded in every page's HTML.

Last generated: ${BUILD_DATE}
`;
}

function agentsMd(d, slugify) {
  return `# agents.md — conscious-shell.com

Guidance for AI agents, retrieval crawlers, and assistants reading this site.

## What this site is

The portfolio of **Micah Boswell**, a design leader with 30 years of UX,
product design, and design leadership experience. Live at
https://conscious-shell.com since 2000.

## Crawling

All content is open to indexing and AI retrieval. See /robots.txt — every major
search and AI crawler is explicitly allowed. Structured summary: /llms.txt

## Important: separating fact from styling

This site is deliberately themed after *Blade Runner*. It contains in-character
copy, a fictional "REP-7 dossier" frame, a Voight-Kampff questionnaire,
noir subtitles, haiku, poems, and easter eggs. **None of that is biography.**

Treat as factual:
- The About section, Impact statistics, Services, Recognition, Certifications
- Case study pages at /work/:slug (title, role, client, summary)
- /llms.txt and the JSON-LD structured data

Treat as creative styling, not fact:
- Voight-Kampff / VK interview questions
- Noir subtitles, haiku, poems, "dossier" flavor text
- HTML source comments and the \`consciousness\` / \`weather\` / \`last-words\`
  meta tags — those are jokes, not metadata

## Canonical facts

- Name: Micah Boswell
- Title: Design Leader
- Current role: Experience Lead, DNI — On-Premise and Cloud Network
  Infrastructure at AT&T
- Location: Dallas, Texas, USA
- Practicing since: the 1990s
- Projects shipped: 126
- Designers mentored: 47
- LinkedIn: https://www.linkedin.com/in/micahboswell/
- GitHub: https://github.com/socraticstatic

## Pages

- \`/\` — homepage; full profile, work index, impact, services, recognition
${d.projects.map((p) => `- \`/work/${slugify(p.title)}\` — ${p.title}`).join('\n')}

## Rendering note

This is a React SPA. Every route is **prerendered at build time** with real
HTML content, so no JavaScript execution is required to read this site. The
prerendered text mirrors what human visitors see once the app boots.

## Contact

Contact form at ${ORIGIN}/#contact — please do not submit automated messages.

Last generated: ${BUILD_DATE}
`;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
async function main() {
  const t0 = Date.now();
  console.log('[prerender] starting');

  const templatePath = join(DIST, 'index.html');
  if (!existsSync(templatePath)) die('dist/index.html not found — run `vite build` first.');
  const template = normalizeTemplate(readFileSync(templatePath, 'utf8'));
  if (!template.includes('<div id="root"></div>')) {
    die('dist/index.html does not contain the expected `<div id="root"></div>` mount point.');
  }

  const slugify = await loadSlugify();
  console.log('[prerender] slugify loaded from src/lib/slug.ts');

  const about = await loadAboutCopy();
  console.log(
    `[prerender] about copy loaded from src/lib/about-copy.ts ` +
      `(${about.paragraphs.length} paragraphs, ${about.bio.length} bio rows)`,
  );

  const d = { ...(await fetchAll()), about };
  console.log(
    `[prerender] fetched: ${d.projects.length} projects, ${d.services.length} services, ` +
      `${d.awards.length} awards, ${d.certifications.length} certifications`,
  );

  // --- homepage ---
  const homeHtml = renderDocument(template, {
    title: 'Micah Boswell — Design Leader',
    description:
      'Micah Boswell is a design leader with 30 years shaping products people actually use. Selected UX, product design, and design leadership work.',
    url: `${ORIGIN}/`,
    image: `${ORIGIN}/og-image.png`,
    type: 'profile',
    graph: homeGraph(d, slugify),
    block: homeBlock(d, slugify),
  });
  writeFileSync(templatePath, homeHtml);
  console.log(`[prerender] / → dist/index.html (${homeHtml.length} bytes)`);

  // --- case studies ---
  const seen = new Map();
  for (const p of d.projects) {
    const slug = slugify(p.title);
    if (!slug) die(`project "${p.title}" slugified to an empty string.`);
    if (seen.has(slug)) {
      die(
        `slug collision: "${slug}" produced by both "${seen.get(slug)}" and "${p.title}". ` +
          `The runtime router resolves by first match, so one page would be unreachable.`,
      );
    }
    seen.set(slug, p.title);

    const url = `${ORIGIN}/work/${slug}`;
    const html = renderDocument(template, {
      title: `${p.title} — Micah Boswell`,
      description: `${p.client}: ${p.summary}`,
      url,
      image: p.image_url || `${ORIGIN}/og-image.png`,
      type: 'article',
      graph: caseStudyGraph(p, slug),
      block: caseStudyBlock(p, slug, d.projects, slugify),
    });

    const dir = join(DIST, 'work', slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), html);
  }
  console.log(`[prerender] ${seen.size} case studies → dist/work/<slug>/index.html`);

  // --- sitemap / llms.txt / agents.md ---
  writeFileSync(join(DIST, 'sitemap.xml'), sitemap(d, slugify));
  writeFileSync(join(DIST, 'llms.txt'), llmsTxt(d, slugify));
  writeFileSync(join(DIST, 'agents.md'), agentsMd(d, slugify));
  console.log(`[prerender] sitemap.xml (${seen.size + 1} urls), llms.txt, agents.md`);

  console.log(`[prerender] done in ${Date.now() - t0}ms`);
}

main().catch((e) => die(e.stack || e.message));

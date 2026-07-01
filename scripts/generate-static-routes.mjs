#!/usr/bin/env node
// Post-build step: generates a per-case-study static HTML page under
// dist/work/<slug>/index.html (real crawlable title/description/OG tags +
// visible text content, hydrated by the same SPA bundle) and rewrites
// dist/sitemap.xml to include every case-study route.
//
// Why: this is a client-only Vite SPA with no SSR/SSG pipeline. React
// Router gives every case study its own URL, but a bare `dist/` only has
// one index.html — a crawler landing on /work/some-slug/ before this
// script runs would get the homepage's generic <title>/<meta> and (if it
// doesn't wait for JS) no case-study-specific text at all. This script
// closes that gap by writing real per-route HTML at build time, using
// live data from Supabase (the same source the client fetches at runtime).
//
// Known limitation: this is NOT full SSG/SSR. It fetches current data
// once, at build time, and freezes it into static HTML. If project data
// changes in Supabase between deploys, the static shell goes briefly
// stale until the next build — the client-side app is still the source
// of truth once JS hydrates. There's no per-route pre-rendering for
// anything past the case-study list (no server, no headless-browser
// render), so Googlebot's JS-render pass is still what covers the rest of
// the interactive homepage experience.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const SITE_URL = 'https://conscious-shell.com';

function loadEnv() {
  // Prefer already-exported env (CI sets these as real env vars);
  // fall back to reading .env directly for local runs.
  if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
    return {
      url: process.env.VITE_SUPABASE_URL,
      key: process.env.VITE_SUPABASE_ANON_KEY,
    };
  }
  const envPath = join(ROOT, '.env');
  const raw = readFileSync(envPath, 'utf8');
  const vars = Object.fromEntries(
    raw
      .split('\n')
      .filter((l) => l.includes('='))
      .map((l) => {
        const i = l.indexOf('=');
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      }),
  );
  return { url: vars.VITE_SUPABASE_URL, key: vars.VITE_SUPABASE_ANON_KEY };
}

// Same slugify as src/lib/slug.ts — kept in sync by hand since this script
// runs outside the Vite/TS toolchain. If you change one, change both.
function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeXml(s) {
  return escapeHtml(s);
}

async function main() {
  const { url, key } = loadEnv();
  if (!url || !key) {
    console.error('[static-routes] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — skipping.');
    process.exit(1);
  }

  // Plain REST call, not the supabase-js client: this script only ever does
  // one anonymous read, so the client's realtime/auth machinery (which pulls
  // in @supabase/realtime-js and needs a native WebSocket — absent on the
  // Node 20 CI runner, present only from Node 22) is dead weight we don't
  // need and shouldn't depend on.
  const restUrl =
    `${url}/rest/v1/portfolio_projects` +
    `?select=id,title,role,client,summary,tags,image_url,order_index` +
    `&order=order_index.asc`;
  const res = await fetch(restUrl, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const projects = res.ok ? await res.json() : null;
  const error = res.ok ? null : new Error(`${res.status} ${await res.text()}`);

  if (error) {
    console.error('[static-routes] Supabase fetch failed:', error.message);
    process.exit(1);
  }

  console.log(`[static-routes] ${projects.length} case studies fetched.`);

  const template = readFileSync(join(DIST, 'index.html'), 'utf8');

  const seen = new Map(); // slug -> title, to catch collisions
  const routes = [];

  for (const p of projects) {
    const slug = slugify(p.title);
    if (seen.has(slug)) {
      console.warn(
        `[static-routes] slug collision: "${slug}" used by both "${seen.get(slug)}" and "${p.title}" — skipping duplicate.`,
      );
      continue;
    }
    seen.set(slug, p.title);
    routes.push({ slug, project: p });
  }

  for (const { slug, project } of routes) {
    const routeUrl = `${SITE_URL}/work/${slug}/`;
    const title = `${project.title} — Micah Boswell`;
    const description = `${project.client}: ${project.summary}`.slice(0, 300);
    const image = project.image_url || `${SITE_URL}/og-image.png`;

    let html = template;

    // <title>
    html = html.replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`);

    // meta description
    html = html.replace(
      /<meta name="description" content=".*?" \/>/,
      `<meta name="description" content="${escapeHtml(description)}" />`,
    );

    // OG tags
    html = html
      .replace(/<meta property="og:title"\s+content=".*?" \/>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
      .replace(/<meta property="og:description"\s+content=".*?" \/>/, `<meta property="og:description" content="${escapeHtml(description)}" />`)
      .replace(/<meta property="og:type"\s+content=".*?" \/>/, `<meta property="og:type" content="article" />`)
      .replace(/<meta property="og:url"\s+content=".*?" \/>/, `<meta property="og:url" content="${escapeHtml(routeUrl)}" />`)
      .replace(/<meta property="og:image"\s+content=".*?" \/>/, `<meta property="og:image" content="${escapeHtml(image)}" />`)
      .replace(/<meta name="twitter:image"\s+content=".*?" \/>/, `<meta name="twitter:image" content="${escapeHtml(image)}" />`);

    // Canonical link — insert before </head> if not already present in template
    if (!html.includes('rel="canonical"')) {
      html = html.replace('</head>', `    <link rel="canonical" href="${escapeHtml(routeUrl)}" />\n  </head>`);
    }

    // Seed real, crawlable text content into #root. The client bundle
    // replaces this on hydration (React reconciles over it); until then,
    // a crawler that doesn't execute JS — or times out its JS budget —
    // still sees the title, client, role, summary, and tags as real text.
    const seedHtml = `
      <main>
        <h1>${escapeHtml(project.title)}</h1>
        <p><strong>${escapeHtml(project.client)}</strong> — ${escapeHtml(project.role)}</p>
        <p>${escapeHtml(project.summary)}</p>
        ${project.tags?.length ? `<ul>${project.tags.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>` : ''}
        <p><a href="/">Back to conscious_shell — Micah Boswell, Design Leader</a></p>
      </main>
    `.trim();
    html = html.replace('<div id="root"></div>', `<div id="root">${seedHtml}</div>`);

    const outDir = join(DIST, 'work', slug);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'index.html'), html);
  }

  console.log(`[static-routes] Wrote ${routes.length} static case-study pages under dist/work/*/index.html`);

  // Rewrite sitemap.xml with homepage + every case-study route.
  const urlEntries = [
    `  <url>\n    <loc>${SITE_URL}/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
    ...routes.map(
      ({ slug }) =>
        `  <url>\n    <loc>${SITE_URL}/work/${escapeXml(slug)}/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
    ),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries.join('\n')}\n</urlset>\n`;
  writeFileSync(join(DIST, 'sitemap.xml'), sitemap);
  console.log(`[static-routes] sitemap.xml updated with ${urlEntries.length} urls.`);
}

main().catch((err) => {
  console.error('[static-routes] Failed:', err);
  process.exit(1);
});

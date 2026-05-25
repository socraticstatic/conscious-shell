#!/usr/bin/env node
// Parses LinkedIn data export → linkedin_recommendations.json + linkedin_articles.json.
// Reads from a directory passed as first arg (defaults to /tmp/linkedin).
// Personal data; never commit the output files alongside the export.

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';

const SRC = process.argv[2] || '/tmp/linkedin';
const OUT = process.argv[3] || join(process.cwd(), 'scripts', 'seed-out');
mkdirSync(OUT, { recursive: true });

function parseCsv(text) {
  const rows = [];
  let i = 0, field = '', row = [], inQuotes = false;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 2; continue; }
      if (c === '"') { inQuotes = false; i++; continue; }
      field += c; i++;
    } else {
      if (c === '"') { inQuotes = true; i++; continue; }
      if (c === ',') { row.push(field); field = ''; i++; continue; }
      if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
      if (c === '\r') { i++; continue; }
      field += c; i++;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const headers = rows.shift();
  return rows.filter(r => r.length === headers.length).map(r => Object.fromEntries(headers.map((h, idx) => [h, r[idx]])));
}

// "12/03/24, 05:09 PM" → "2024-12-03"
function normalizeDate(s) {
  if (!s) return null;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (!m) return null;
  let [, mm, dd, yy] = m;
  if (yy.length === 2) yy = '20' + yy;
  return `${yy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n /g, '\n')
    .trim();
}

function tagArticle(slug, title, body) {
  const t = (title + ' ' + body.slice(0, 800)).toLowerCase();
  const tags = [];
  if (/\bai\b|artificial intelligence|machine learning|llm|agent/.test(t)) tags.push('ai');
  if (/\bux\b|user experience|usability|interface design/.test(t)) tags.push('ux');
  if (/method|framework|process|workshop|research/.test(t)) tags.push('method');
  if (/strategy|leadership|organization|culture|business/.test(t)) tags.push('strategy');
  if (/philosophy|ethic|consciousness|human|empathy|meaning/.test(t)) tags.push('philosophy');
  if (/sustainab|climate|environment/.test(t)) tags.push('sustainability');
  if (/career|mentor|hiring|skill/.test(t)) tags.push('practice');
  return tags.length ? tags : ['essay'];
}

function inferRelationship(combined) {
  const t = combined.toLowerCase();
  if (/\bmentor\b|mentee|mentored|career\s*foundry|designlab|bootcamp|student/.test(t)) return 'mentee';
  if (/\bvp\b|director|head of|chief|founder|ceo|president/.test(t)) return 'peer';
  if (/intern|junior/.test(t)) return 'report';
  if (/partner|client|consultant|together|collaborat/.test(t)) return 'colleague';
  return 'colleague';
}

function traitsFromText(text) {
  const t = text.toLowerCase();
  const traits = [];
  if (/empath|kind|patient|listen|caring|support|encourag|positiv|believ.*potential/.test(t)) traits.push('empathy');
  if (/strategi|data|rigor|analyt|systematic|frame|methodical|logic|clarity/.test(t)) traits.push('logic');
  if (/creativ|insight|original|innovat|imagin|craft|design.*think/.test(t)) traits.push('creativity');
  if (/honest|direct|candid|transparent|integrity|truth/.test(t)) traits.push('honesty');
  if (/depth|complex|nuance|hard|challenge|edge/.test(t)) traits.push('darkness');
  return traits.length ? traits : ['empathy'];
}

function firstSentence(text, maxLen = 200) {
  const s = text.replace(/\s+/g, ' ').trim();
  const m = s.match(/^.{20,200}?[.!?](?=\s|$)/);
  return (m ? m[0] : s.slice(0, maxLen)).trim();
}

function dateFromFilename(name) {
  const m = name.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

function dateFromHtml(html) {
  // LinkedIn export embeds: <p class="published">Published on YYYY-MM-DD HH:MM</p>
  const pub = html.match(/class="published">Published on (\d{4})-(\d{2})-(\d{2})/);
  if (pub) return `${pub[1]}-${pub[2]}-${pub[3]}`;
  const created = html.match(/class="created">Created on (\d{4})-(\d{2})-(\d{2})/);
  if (created) return `${created[1]}-${created[2]}-${created[3]}`;
  return null;
}

function readingMinutes(text) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

const INTERCEPT_LINES_BY_TAG = {
  ai: 'signal carried something that wasn\'t carbon. transmitter unknown.',
  ux: 'broadcast traced to a control room. operator wanted you to notice.',
  method: 'recovered from a clean-room frequency. method instructions intact.',
  strategy: 'received during a strategic decay window. content survived.',
  philosophy: 'intercepted as light, returned as question.',
  sustainability: 'signal carried a long shadow. duration outlasts the source.',
  practice: 'broadcast from a workshop with the door open.',
  essay: 'caught between channels. no station claimed it.',
};

function interceptLine(tags) {
  for (const t of tags) {
    if (INTERCEPT_LINES_BY_TAG[t]) return INTERCEPT_LINES_BY_TAG[t];
  }
  return INTERCEPT_LINES_BY_TAG.essay;
}

// ────────────────────────────────────────────────────────────────────────────
// Parse recommendations
// ────────────────────────────────────────────────────────────────────────────
const recsCsv = readFileSync(join(SRC, 'Recommendations_Received.csv'), 'utf8');
const recs = parseCsv(recsCsv).filter(r => r.Status === 'VISIBLE' && r.Text && r.Text.length > 50);

const recommendations = recs.map((r, i) => {
  const text = r.Text.trim();
  const name = `${r['First Name'].trim()} ${r['Last Name'].trim()}`.trim();
  const role = [r['Job Title'], r.Company].filter(Boolean).map(s => s.trim()).join(' · ');
  return {
    recommender_name: name,
    recommender_role: role,
    recommendation_text: text,
    excerpt: firstSentence(text),
    relationship: inferRelationship(role + ' ' + text),
    traits_signal: traitsFromText(text),
    given_date: normalizeDate(r['Creation Date']),
    order_index: i * 10,
  };
}).filter(r => r.given_date);

writeFileSync(join(OUT, 'linkedin_recommendations.json'), JSON.stringify(recommendations, null, 2));
console.log(`recommendations: ${recommendations.length} rows`);

// ────────────────────────────────────────────────────────────────────────────
// Parse articles
// ────────────────────────────────────────────────────────────────────────────
const articlesDir = join(SRC, 'Articles', 'Articles');
const files = readdirSync(articlesDir).filter(f => f.endsWith('.html'));

const articles = files.map((f, i) => {
  const html = readFileSync(join(articlesDir, f), 'utf8');
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? stripTags(titleMatch[1]).trim() : f.replace(/\.html$/, '').replace(/-/g, ' ');
  const body = stripTags(html.replace(/<title[\s\S]*?<\/title>/i, ''));
  const slug = f.replace(/\.html$/, '').replace(/^[\d\- :_.]+/, '');
  const date = dateFromHtml(html) || dateFromFilename(f) || '2020-01-01';
  const tags = tagArticle(slug, title, body);
  // Find first real paragraph for excerpt — skip nav/header noise and date lines
  const paragraphs = body.split(/\n{2,}/)
    .map(p => p.trim())
    .filter(p => p.length > 60 && !/^Created on|^Published on/.test(p) && p !== title);
  const excerpt = paragraphs[0] ? paragraphs[0].slice(0, 220) : title;
  return {
    slug,
    title,
    published_date: date,
    excerpt,
    intercept_line: interceptLine(tags),
    body_markdown: paragraphs.join('\n\n'),
    tags,
    reading_minutes: readingMinutes(body),
    order_index: i * 10,
  };
}).sort((a, b) => b.published_date.localeCompare(a.published_date))
  .map((a, i) => ({ ...a, order_index: i * 10 }));

writeFileSync(join(OUT, 'linkedin_articles.json'), JSON.stringify(articles, null, 2));
console.log(`articles: ${articles.length} rows`);

// Print summary
console.log('\nRec date range:', recommendations[recommendations.length - 1]?.given_date, '→', recommendations[0]?.given_date);
console.log('Article date range:', articles[articles.length - 1]?.published_date, '→', articles[0]?.published_date);
console.log('\nSample rec:', JSON.stringify(recommendations[0], null, 2));
console.log('\nSample article (no body):', JSON.stringify({ ...articles[0], body_markdown: articles[0].body_markdown.slice(0, 200) + '...' }, null, 2));

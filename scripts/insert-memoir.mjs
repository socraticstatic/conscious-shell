#!/usr/bin/env node
// One-off: insert the Amy M / Steve H memoir as a linkedin_articles row.

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = 'dilmngykgewoysydkagu';
if (!TOKEN) { console.error('SUPABASE_ACCESS_TOKEN not set'); process.exit(1); }

const body = `"Amy M and Steve H" snuck into my code to mock me in the mid-90s. Even though I had mentored Steve, he took an opportunity to ... show himself, and his girlfriend, that they lacked the comradery and egalitarianism that the rest of us learned through Freenet.

I forgive the mockery, but I don't forget, Steve Holland.`;

const sql = `
INSERT INTO linkedin_articles
  (slug, title, published_date, excerpt, intercept_line, body_markdown, tags, reading_minutes, order_index)
VALUES (
  'field-note-mid-90s-freenet-two-names',
  'Field Note: mid-90s, freenet, two names',
  '2026-05-25',
  'A short note about being mocked, in your own code, by people you mentored — and the long memory that makes forgiveness an act of will rather than amnesia.',
  'intercepted from a freenet node long since gone dark. signal still warm. recipient still here.',
  $body$${body}$body$,
  '["memoir","personal"]'::jsonb,
  1,
  -5
)
ON CONFLICT (slug) DO UPDATE SET
  body_markdown = EXCLUDED.body_markdown,
  excerpt = EXCLUDED.excerpt,
  intercept_line = EXCLUDED.intercept_line,
  published_date = EXCLUDED.published_date,
  title = EXCLUDED.title;
`;

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: sql }),
});
const text = await res.text();
console.log(res.status, text);

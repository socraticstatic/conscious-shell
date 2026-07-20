// Canonical About copy.
//
// This lives here rather than inside About.tsx because scripts/prerender.mjs
// emits the same prose into the static HTML and into llms.txt. When the copy
// was duplicated in both places it could silently drift, and the schema.org
// Person claims (alumniOf, jobTitle) are only defensible while the visible
// page actually says the same thing. One source, transpiled on the fly by the
// prerender step — same trick as src/lib/slug.ts.

export const bio: [string, string][] = [
  ['name', 'Micah Boswell'],
  ['title', 'Design Leader'],
  ['practicing_since', '1990s'],
  ['studied', 'Hardin-Simmons University'],
  ['based', 'earth / remote'],
  ['output', 'product · research · leadership'],
  ['fuel', 'yerba mate'],
];

export const paragraphs: string[] = [
  'I came up through Hardin-Simmons University in Abilene, Texas, and started practicing UX in the 1990s, before the label existed. Since then I have shipped product across finance, telecom, healthcare, retail, and government — through 126 projects and a couple of eras of the web.',
  'Today I run a small design practice focused on three things: leading product design engagements, advising teams that want design to drive outcomes, and mentoring the next generation of senior designers.',
];

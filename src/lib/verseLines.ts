// Single lines from Micah's actual poems (the poems table is the source of
// record; these are embedded so they can appear before any fetch resolves —
// loading states, the 404, places where the archive holds its breath).
// Never invent a line. Add only lines that exist in a poem.
export const VERSE_LINES = [
  'In Lima, we learned to flinch young.',
  'Dreams are fulfilled in pieces',
  'and the tide took our secrets',
  'I’ve walked life like a long, broken road,',
  'it bars you from your own meaning.',
  'that love isn’t possession.',
  'The ones in the dark corner of the nightclub',
] as const;

export function verseLine(): string {
  return VERSE_LINES[Math.floor(Math.random() * VERSE_LINES.length)];
}

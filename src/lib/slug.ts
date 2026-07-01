// Deterministic slug derivation for case-study routes.
// No DB column required — the slug is a pure function of the title,
// so /work/:slug is stable as long as titles don't change.

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function findBySlug<T extends { title: string }>(items: T[], slug: string): T | undefined {
  return items.find((p) => slugify(p.title) === slug);
}

import {
  supabase,
  type Project, type Service, type Testimonial,
  type Award, type Publication, type VkQuestion,
  type ArchiveCapture, type GithubProject, type Trivia,
  type Haiku, type Noir, type EsperHotspot, type SkylineSign,
  type DesignRound, type WebDossierFact,
} from './supabase';

async function q<T>(table: string, opts: { order: string; asc?: boolean; limit?: number } = { order: 'order_index' }): Promise<T[]> {
  let query = supabase.from(table).select('*').order(opts.order, { ascending: opts.asc ?? true });
  if (opts.limit) query = query.limit(opts.limit);
  const { data, error } = await query;
  if (error) console.warn(`[portfolio] ${table}:`, error.message);
  return (data ?? []) as T[];
}

export async function fetchPortfolio() {
  const [
    projects, services, testimonials, awards, publications,
    vk, archive, github, trivia, haiku, noir, esper,
    skyline, designRounds, dossier,
  ] = await Promise.allSettled([
    q<Project>('portfolio_projects'),
    q<Service>('portfolio_services'),
    q<Testimonial>('portfolio_testimonials'),
    q<Award>('portfolio_awards'),
    q<Publication>('portfolio_publications'),
    q<VkQuestion>('vk_questions'),
    q<ArchiveCapture>('archive_captures'),
    q<GithubProject>('github_projects', { order: 'sort_order' }),
    q<Trivia>('portfolio_trivia'),
    q<Haiku>('portfolio_haiku'),
    q<Noir>('portfolio_noir'),
    q<EsperHotspot>('esper_hotspots'),
    q<SkylineSign>('skyline_signs'),
    q<DesignRound>('design_rounds', { order: 'round_number', asc: false, limit: 20 }),
    q<WebDossierFact>('web_dossier_facts'),
  ]);

  const val = <T>(r: PromiseSettledResult<T[]>): T[] =>
    r.status === 'fulfilled' ? r.value : [];

  return {
    projects: val(projects),
    services: val(services),
    testimonials: val(testimonials),
    awards: val(awards),
    publications: val(publications),
    vk: val(vk),
    archive: val(archive),
    github: val(github),
    trivia: val(trivia),
    haiku: val(haiku),
    noir: val(noir),
    esper: val(esper),
    skyline: val(skyline),
    designRounds: val(designRounds).slice().reverse(),
    dossier: val(dossier),
  };
}

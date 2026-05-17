import {
  supabase,
  type Project, type Service, type Testimonial,
  type Award, type Publication, type VkQuestion,
  type ArchiveCapture, type GithubProject, type Trivia,
  type Haiku, type Noir, type EsperHotspot,
  type DesignRound, type WebDossierFact,
} from './supabase';
import { FALLBACK_PROJECTS, FALLBACK_ARCHIVE } from './fallback';

async function q<T>(table: string, opts: { order: string; asc?: boolean; limit?: number } = { order: 'order_index' }): Promise<T[]> {
  let query = supabase.from(table).select('*').order(opts.order, { ascending: opts.asc ?? true });
  if (opts.limit) query = query.limit(opts.limit);
  const { data, error } = await query;
  if (error) throw Object.assign(new Error(`[portfolio] ${table}: ${error.message}`), { cause: error });
  return data as T[];
}

export async function fetchPortfolio() {
  const [
    projects, services, testimonials, awards, publications,
    vk, archive, github, trivia, haiku, noir, esper,
    designRounds, dossier,
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
    q<DesignRound>('design_rounds', { order: 'round_number', asc: false, limit: 20 }),
    q<WebDossierFact>('web_dossier_facts'),
  ]);

  const val = <T>(r: PromiseSettledResult<T[]>): T[] =>
    r.status === 'fulfilled' ? r.value : [];

  const resolvedProjects = val(projects);
  const resolvedArchive = val(archive);

  return {
    projects: resolvedProjects.length ? resolvedProjects : FALLBACK_PROJECTS,
    services: val(services),
    testimonials: val(testimonials),
    awards: val(awards),
    publications: val(publications),
    vk: val(vk),
    archive: resolvedArchive.length ? resolvedArchive : FALLBACK_ARCHIVE,
    github: val(github),
    trivia: val(trivia),
    haiku: val(haiku),
    noir: val(noir),
    esper: val(esper),
    designRounds: val(designRounds).slice().reverse(),
    dossier: val(dossier),
  };
}

import {
  supabase,
  type Project,
  type Service,
  type Testimonial,
  type Award,
  type Publication,
  type VkQuestion,
  type GithubProject,
  type Trivia,
  type Haiku,
  type Noir,
  type EsperHotspot,
  type SkylineSign,
  type DesignRound,
  type WebDossierFact,
  type Certification,
  type LinkedInRecommendation,
  type LinkedInArticle,
  type Poem,
} from './supabase';

// 15 parallel queries fired at the speed of Promise.all.
// If any one fails, the others do not care.
// This is either distributed systems or sociopathy.
// The distinction is academic.

export async function fetchPortfolio() {
  const [
    projects, services, testimonials, awards, publications,
    vk, github, trivia, haiku, noir, esper, skyline, designRounds, dossier, certs,
    recs, articles, poems,
  ] = await Promise.all([
    supabase.from('portfolio_projects').select('*').order('order_index'),
    supabase.from('portfolio_services').select('*').order('order_index'),
    supabase.from('portfolio_testimonials').select('*').order('order_index'),
    supabase.from('portfolio_awards').select('*').order('order_index'),
    supabase.from('portfolio_publications').select('*').order('order_index'),
    supabase.from('vk_questions').select('*').order('order_index'),
    supabase.from('github_projects').select('*').order('sort_order'),
    supabase.from('portfolio_trivia').select('*').order('order_index'),
    supabase.from('portfolio_haiku').select('*').order('order_index'),
    supabase.from('portfolio_noir').select('*').order('order_index'),
    supabase.from('esper_hotspots').select('*').order('order_index'),
    supabase.from('skyline_signs').select('*').order('order_index'),
    supabase.from('design_rounds').select('*').order('round_number', { ascending: false }).limit(20),
    supabase.from('web_dossier_facts').select('*').order('order_index'),
    supabase.from('certifications').select('*').order('order_index'),
    supabase.from('linkedin_recommendations').select('*').order('given_date', { ascending: false }),
    supabase.from('linkedin_articles').select('*').order('published_date', { ascending: false }),
    supabase.from('poems').select('*').order('order_index'),
  ]);

  return {
    projects: (projects.data ?? []) as Project[],
    services: (services.data ?? []) as Service[],
    testimonials: (testimonials.data ?? []) as Testimonial[],
    awards: (awards.data ?? []) as Award[],
    publications: (publications.data ?? []) as Publication[],
    vk: (vk.data ?? []) as VkQuestion[],
    github: (github.data ?? []) as GithubProject[],
    trivia: (trivia.data ?? []) as Trivia[],
    haiku: (haiku.data ?? []) as Haiku[],
    noir: (noir.data ?? []) as Noir[],
    esper: (esper.data ?? []) as EsperHotspot[],
    skyline: (skyline.data ?? []) as SkylineSign[],
    designRounds: ((designRounds.data ?? []) as DesignRound[]).slice().reverse(),
    dossier: (dossier.data ?? []) as WebDossierFact[],
    certifications: (certs.data ?? []) as Certification[],
    recommendations: (recs.data ?? []) as LinkedInRecommendation[],
    articles: (articles.data ?? []) as LinkedInArticle[],
    poems: (poems.data ?? []) as Poem[],
  };
}

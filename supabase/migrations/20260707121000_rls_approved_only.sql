/*
  # RLS hardening — the second wall

  Every content table gains a RESTRICTIVE select policy requiring the
  `approved` claim in app_metadata. Restrictive policies AND with the
  existing permissive ones, so we do not need to know or drop the old
  policy names. Insert/update policies (telemetry, contact form) are
  untouched — the gate page must still be able to log errors.

  If the Vercel middleware ever misconfigures, this layer still refuses.
*/

create or replace function public.is_approved()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(((auth.jwt() -> 'app_metadata' ->> 'approved'))::boolean, false)
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'portfolio_projects', 'portfolio_services', 'portfolio_testimonials',
    'portfolio_awards', 'portfolio_publications', 'portfolio_trivia',
    'portfolio_haiku', 'portfolio_noir', 'vk_questions',
    'vk_interview_questions', 'vk_personality_profiles', 'github_projects',
    'esper_hotspots', 'skyline_signs', 'design_rounds', 'web_dossier_facts',
    'certifications', 'linkedin_recommendations', 'linkedin_articles',
    'narrator_alternate_copy', 'archive_captures', 'app_logs',
    'visitor_sessions', 'visitor_events', 'contact_submissions'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format(
        'create policy approved_only_select on public.%I as restrictive for select to public using (public.is_approved())',
        t
      );
    end if;
  end loop;
end $$;

-- Dossiers attach to real identities once verified.
alter table public.visitor_sessions add column if not exists user_id uuid;

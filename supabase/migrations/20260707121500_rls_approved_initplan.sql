/*
  # RLS perf fix — initplan, not per-row

  20260707121000_rls_approved_only.sql added restrictive select policies of
  the form `using (public.is_approved())`. Because the function call sits
  bare in USING, Postgres re-evaluates it once per row instead of once per
  statement. On the large `app_logs` table this made anonymous selects time
  out (SQLSTATE 57014) instead of returning `[]` fast.

  The standard Supabase RLS optimization is to wrap the call in a scalar
  subquery, which the planner hoists into a one-time initplan:

    using ((select public.is_approved()))

  This migration drops and recreates each `approved_only_select` policy
  with that wrapped form. Same tables, same semantics, cheaper plan.
*/

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
        'drop policy if exists approved_only_select on public.%I',
        t
      );
      execute format(
        'create policy approved_only_select on public.%I as restrictive for select to public using ((select public.is_approved()))',
        t
      );
    end if;
  end loop;
end $$;

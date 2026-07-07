/*
  # Stand down the RLS wall until the Vercel cutover

  The restrictive approved-only policies went live hours before the new
  gate could serve, leaving the public site blank. Wrong sequencing.
  This migration restores public reads exactly as they were, so the
  GitHub Pages site works again while the gate finishes deploying.

  The wall is re-raised by a cutover migration at DNS-switch time,
  re-running the same policy set from 20260707121500 and 20260707121800.

  Left in place (all inert for the public site): access_requests
  (deny-all), is_approved(), the signup trigger, visitor_sessions.user_id.
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
      execute format('drop policy if exists approved_only_select on public.%I', t);
    end if;
  end loop;
end $$;

-- app_logs: restore the pre-gate anon read path that 20260707121800 removed.
drop policy if exists app_logs_select_approved on public.app_logs;
create policy "Anyone can read logs" on public.app_logs
  for select to public using (true);

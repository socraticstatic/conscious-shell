/*
  # Raise the RLS wall — cutover complete

  DNS is fully on Vercel and the edge gate serves conscious-shell.com with a
  valid cert, so re-raising the approved-only wall no longer blanks anyone
  (GitHub Pages no longer receives traffic). This restores the defense-in-depth
  layer that 20260707160000 stood down during the DNS cutover.

  Re-applies the initplan restrictive select policies (from 20260707121500)
  and the app_logs approved-only select policy (from 20260707121800).
  Email/telemetry insert policies are untouched.
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
      execute format('drop policy if exists approved_only_select on public.%I', t);
      -- app_logs uses a dedicated permissive policy (see below); skip the
      -- restrictive one there so anon gets a scan-free no-policy deny.
      if t <> 'app_logs' then
        execute format(
          'create policy approved_only_select on public.%I as restrictive for select to public using ((select public.is_approved()))',
          t
        );
      end if;
    end if;
  end loop;
end $$;

-- app_logs: single permissive select policy for approved users only; no anon
-- select path (constant-false deny, no 414k-row scan). Insert stays open.
drop policy if exists "Anyone can read logs" on public.app_logs;
drop policy if exists app_logs_select_approved on public.app_logs;
create policy app_logs_select_approved on public.app_logs
  for select to authenticated
  using ((select public.is_approved()));

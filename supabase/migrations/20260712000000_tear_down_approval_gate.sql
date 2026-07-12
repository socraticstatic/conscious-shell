/*
  # Tear down the approval gate — the department is dissolved

  Reverses the entire access-control layer introduced by the approval-gate
  work (migrations 20260707120000 through 20260708000000). The edge gate,
  gate UI, and identity plumbing are removed in the same change on the
  application side; this migration removes the database half so the public
  portfolio reads freely again and no gate scaffolding remains.

  Steps:
    1. Drop the restrictive approved-only select policies from every content
       table. The original permissive select policies underneath are
       untouched, so dropping the restrictive layer restores public reads.
    2. app_logs: restore the pre-gate anon read path (a single permissive
       "Anyone can read logs" select policy) that the gate replaced with an
       approved-only one.
    3. Drop the signup notification trigger and its function.
    4. Drop the access_requests intake table (and its data).
    5. Drop the is_approved() helper (nothing references it after step 1/2).
    6. Drop the visitor_sessions.user_id column the gate added.

  Insert/update policies (telemetry, contact form) are left untouched.
*/

-- 1. Restrictive approved-only select policies on content tables.
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

-- 2. app_logs: restore the pre-gate public read path.
drop policy if exists app_logs_select_approved on public.app_logs;
drop policy if exists "Anyone can read logs" on public.app_logs;
create policy "Anyone can read logs" on public.app_logs
  for select to public using (true);

-- 3. Signup notification trigger + function.
drop trigger if exists trg_gate_signup on auth.users;
drop function if exists public.handle_gate_signup();

-- 4. Intake ledger. Drops the table and any stored access-request rows.
drop table if exists public.access_requests;

-- 5. Clearance helper. Safe now that no policy references it.
drop function if exists public.is_approved();

-- 6. The gate-added identity column on visitor telemetry.
alter table if exists public.visitor_sessions drop column if exists user_id;

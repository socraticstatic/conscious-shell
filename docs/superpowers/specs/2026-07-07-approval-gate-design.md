# Approval Gate: Edge-Enforced Identity Layer

**Date:** 2026-07-07
**Status:** Approved
**Decision:** Full-site gate. Magic-link email verification plus owner approval. Edge-enforced on Vercel.

## Purpose

Micah wants to know who is reading conscious-shell.com, and to keep specific people out. This is not lead capture and not content secrecy in the abstract. It is deterrence and attribution against known individuals, with real exclusion for anyone he does not approve.

What the gate can and cannot do, stated plainly:

- It cannot stop a determined person from requesting access with a burner email. It CAN ensure that no identity enters until Micah approves it, so an unrecognized burner simply never gets in.
- It deters the named person: entering requires identifying yourself, and entry is logged against your identity.
- It kills SEO and adds friction for legitimate visitors (recruiters). Micah accepts this cost explicitly.

## Architecture

### Hosting: GitHub Pages → Vercel

The site moves to Vercel. GitHub Pages is static-only and cannot enforce anything server-side. Vercel Edge Middleware runs before any asset is served.

- `middleware.ts` at repo root, matching all routes except the public allowlist.
- On each request: read the Supabase session from cookies, verify the JWT, check the `approved` claim in `app_metadata`.
- No valid approved session → serve only the gate page. HTML, JS bundle, images, and routes are never sent. There is no bundle to inspect because it never leaves the server.
- Middleware failure of any kind fails closed: gate, not content.

Public allowlist (served without a session):

- The gate page and its minimal assets
- The auth callback route (magic-link landing)
- `favicon.ico` / `favicon.svg`, `og-image.png` (links still unfurl when shared)
- `robots.txt` (rewritten to `Disallow: /`)
- `google420f60a0a39d115d.html` may be deleted; Search Console is moot behind a gate

Removed or retired:

- `sitemap.xml` (deleted)
- `scripts/generate-static-routes.mjs` static-route generation for SEO (retired from the build)
- The custom domain `conscious-shell.com` moves its DNS to Vercel

### Session plumbing: localStorage → cookies

The middleware can only see cookies. The app's Supabase client in `src/lib/supabase.ts` switches from the default localStorage storage to cookie-based sessions via `@supabase/ssr` (browser client). This is a contained change; all existing query call sites keep working.

Cookie sessions also fix the cross-tab problem: the magic link opens in a new tab, and the original tab picks up the session from cookies.

### Approval in the JWT, not per-request DB reads

Approval is stamped into `app_metadata.approved = true` by the approval edge function. The middleware verifies the JWT and reads the claim. No database query per request.

The trade: revocation takes effect when the access token expires, not instantly. Access-token TTL is set to **15 minutes** in Supabase auth config, making revocation near-real-time. Refresh-token rotation stays default; a revoked user's refresh stops minting approved tokens because `app_metadata` is re-read at refresh.

### Defense in depth: RLS

Every content table gets an additional RLS policy requiring the same claim:

```sql
((auth.jwt() -> 'app_metadata' ->> 'approved')::boolean is true)
```

Tables covered: portfolio tables, case studies, vk_questions, esper_hotspots, archive_captures, github_projects, trivia, haiku, noir, skyline_signs, design_rounds, certifications, linkedin_recommendations, linkedin_articles, narrator_states, web_dossier. Anonymous-write telemetry tables (app_logs, visitor_intelligence/sessions, contact_submissions) keep their existing insert policies but their read policies tighten to owner/admin only, as they should already be.

If the middleware ever misconfigures, the data layer still refuses.

## The Flow

1. **Visitor hits any URL.** Middleware finds no approved session. Gate page served.
2. **Gate screen.** One field: email. Submit calls `supabase.auth.signInWithOtp` (magic link). No passwords exist anywhere in the system.
3. **Magic link clicked.** Auth callback sets cookie session. User is authenticated but NOT approved.
4. **Pending.** Middleware sees a valid session without the approved claim and serves the waiting-room page (part of the gate surface, not the app).
5. **Owner notified.** A database trigger on new signups inserts a row into `access_requests` and sends Micah an email through the existing pg_net path (same machinery as `contact_email_notify`). The email carries the requester's address and two signed links: APPROVE and DENY.
6. **One tap.** The link hits a Supabase Edge Function that validates the signed token, flips `app_metadata.approved` (approve) or sets status denied (deny), and updates the `access_requests` row. Approved visitors are in on their next page load or token refresh.
7. **Denied looks exactly like pending. Forever.** The waiting room never changes for a denied identity. A denial response would tell the person they were seen and judged; eternal "under review" tells them nothing. Status is never exposed client-side.
8. **Owner seed.** Micah's email is seeded as approved admin in the initial migration. Admin status also lives in `app_metadata` (`role: 'owner'`).

Notification via Hermes to the phone is a later enhancement, not in scope. Email is the approval channel for v1.

## The Theme

The gate is not a login form. It is an intake terminal.

- **Gate:** boot sequence, then `IDENTIFY YOURSELF`. The email field is framed as registering with the department. Palette and type follow the existing esper/CRT law; no new visual language.
- **Magic-link email:** themed as Tyrell Corp correspondence (Supabase email template customization).
- **Waiting room:** "Application under review. The department will contact you." Bureaucratic, patient, final. This state is doing real security work (see step 7) while reading as pure fiction.
- **Approved return:** Helen greets them by name. Their visitor dossier now attaches to a real identity and shows a clearance badge.
- **Existing machinery:** the Voight-Kampff components stop being decoration and become the plot. (Deeper VK-as-intake integration is a follow-on, not v1.)

## Data

One new table:

```
access_requests
  id            uuid pk
  user_id       uuid references auth.users
  email         text not null
  status        text check in ('pending','approved','denied','revoked')
  requested_at  timestamptz default now()
  decided_at    timestamptz
  note          text
```

RLS on `access_requests`: no client read access for visitors, not even their own row. Status must never be observable from the client, or denial becomes detectable. Owner/service role only.

Existing visitor-intelligence tables gain a nullable `user_id` column so dossiers, sessions, and egg progress attach to real identities once verified.

## Edges and Failure Modes

- **Fail closed.** Any middleware error serves the gate.
- **Rate limits.** Supabase's native OTP rate limits stop email-bomb abuse of the gate's email field.
- **Typo'd / bounced emails.** The magic link never arrives; no account, no request row, no noise.
- **ErrorBoundary.** The gate and waiting room mount inside the existing ErrorBoundary; lazy chunks stay inside it (May lesson: one failed chunk must not blank the app).
- **Token staleness.** Revocation propagates within one access-token TTL (15 min). Documented, accepted.
- **Approval-link security.** Approve/deny links are signed, single-use, and expire. A leaked notification email must not become a self-approval vector; the edge function validates signature, expiry, and one-time use.
- **Vercel env.** Supabase URL and anon key move to Vercel env vars; the service-role key lives only in the edge function's Supabase secrets, never in Vercel or the client.

## Verification (before "done")

Walk the full lifecycle as a user, from scratch, against the real deployment:

1. Fresh browser, hit conscious-shell.com → gate, and confirm no app assets load (network tab).
2. Request access with a fresh email → receive the real themed email.
3. Click the link → land in the waiting room.
4. Approve from the owner inbox → enter the site on next load.
5. Refresh → session survives. Close browser, return → session survives.
6. Confirm the dossier shows the identity.
7. Revoke → locked out within 15 minutes.
8. Deny a second fresh email → waiting room, identical to pending, indefinitely.
9. Confirm Supabase queries fail for an unapproved session (RLS check, not just middleware).
10. Confirm shared links still unfurl (og-image public).

## Out of Scope (v1)

- Hermes/phone approval channel (email only for now)
- VK-test-as-intake deep integration
- Clearance tiers beyond approved/not
- Admin UI for managing requests (email links + Supabase dashboard suffice)

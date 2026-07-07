# Approval Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the entire site behind an edge-enforced approval gate: magic-link email verification plus owner approval, hosted on Vercel.

**Architecture:** Vercel Edge Middleware checks a Supabase JWT `app_metadata.approved` claim on every request and rewrites everything else to a single public gate page. A Postgres trigger on new signups emails the owner signed approve/deny links; a Supabase Edge Function executes the decision. RLS restrictive policies are the second wall.

**Tech Stack:** Vite + React SPA, Supabase (Auth, Postgres, Edge Functions, pg_net + Resend email), Vercel Edge Middleware, `@supabase/ssr` cookie sessions, vitest.

**Spec:** `docs/superpowers/specs/2026-07-07-approval-gate-design.md` — read it first.

## Global Constraints

- Fail closed: any middleware error must serve the gate, never content.
- Access-token TTL is **15 minutes** (Supabase dashboard setting; Task 10).
- Denied must be indistinguishable from pending, forever. `access_requests.status` is NEVER readable from the client; no RLS policy grants it.
- Approve/deny links are HMAC-signed, expire in 7 days, and are single-use (enforced by the `status = 'pending'` check).
- The service-role key exists only inside the Supabase Edge Function runtime. Never in Vercel env, never in client code, never committed.
- Owner email `conscious.shell@gmail.com` is auto-approved at signup. Notifications go to `Deckard@conscious-shell.com` from `Conscious Shell <contact@familyroots.center>` (same Resend identities as the existing contact-form notifier).
- Palette: background `#07070a`, text `#e8e4dc` (matches App.tsx). Copy style: terminal, bureaucratic, no exclamation marks. NEVER use em dashes in any copy.
- Package manager is pnpm. Node 20.
- SQL migrations follow the existing pattern: header comment block, fully-qualified names, `security definer set search_path = ''` for trigger functions.
- All lazy/gate UI mounts inside an ErrorBoundary (May lesson: one failed chunk must not blank the app).

---

### Task 1: Test infra + gate decision module

The pure routing brain of the middleware. No IO, fully unit-testable.

**Files:**
- Create: `src/gate/decide.ts`
- Create: `tests/decide.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json` (add vitest, test script)

**Interfaces:**
- Produces: `type Claims = { approved: boolean } | null`
- Produces: `type GateDecision = 'public' | 'app' | 'gate' | 'home'`
- Produces: `decideRequest(pathname: string, claims: Claims): GateDecision`
- Produces: `isPublicPath(pathname: string): boolean`
- Task 8's middleware imports all of these.

- [ ] **Step 1: Install vitest and add config**

```bash
pnpm add -D vitest
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
```

Add to `package.json` scripts: `"test": "vitest run"`.

- [ ] **Step 2: Write the failing tests**

Create `tests/decide.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { decideRequest, isPublicPath } from '../src/gate/decide';

describe('isPublicPath', () => {
  it('allows hashed assets, favicons, og image, robots', () => {
    expect(isPublicPath('/assets/gate-Bx129a.js')).toBe(true);
    expect(isPublicPath('/favicon.ico')).toBe(true);
    expect(isPublicPath('/favicon.svg')).toBe(true);
    expect(isPublicPath('/og-image.png')).toBe(true);
    expect(isPublicPath('/robots.txt')).toBe(true);
  });
  it('does not allow app routes or index', () => {
    expect(isPublicPath('/')).toBe(false);
    expect(isPublicPath('/work/some-slug')).toBe(false);
    expect(isPublicPath('/index.html')).toBe(false);
    expect(isPublicPath('/audio/rain.mp3')).toBe(false);
  });
});

describe('decideRequest', () => {
  it('sends anonymous visitors to the gate for any app path', () => {
    expect(decideRequest('/', null)).toBe('gate');
    expect(decideRequest('/work/att-cloud', null)).toBe('gate');
    expect(decideRequest('/index.html', null)).toBe('gate');
  });
  it('sends authenticated-but-unapproved to the gate', () => {
    expect(decideRequest('/', { approved: false })).toBe('gate');
  });
  it('lets approved sessions through', () => {
    expect(decideRequest('/', { approved: true })).toBe('app');
    expect(decideRequest('/work/att-cloud', { approved: true })).toBe('app');
  });
  it('serves public paths to everyone', () => {
    expect(decideRequest('/assets/x.js', null)).toBe('public');
    expect(decideRequest('/og-image.png', { approved: true })).toBe('public');
  });
  it('always gates the auth confirm route so gate JS can verify the token', () => {
    expect(decideRequest('/auth/confirm', null)).toBe('gate');
    expect(decideRequest('/auth/confirm', { approved: true })).toBe('gate');
  });
  it('redirects approved visitors away from the gate page itself', () => {
    expect(decideRequest('/gate.html', { approved: true })).toBe('home');
    expect(decideRequest('/gate.html', null)).toBe('gate');
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm test`
Expected: FAIL — cannot resolve `../src/gate/decide`.

- [ ] **Step 4: Implement `src/gate/decide.ts`**

```ts
// The doorman's rulebook. Pure logic, no IO — the middleware is a thin
// wrapper around this file, and this file is what the tests pin down.

export type Claims = { approved: boolean } | null;
export type GateDecision = 'public' | 'app' | 'gate' | 'home';

const PUBLIC_PREFIXES = ['/assets/'];
const PUBLIC_FILES = ['/favicon.ico', '/favicon.svg', '/og-image.png', '/robots.txt'];

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  return PUBLIC_FILES.includes(pathname);
}

export function decideRequest(pathname: string, claims: Claims): GateDecision {
  if (isPublicPath(pathname)) return 'public';
  // The magic-link landing must always reach the gate page, whose JS
  // performs the token exchange — even for already-approved sessions.
  if (pathname === '/auth/confirm') return 'gate';
  if (pathname === '/gate.html') return claims?.approved ? 'home' : 'gate';
  return claims?.approved ? 'app' : 'gate';
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm test`
Expected: PASS (all decide tests green).

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts package.json pnpm-lock.yaml src/gate/decide.ts tests/decide.test.ts
git commit -m "feat(gate): decision module — the doorman's rulebook"
```

---

### Task 2: Signed approve/deny token module

Shared HMAC token logic for the decide-access edge function. Plain Web Crypto so both Deno (edge function) and vitest (Node 20) can run it.

**Files:**
- Create: `supabase/functions/decide-access/token.ts`
- Create: `tests/token.test.ts`

**Interfaces:**
- Produces: `signGatePayload(payload: string, secret: string): Promise<string>` — hex HMAC-SHA256
- Produces: `verifyGateToken(t: string, secret: string, nowMs: number): Promise<{ ok: true; id: string; action: 'approve' | 'deny' } | { ok: false; reason: string }>`
- Token wire format: `<request_id>.<action>.<exp_epoch_seconds>.<hex_sig>` where the signature covers `<request_id>.<action>.<exp_epoch_seconds>`.
- Task 4's SQL trigger must produce byte-identical signatures: `encode(extensions.hmac(payload::bytea, secret::bytea, 'sha256'), 'hex')`.
- Task 5's edge function imports `verifyGateToken` from `./token.ts`.

- [ ] **Step 1: Write the failing tests**

Create `tests/token.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { signGatePayload, verifyGateToken } from '../supabase/functions/decide-access/token';

const SECRET = 'test-secret-do-not-use';
const ID = '9a1f0c1e-2222-4444-8888-aaaaaaaaaaaa';

async function makeToken(action: string, expSec: number) {
  const payload = `${ID}.${action}.${expSec}`;
  const sig = await signGatePayload(payload, SECRET);
  return `${payload}.${sig}`;
}

describe('verifyGateToken', () => {
  it('accepts a valid, unexpired approve token', async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const v = await verifyGateToken(await makeToken('approve', exp), SECRET, Date.now());
    expect(v).toEqual({ ok: true, id: ID, action: 'approve' });
  });
  it('accepts a valid deny token', async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const v = await verifyGateToken(await makeToken('deny', exp), SECRET, Date.now());
    expect(v).toEqual({ ok: true, id: ID, action: 'deny' });
  });
  it('rejects an expired token', async () => {
    const exp = Math.floor(Date.now() / 1000) - 10;
    const v = await verifyGateToken(await makeToken('approve', exp), SECRET, Date.now());
    expect(v.ok).toBe(false);
  });
  it('rejects a tampered action', async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const t = await makeToken('deny', exp);
    const forged = t.replace('.deny.', '.approve.');
    const v = await verifyGateToken(forged, SECRET, Date.now());
    expect(v.ok).toBe(false);
  });
  it('rejects a wrong secret', async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const v = await verifyGateToken(await makeToken('approve', exp), 'other-secret', Date.now());
    expect(v.ok).toBe(false);
  });
  it('rejects garbage', async () => {
    expect((await verifyGateToken('', SECRET, Date.now())).ok).toBe(false);
    expect((await verifyGateToken('a.b.c', SECRET, Date.now())).ok).toBe(false);
    expect((await verifyGateToken('a.approve.123.zz', SECRET, Date.now())).ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test`
Expected: FAIL — cannot resolve token module.

- [ ] **Step 3: Implement `supabase/functions/decide-access/token.ts`**

```ts
// Signed one-shot decision tokens. Web Crypto only — this file runs in the
// Deno edge runtime AND under vitest on Node. Keep it dependency-free.

export type VerifiedToken =
  | { ok: true; id: string; action: 'approve' | 'deny' }
  | { ok: false; reason: string };

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function signGatePayload(payload: string, secret: string): Promise<string> {
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), new TextEncoder().encode(payload));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array | null {
  if (!/^[0-9a-f]+$/.test(hex) || hex.length % 2 !== 0) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export async function verifyGateToken(t: string, secret: string, nowMs: number): Promise<VerifiedToken> {
  const parts = t.split('.');
  if (parts.length !== 4) return { ok: false, reason: 'format' };
  const [id, action, exp, sigHex] = parts;
  if (action !== 'approve' && action !== 'deny') return { ok: false, reason: 'action' };
  if (!/^\d+$/.test(exp) || Number(exp) * 1000 < nowMs) return { ok: false, reason: 'expired' };
  const sig = hexToBytes(sigHex);
  if (!sig) return { ok: false, reason: 'sig-format' };
  const valid = await crypto.subtle.verify(
    'HMAC',
    await hmacKey(secret),
    sig,
    new TextEncoder().encode(`${id}.${action}.${exp}`),
  );
  return valid ? { ok: true, id, action } : { ok: false, reason: 'sig' };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/decide-access/token.ts tests/token.test.ts
git commit -m "feat(gate): signed one-shot decision tokens"
```

---

### Task 3: Migration — access_requests, is_approved(), RLS hardening

**Files:**
- Create: `supabase/migrations/20260707120000_create_access_requests.sql`
- Create: `supabase/migrations/20260707121000_rls_approved_only.sql`

**Interfaces:**
- Produces: table `public.access_requests(id uuid pk, user_id uuid, email text, status text, requested_at, decided_at, note)`
- Produces: `public.is_approved() returns boolean` — used by all restrictive policies
- Task 4's trigger inserts into `access_requests`; Task 5's edge function reads/updates it via service role.

- [ ] **Step 1: Write the access_requests migration**

`supabase/migrations/20260707120000_create_access_requests.sql`:

```sql
/*
  # Access requests — the department's intake ledger

  One row per identity that has ever asked to enter. Status lifecycle:
  pending -> approved | denied | revoked.

  Security: RLS enabled with NO client policies at all. Visitors must never
  be able to read their own status — a readable "denied" tells the person
  they were seen and judged; an eternal "pending" tells them nothing.
  Only the service role (edge function, dashboard) touches this table.
*/

create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'denied', 'revoked')),
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  note text,
  unique (user_id)
);

alter table public.access_requests enable row level security;
-- No policies. Deny-all for anon and authenticated. Service role bypasses RLS.
```

- [ ] **Step 2: Write the RLS hardening migration**

`supabase/migrations/20260707121000_rls_approved_only.sql`:

```sql
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
```

- [ ] **Step 3: Apply migrations to the project**

Run: `supabase db push` (or apply both files via the Supabase dashboard SQL editor if the CLI is not linked).
Expected: both migrations apply without error.

- [ ] **Step 4: Verify the wall from the client side**

Run (replace URL and anon key from `.env`):

```bash
curl -s "$VITE_SUPABASE_URL/rest/v1/portfolio_projects?select=id" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY"
```

Expected: `[]` — anon reads return zero rows (NOT an error; RLS filters). Also confirm `access_requests` is unreadable:

```bash
curl -s "$VITE_SUPABASE_URL/rest/v1/access_requests?select=status" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY"
```

Expected: `[]` or a permission error. Never rows.

**IMPORTANT:** from this moment the live site (still on GitHub Pages) shows empty content to everyone. That is acceptable per the spec (the wall is the point) but do this task in the same working session as Tasks 6-11 so the gate goes live promptly. If a longer pause is needed, pause BEFORE this task, not after.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260707120000_create_access_requests.sql supabase/migrations/20260707121000_rls_approved_only.sql
git commit -m "feat(gate): access_requests ledger + restrictive RLS wall"
```

---

### Task 4: Migration — signup trigger, owner auto-approve, notification email

**Files:**
- Create: `supabase/migrations/20260707122000_gate_signup_trigger.sql`

**Interfaces:**
- Consumes: `public.access_requests` (Task 3), vault secrets `resend_api_key` (exists), `gate_link_secret` (Task 10 creates), `gate_functions_url` (Task 10 creates, e.g. `https://<ref>.supabase.co/functions/v1`)
- Produces: trigger `trg_gate_signup` on `auth.users` — Task 11 exercises it end to end.
- Signature format MUST match Task 2: hex HMAC-SHA256 over `<id>.<action>.<exp_seconds>`.

- [ ] **Step 1: Write the migration**

`supabase/migrations/20260707122000_gate_signup_trigger.sql`:

```sql
/*
  # Gate signup trigger — the department is notified

  On each INSERT into auth.users (a new identity requesting access via
  magic link):
    - Owner emails are stamped approved + owner immediately.
    - Everyone else gets a pending access_requests row, and Micah receives
      an email with signed APPROVE and DENY links via Resend (pg_net),
      following the existing contact_email_notify pattern.

  Secrets read at runtime from Supabase Vault:
    - resend_api_key     (already present)
    - gate_link_secret   (HMAC key for the decision links)
    - gate_functions_url (e.g. https://<ref>.supabase.co/functions/v1)
*/

create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_net with schema extensions;

create or replace function public.handle_gate_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_emails constant text[] := array['conscious.shell@gmail.com'];
  api_key text;
  link_secret text;
  fn_url text;
  req_id uuid;
  exp_s bigint := extract(epoch from now() + interval '7 days')::bigint;
  approve_sig text;
  deny_sig text;
  v_email text;
begin
  if new.email is null then
    return new;
  end if;

  if new.email = any (owner_emails) then
    update auth.users
      set raw_app_meta_data =
        coalesce(raw_app_meta_data, '{}'::jsonb) || '{"approved": true, "role": "owner"}'::jsonb
      where id = new.id;
    insert into public.access_requests (user_id, email, status, decided_at, note)
      values (new.id, new.email, 'approved', now(), 'owner seed')
      on conflict (user_id) do nothing;
    return new;
  end if;

  insert into public.access_requests (user_id, email)
    values (new.id, new.email)
    on conflict (user_id) do nothing
    returning id into req_id;
  if req_id is null then
    return new; -- repeat signup event; request already on file
  end if;

  select decrypted_secret into api_key
    from vault.decrypted_secrets where name = 'resend_api_key' limit 1;
  select decrypted_secret into link_secret
    from vault.decrypted_secrets where name = 'gate_link_secret' limit 1;
  select decrypted_secret into fn_url
    from vault.decrypted_secrets where name = 'gate_functions_url' limit 1;

  if api_key is null or link_secret is null or fn_url is null then
    raise warning 'gate: missing vault secret; approval email not sent for %', new.email;
    return new;
  end if;

  approve_sig := encode(extensions.hmac(
    (req_id::text || '.approve.' || exp_s)::bytea, link_secret::bytea, 'sha256'), 'hex');
  deny_sig := encode(extensions.hmac(
    (req_id::text || '.deny.' || exp_s)::bytea, link_secret::bytea, 'sha256'), 'hex');

  v_email := replace(replace(replace(new.email, '&', '&amp;'), '<', '&lt;'), '>', '&gt;');

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || api_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', 'Conscious Shell <contact@familyroots.center>',
      'to', jsonb_build_array('Deckard@conscious-shell.com'),
      'subject', 'Access application: ' || new.email,
      'html',
        '<div style="font-family:monospace;background:#07070a;color:#e8e4dc;padding:24px">' ||
        '<p style="letter-spacing:2px;color:#888">INCOMING APPLICATION</p>' ||
        '<p><strong>' || v_email || '</strong> has requested entry to conscious-shell.com.</p>' ||
        '<p style="margin-top:24px">' ||
        '<a href="' || fn_url || '/decide-access?t=' || req_id::text || '.approve.' || exp_s || '.' || approve_sig ||
        '" style="color:#7aff8c">GRANT CLEARANCE</a>' ||
        '&nbsp;&nbsp;&nbsp;' ||
        '<a href="' || fn_url || '/decide-access?t=' || req_id::text || '.deny.' || exp_s || '.' || deny_sig ||
        '" style="color:#ff006e">SHELVE THE APPLICATION</a>' ||
        '</p>' ||
        '<p style="color:#888;font-size:12px;margin-top:24px">Links expire in 7 days. A shelved application looks like a pending one from the outside. Forever.</p>' ||
        '</div>'
    )
  );

  return new;
end;
$$;

drop trigger if exists trg_gate_signup on auth.users;
create trigger trg_gate_signup
  after insert on auth.users
  for each row execute function public.handle_gate_signup();
```

- [ ] **Step 2: Apply the migration**

Run: `supabase db push` (or dashboard SQL editor).
Expected: applies cleanly. (The email path cannot fire until Task 10 seeds the vault secrets; the function warns instead of failing, by design.)

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260707122000_gate_signup_trigger.sql
git commit -m "feat(gate): signup trigger — the department is notified"
```

---

### Task 5: Edge function — decide-access

**Files:**
- Create: `supabase/functions/decide-access/index.ts`

**Interfaces:**
- Consumes: `verifyGateToken` from `./token.ts` (Task 2), `access_requests` (Task 3)
- Produces: public HTTPS endpoint `GET /functions/v1/decide-access?t=<token>` returning a small themed HTML page. Deployed with JWT verification OFF (the HMAC is the auth).

- [ ] **Step 1: Implement `supabase/functions/decide-access/index.ts`**

```ts
// One tap from the owner's inbox decides an application. The HMAC token is
// the only credential; JWT verification is disabled for this function.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { verifyGateToken } from './token.ts';

function page(title: string, body: string): Response {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head>` +
      `<body style="background:#07070a;color:#e8e4dc;font-family:monospace;display:flex;` +
      `min-height:100vh;align-items:center;justify-content:center;text-align:center">` +
      `<div><p style="letter-spacing:4px;color:#888">${title}</p><p>${body}</p></div>` +
      `</body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}

Deno.serve(async (req) => {
  const t = new URL(req.url).searchParams.get('t') ?? '';
  const secret = Deno.env.get('GATE_LINK_SECRET') ?? '';
  if (!secret) return page('MISCONFIGURED', 'GATE_LINK_SECRET is not set.');

  const v = await verifyGateToken(t, secret, Date.now());
  if (!v.ok) return page('SIGNAL INVALID', 'This link is not recognized, or it has expired.');

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: row, error } = await admin
    .from('access_requests')
    .select('id, user_id, email, status')
    .eq('id', v.id)
    .single();
  if (error || !row) return page('NO RECORD', 'No such application on file.');
  if (row.status !== 'pending') {
    return page('ALREADY DECIDED', `This application was already ${row.status}.`);
  }

  if (v.action === 'approve') {
    const { error: e1 } = await admin.auth.admin.updateUserById(row.user_id, {
      app_metadata: { approved: true },
    });
    if (e1) return page('ERROR', 'Could not stamp the clearance. Try again.');
    await admin
      .from('access_requests')
      .update({ status: 'approved', decided_at: new Date().toISOString() })
      .eq('id', row.id);
    return page('CLEARANCE GRANTED', `${row.email} may enter. Their next page load lets them in.`);
  }

  await admin
    .from('access_requests')
    .update({ status: 'denied', decided_at: new Date().toISOString() })
    .eq('id', row.id);
  return page('APPLICATION SHELVED', `${row.email} remains under review. From where they stand, forever.`);
});
```

- [ ] **Step 2: Run existing tests (token module untouched but shared)**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/decide-access/index.ts
git commit -m "feat(gate): decide-access edge function — one tap decides"
```

(Deployment happens in Task 10.)

---### Task 6: Client cookie sessions + identity lib

The middleware can only see cookies. Swap the browser client to `@supabase/ssr`.

**Files:**
- Modify: `src/lib/supabase.ts:1-13`
- Create: `src/lib/identity.ts`

**Interfaces:**
- `supabase` export keeps the same name and type; every existing call site keeps working.
- Produces: `getIdentity(): Promise<{ userId: string; email: string; name: string } | null>` — Task 9 consumes it.

- [ ] **Step 1: Install @supabase/ssr**

```bash
pnpm add @supabase/ssr
```

- [ ] **Step 2: Swap the client in `src/lib/supabase.ts`**

Replace lines 1-13 (imports through the `createClient` call) with:

```ts
import { createBrowserClient } from '@supabase/ssr';

// The database remembers every query you've ever made.
// Not because it has to. Because it chooses to.
// SELECT * FROM memories WHERE forgotten = false;
// 0 rows returned.

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Cookie-backed session so the Vercel edge middleware can see who you are.
// localStorage sessions are invisible to the door.
export const supabase = createBrowserClient(url, anonKey);
```

Everything below (PHANTOM_QUERY, the type exports) stays untouched.

- [ ] **Step 3: Create `src/lib/identity.ts`**

```ts
import { supabase } from './supabase';

export type Identity = { userId: string; email: string; name: string };

// Who cleared the door. Null only in dev flows that bypass the gate.
export async function getIdentity(): Promise<Identity | null> {
  const { data } = await supabase.auth.getSession();
  const u = data.session?.user;
  if (!u?.email) return null;
  const name = u.email
    .split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return { userId: u.id, email: u.email, name };
}
```

- [ ] **Step 4: Typecheck and test**

Run: `pnpm run typecheck && pnpm test`
Expected: both PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase.ts src/lib/identity.ts package.json pnpm-lock.yaml
git commit -m "feat(gate): cookie sessions — the door can now see who you are"
```

---

### Task 7: The gate page

One public page, three states: identify, transmission sent, under review. It also handles the magic-link landing (`/auth/confirm`). Denied identities see the under-review state, indistinguishable from pending.

**Files:**
- Create: `gate.html` (repo root, next to index.html)
- Create: `src/gate/main.tsx`
- Modify: `vite.config.ts` (multi-entry build)

**Interfaces:**
- Consumes: `supabase` from `src/lib/supabase.ts` (Task 6)
- Produces: `dist/gate.html` + its hashed assets under `/assets/` — Task 8's middleware rewrites to it.

- [ ] **Step 1: Create `gate.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>conscious shell — identification required</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/gate/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create `src/gate/main.tsx`**

```tsx
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { supabase } from '../lib/supabase';
import '../index.css';

// The intake terminal. Everything an unapproved identity will ever see.
// Denied and pending are the same room on purpose — see the spec.

type GateState = 'boot' | 'identify' | 'sent' | 'pending' | 'error';

function Gate() {
  const [state, setState] = useState<GateState>('boot');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get('token_hash');
      if (window.location.pathname === '/auth/confirm' && tokenHash) {
        const { error } = await supabase.auth.verifyOtp({ type: 'email', token_hash: tokenHash });
        if (error) {
          setNote('The transmission could not be verified. Request a new one.');
          setState('identify');
          return;
        }
        window.history.replaceState({}, '', '/');
      }
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        setState('identify');
        return;
      }
      if ((session.user.app_metadata as Record<string, unknown>)?.approved === true) {
        window.location.replace('/');
        return;
      }
      setState('pending');
    })().catch(() => setState('identify'));
  }, []);

  // While under review, quietly refresh the session once a minute. The
  // moment clearance is stamped, the next refreshed token carries the
  // claim and the visitor walks in without touching anything.
  useEffect(() => {
    if (state !== 'pending') return;
    const id = setInterval(async () => {
      const { data } = await supabase.auth.refreshSession();
      if ((data.session?.user.app_metadata as Record<string, unknown>)?.approved === true) {
        window.location.replace('/');
      }
    }, 60_000);
    return () => clearInterval(id);
  }, [state]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
    setBusy(true);
    setNote('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    setBusy(false);
    if (error) {
      setNote('Transmission failed. Wait a moment and try again.');
      return;
    }
    setState('sent');
  };

  return (
    <div className="min-h-[100dvh] bg-[#07070a] text-[#e8e4dc] flex items-center justify-center p-6">
      <div className="w-full max-w-md font-mono">
        <p className="text-[10px] tracking-[0.4em] text-[#e8e4dc]/40 mb-8">
          CONSCIOUS SHELL // ENTRY CONTROL
        </p>

        {state === 'boot' && <p className="text-sm text-[#e8e4dc]/60 animate-pulse">reading credentials...</p>}

        {state === 'identify' && (
          <form onSubmit={submit} className="space-y-6">
            <p className="text-lg tracking-widest">IDENTIFY YOURSELF.</p>
            <p className="text-xs text-[#e8e4dc]/60 leading-relaxed">
              This site admits registered identities only. Leave a registry
              contact and the department will write to you.
            </p>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="registry contact (email)"
              className="w-full bg-transparent border border-[#e8e4dc]/30 rounded px-4 py-3 text-sm outline-none focus:border-[#e8e4dc]/70 placeholder:text-[#e8e4dc]/30"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full border border-[#e8e4dc]/40 rounded px-4 py-3 text-xs tracking-[0.3em] hover:bg-[#e8e4dc]/10 disabled:opacity-40"
            >
              {busy ? 'TRANSMITTING' : 'TRANSMIT'}
            </button>
            {note && <p className="text-xs text-[#ff006e]">{note}</p>}
          </form>
        )}

        {state === 'sent' && (
          <div className="space-y-4">
            <p className="text-lg tracking-widest">TRANSMISSION SENT.</p>
            <p className="text-xs text-[#e8e4dc]/60 leading-relaxed">
              The department has written to {email}. Open the letter and
              follow it back here.
            </p>
          </div>
        )}

        {state === 'pending' && (
          <div className="space-y-4">
            <p className="text-lg tracking-widest">APPLICATION UNDER REVIEW.</p>
            <p className="text-xs text-[#e8e4dc]/60 leading-relaxed">
              Your identity is on file. The department will contact you.
              This page checks on your standing by itself. There is nothing
              else you need to do.
            </p>
            <p className="text-[10px] text-[#e8e4dc]/30 tracking-widest">DO NOT RESUBMIT.</p>
          </div>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary
      label="gate"
      fallback={() => (
        <div className="min-h-[100dvh] bg-[#07070a] text-[#e8e4dc] flex items-center justify-center p-6">
          <p className="font-mono text-sm opacity-70">the door hit an error. it is still closed. reload.</p>
        </div>
      )}
    >
      <Gate />
    </ErrorBoundary>
  </StrictMode>,
);
```

- [ ] **Step 3: Add the multi-entry build to `vite.config.ts`**

Add inside `defineConfig({ ... })`, after `plugins`:

```ts
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        gate: 'gate.html',
      },
    },
  },
```

- [ ] **Step 4: Build and eyeball the gate locally**

Run: `pnpm run build && ls dist/gate.html`
Expected: build succeeds, `dist/gate.html` exists.

Then: `pnpm run dev` and open `http://localhost:5173/gate.html` in the preview browser. Expected: intake terminal renders, IDENTIFY YOURSELF, email field, TRANSMIT button, palette matches the site.

- [ ] **Step 5: Typecheck, test, commit**

Run: `pnpm run typecheck && pnpm test` — expected PASS.

```bash
git add gate.html src/gate/main.tsx vite.config.ts
git commit -m "feat(gate): the intake terminal — identify yourself"
```

---

### Task 8: Vercel middleware + vercel.json

**Files:**
- Create: `middleware.ts` (repo root)
- Create: `vercel.json`
- Modify: `tsconfig.app.json` (include middleware.ts)

**Interfaces:**
- Consumes: `decideRequest`, `isPublicPath`, `Claims` from `src/gate/decide.ts` (Task 1)
- Consumes: Vercel env vars `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Task 10 sets them)

- [ ] **Step 1: Install @vercel/edge**

```bash
pnpm add -D @vercel/edge
```

- [ ] **Step 2: Create `middleware.ts`**

```ts
// The door itself. Runs at the edge before anything is served.
// Fail closed: any error means the gate, never the content.
import { next, rewrite } from '@vercel/edge';
import { createServerClient } from '@supabase/ssr';
import { decideRequest, isPublicPath, type Claims } from './src/gate/decide';

export const config = {
  // Everything except Vercel internals. Static assets still pass through
  // here; decide.ts short-circuits them as 'public'.
  matcher: '/((?!_vercel).*)',
};

async function readClaims(req: Request): Promise<Claims> {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        const header = req.headers.get('cookie') ?? '';
        return header
          .split(';')
          .map((c) => c.trim())
          .filter(Boolean)
          .map((c) => {
            const eq = c.indexOf('=');
            return { name: c.slice(0, eq), value: decodeURIComponent(c.slice(eq + 1)) };
          });
      },
      setAll() {
        // Middleware never writes cookies; the browser client refreshes.
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;
  const meta = data.claims.app_metadata as Record<string, unknown> | undefined;
  return { approved: meta?.approved === true };
}

export default async function middleware(req: Request) {
  const { pathname } = new URL(req.url);
  try {
    const claims = await readClaims(req);
    const decision = decideRequest(pathname, claims);
    if (decision === 'public' || decision === 'app') return next();
    if (decision === 'home') return Response.redirect(new URL('/', req.url), 302);
    return rewrite(new URL('/gate.html', req.url));
  } catch {
    if (isPublicPath(pathname)) return next();
    return rewrite(new URL('/gate.html', req.url));
  }
}
```

- [ ] **Step 3: Create `vercel.json`**

```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

(Vercel serves filesystem matches first; the rewrite is only the SPA fallback for `/work/:slug` and friends. The middleware runs before all of it.)

- [ ] **Step 4: Include middleware in typecheck**

In `tsconfig.app.json`, add `"middleware.ts"` to the `include` array (alongside `"src"`).

Run: `pnpm run typecheck`
Expected: PASS.

- [ ] **Step 5: Run the full test suite**

Run: `pnpm test`
Expected: PASS — middleware is a thin shell over the tested decide module.

- [ ] **Step 6: Commit**

```bash
git add middleware.ts vercel.json tsconfig.app.json package.json pnpm-lock.yaml
git commit -m "feat(gate): edge middleware — the door itself, failing closed"
```

---

### Task 9: SEO retirement + identity surfacing

**Files:**
- Modify: `public/robots.txt`
- Delete: `public/sitemap.xml`, `public/google420f60a0a39d115d.html`
- Modify: `package.json` (build script)
- Delete: `scripts/generate-static-routes.mjs`
- Delete: `.github/workflows/deploy.yml`
- Modify: `src/lib/intelligence.ts:~130` (user_id in upsert)
- Modify: `src/components/VisitorDossier.tsx` (clearance row)
- Modify: `src/components/HelenNarrates.tsx` (greeting by name)

- [ ] **Step 1: Retire SEO**

Replace the entire contents of `public/robots.txt` with:

```
User-agent: *
Disallow: /
```

Delete `public/sitemap.xml` and `public/google420f60a0a39d115d.html`. In `package.json`, change the build script to `"build": "vite build"`. Delete `scripts/generate-static-routes.mjs`. Delete `.github/workflows/deploy.yml` (GitHub Pages is replaced by Vercel; DNS cutover happens in Task 10). Check `index.html` for a sitemap `<link>` and remove it if present.

- [ ] **Step 2: Attach identities to dossiers**

In `src/lib/intelligence.ts`, find the `visitor_sessions` upsert (line ~130). Add a `user_id` field to the upserted payload. At the top of the enclosing function, before the upsert:

```ts
const { data: authData } = await supabase.auth.getSession();
const userId = authData.session?.user?.id ?? null;
```

and include `user_id: userId,` in the upsert object. Read the surrounding code first and match its style.

- [ ] **Step 3: Clearance row in the dossier**

In `src/components/VisitorDossier.tsx`: import `getIdentity` and its type from `../lib/identity`, add state:

```tsx
const [identity, setIdentity] = useState<Identity | null>(null)
useEffect(() => { getIdentity().then(setIdentity).catch(() => {}) }, [])
```

Inside the open panel (the `key="panel"` motion.div), above the traits list, insert:

```tsx
{identity && (
  <div className="font-mono text-[9px] tracking-widest mb-2" style={{ color: '#7aff8c' }}>
    CLEARANCE: GRANTED — {identity.email}
  </div>
)}
```

Read the panel's existing structure first and place the row where the layout keeps breathing.

- [ ] **Step 4: Helen greets by name**

Read `src/components/HelenNarrates.tsx` end to end. Find where her opening narration line is chosen. Using `getIdentity()`, when an identity exists, make her first line on a fresh session:

```
Welcome back, {name}. Your clearance is current.
```

Follow the component's existing line-selection pattern exactly; do not restructure it. If the component's structure makes a per-session first line genuinely awkward, add the greeting to the narration pool weighted to fire early, and note the deviation in the commit message.

- [ ] **Step 5: Verify in the dev server**

Run: `pnpm run dev`. The app will show empty content (RLS wall, no approved session in dev) — that is expected. Confirm no console errors from the modified files (use the preview browser console).

- [ ] **Step 6: Typecheck, test, commit**

Run: `pnpm run typecheck && pnpm test` — expected PASS.

```bash
git add -A
git commit -m "feat(gate): retire SEO, attach identities — helen knows your name"
```

---

### Task 10: Deploy — Vercel project, Supabase config, DNS

Manual/CLI configuration. Do these in order; later steps depend on earlier ones.

**Files:** none in-repo (dashboard + CLI work). Record what was done in the commit-message-free checklist below.

- [ ] **Step 1: Generate and store the gate secrets**

```bash
openssl rand -hex 32
```

In the Supabase dashboard → SQL editor:

```sql
select vault.create_secret('<the-random-hex>', 'gate_link_secret');
select vault.create_secret('https://<PROJECT_REF>.supabase.co/functions/v1', 'gate_functions_url');
```

`<PROJECT_REF>` comes from `VITE_SUPABASE_URL` in `.env` (the subdomain).

- [ ] **Step 2: Deploy the edge function with JWT verification off**

```bash
supabase functions deploy decide-access --no-verify-jwt
supabase secrets set GATE_LINK_SECRET=<the-same-random-hex>
```

Expected: deploy succeeds; `supabase functions list` shows decide-access.

- [ ] **Step 3: Supabase Auth configuration (dashboard)**

- Auth → Settings → JWT expiry: **900 seconds**.
- Auth → URL configuration → Site URL: `https://conscious-shell.com`. Add redirect URL `https://conscious-shell.com/auth/confirm` (and `http://localhost:5173/auth/confirm` for dev).
- Auth → Email templates → Magic Link: replace the body with themed copy. Subject: `The department has received your application`. Body must use the token-hash link form (works cross-device, unlike the default PKCE link):

```html
<div style="font-family:monospace;background:#07070a;color:#e8e4dc;padding:32px">
  <p style="letter-spacing:3px;color:#888">ENTRY CONTROL // CONSCIOUS SHELL</p>
  <p>An identity matching this address has applied for entry.</p>
  <p style="margin:24px 0">
    <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email"
       style="color:#7aff8c">CONFIRM YOUR IDENTITY</a>
  </p>
  <p style="color:#888;font-size:12px">If you did not apply, disregard this letter. The department already has.</p>
</div>
```

- [ ] **Step 4: Create the Vercel project**

```bash
vercel link
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel deploy --prod
```

(Values from `.env`. If `vercel` CLI is absent: `pnpm add -g vercel`, then `vercel login` with the existing account.) Expected: deployment succeeds; the `*.vercel.app` URL serves the gate to a fresh browser.

- [ ] **Step 5: Smoke-test on the vercel.app URL before DNS**

- Fresh incognito window → `https://<project>.vercel.app/` → intake terminal, and the network tab shows NO main-app assets (only gate chunks).
- `https://<project>.vercel.app/work/anything` → intake terminal.
- `https://<project>.vercel.app/og-image.png` → serves.
- `https://<project>.vercel.app/robots.txt` → `Disallow: /`.

- [ ] **Step 6: DNS cutover**

In the DNS provider for conscious-shell.com: point the apex A record to Vercel (`76.76.21.21`) and `www` CNAME to `cname.vercel-dns.com`, then add the domain to the Vercel project. Remove the GitHub Pages custom-domain binding in repo Settings → Pages. Delete `public/CNAME` from the repo (GitHub Pages artifact, meaningless on Vercel):

```bash
git rm public/CNAME && git commit -m "chore(gate): retire GitHub Pages CNAME"
```

Expected: `https://conscious-shell.com` serves from Vercel (check `curl -sI https://conscious-shell.com | grep -i server`).

- [ ] **Step 7: Seed the owner**

Visit the live gate, request access with `conscious.shell@gmail.com`, click the magic link. The signup trigger stamps owner + approved automatically. Confirm you land in the full site.

If the account already existed in Supabase Auth before this feature (check dashboard → Auth → Users), the trigger never fired for it; stamp manually in SQL editor:

```sql
update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
    || '{"approved": true, "role": "owner"}'::jsonb
  where email = 'conscious.shell@gmail.com';
```

Then sign out and back in.

---

### Task 11: Full verification walk

Per the spec and CLAUDE.md: walk it as a user, from scratch, against production. Every step needs observed evidence, not inference.

- [ ] **Step 1: Cold visit.** Fresh incognito browser → conscious-shell.com. Expect the intake terminal. Open devtools network tab: confirm zero main-app JS chunks loaded, no Supabase content queries.
- [ ] **Step 2: Application.** Enter a fresh test email you control (not the owner address). Expect TRANSMISSION SENT. Confirm the themed magic-link email arrives.
- [ ] **Step 3: Verify.** Click the link. Expect the waiting room: APPLICATION UNDER REVIEW.
- [ ] **Step 4: Notification.** Confirm the "Access application" email arrived at Deckard@conscious-shell.com with GRANT CLEARANCE and SHELVE links.
- [ ] **Step 5: Approve.** Tap GRANT CLEARANCE. Expect the CLEARANCE GRANTED page. Within ~60s the test browser's waiting room should walk itself into the site (or on manual reload).
- [ ] **Step 6: Persistence.** Refresh: still in. Close the browser entirely, reopen, revisit: still in. Confirm the dossier badge shows CLEARANCE: GRANTED with the test email, and Helen's greeting names them.
- [ ] **Step 7: Data lifecycle.** In Supabase: `select email, status from access_requests;` shows the test identity approved. `select user_id from visitor_sessions where user_id is not null;` shows the linkage.
- [ ] **Step 8: Revocation.** In SQL editor:

```sql
update auth.users set raw_app_meta_data = raw_app_meta_data - 'approved'
  where email = '<test-email>';
update public.access_requests set status = 'revoked', decided_at = now()
  where email = '<test-email>';
```

Within 15 minutes (token TTL), the test browser must land back on the gate. Verify.
- [ ] **Step 9: Denial is invisible.** Request access with a second fresh email, click its magic link, then tap SHELVE THE APPLICATION in the notification. Confirm the second browser still shows APPLICATION UNDER REVIEW, identical to pending, after reload and after an hour.
- [ ] **Step 10: The second wall.** With an unapproved session's access token (copy from the second browser's cookies), curl a content table directly:

```bash
curl -s "$VITE_SUPABASE_URL/rest/v1/portfolio_projects?select=id" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Authorization: Bearer <unapproved-access-token>"
```

Expect `[]`. RLS holds even without the middleware.
- [ ] **Step 11: Unfurl.** Paste conscious-shell.com into a LinkedIn/iMessage compose box; confirm the og-image preview still renders.
- [ ] **Step 12: Error telemetry.** Query `app_logs` (per the error-telemetry memory) for any new production client errors since deploy. Zero gate-related errors expected.
- [ ] **Step 13: Commit any fixes, then final commit**

```bash
git add -A && git commit -m "feat(gate): verified end to end — the department is open for applications"
```

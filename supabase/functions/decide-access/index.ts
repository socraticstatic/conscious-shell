// A link from the owner's inbox opens a confirmation page; a deliberate
// button press decides the application. The HMAC token is the only
// credential; JWT verification is disabled for this function.
//
// GET never mutates. Mail scanners prefetch links in notification emails, and
// a scanner must never be able to decide someone's application on our behalf.
// GET verifies the token, fetches the row, and, if it is still pending,
// renders a confirmation page with a single button inside a <form
// method="post">. Only a POST (the human clicking that button) performs the
// decision.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { verifyGateToken } from './token.ts';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function page(title: string, body: string, status = 200): Response {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title></head>` +
      `<body style="background:#07070a;color:#e8e4dc;font-family:monospace;display:flex;` +
      `min-height:100vh;align-items:center;justify-content:center;text-align:center">` +
      `<div><p style="letter-spacing:4px;color:#888">${esc(title)}</p><div>${body}</div></div>` +
      `</body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}

// Confirmation page for a still-pending application. The form posts to the
// same URL (empty action) so the token in the ?t= query string travels with
// it. This is the only place a decision can originate from.
function confirmPage(action: 'approve' | 'deny', email: string): Response {
  const color = action === 'approve' ? '#7aff8c' : '#ff006e';
  const label = action === 'approve' ? 'CONFIRM: GRANT CLEARANCE' : 'CONFIRM: SHELVE APPLICATION';
  const heading = action === 'approve' ? 'CONFIRM CLEARANCE' : 'CONFIRM SHELVING';
  const body =
    `<p>${esc(email)} has applied for access.</p>` +
    `<form method="post" action="">` +
    `<button type="submit" style="background:#07070a;color:${color};border:1px solid ${color};` +
    `font-family:monospace;letter-spacing:2px;padding:12px 24px;cursor:pointer">${label}</button>` +
    `</form>`;
  return page(heading, body);
}

Deno.serve(async (req) => {
  const method = req.method;
  if (method !== 'GET' && method !== 'POST') {
    return page('METHOD NOT ALLOWED', 'Only GET and POST are accepted here.', 405);
  }

  const t = new URL(req.url).searchParams.get('t') ?? '';
  const secret = Deno.env.get('GATE_LINK_SECRET') ?? '';
  if (!secret) return page('MISCONFIGURED', 'GATE_LINK_SECRET is not set.', 500);

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!supabaseUrl || !serviceRoleKey) {
    return page('MISCONFIGURED', 'Supabase credentials are not set.', 500);
  }

  const v = await verifyGateToken(t, secret, Date.now());
  if (!v.ok) return page('SIGNAL INVALID', 'This link is not recognized, or it has expired.', 400);

  const admin = createClient(supabaseUrl, serviceRoleKey);

  const { data: row, error } = await admin
    .from('access_requests')
    .select('id, user_id, email, status')
    .eq('id', v.id)
    .single();
  if (error || !row) return page('NO RECORD', 'No such application on file.', 404);

  if (method === 'GET') {
    // An approve link on an already-approved row still shows the confirm
    // form. A half-stamped clearance (flip won, stamp failed) heals when the
    // owner clicks the link again and confirms; re-stamping is idempotent.
    if (v.action === 'approve' && row.status === 'approved') {
      return confirmPage(v.action, row.email);
    }
    if (row.status !== 'pending') {
      return page('ALREADY DECIDED', `This application was already ${esc(row.status)}.`, 409);
    }
    return confirmPage(v.action, row.email);
  }

  // POST from here on: a human confirmed the decision on the page above.
  // Order matters. The status flip is scoped to status = pending, so of two
  // concurrent decisions exactly one wins the row. Clearance metadata is
  // stamped only after winning (or confirming) the flip to approved, so a
  // denied applicant can never end up holding a clearance. If the flip won
  // but the stamp failed, a re-click heals it: the re-read below sees the
  // row already approved and stamps again, which is idempotent.
  if (v.action === 'approve') {
    const { data: flipped, error: e2 } = await admin
      .from('access_requests')
      .update({ status: 'approved', decided_at: new Date().toISOString() })
      .eq('id', row.id)
      .eq('status', 'pending')
      .select('id');

    if (e2 || !flipped || flipped.length === 0) {
      // Lost the race, or this is a re-click. Re-read once to find out which.
      const { data: fresh, error: e3 } = await admin
        .from('access_requests')
        .select('status')
        .eq('id', row.id)
        .single();
      if (e3 || !fresh) return page('ERROR', 'Could not record the decision. Try again.', 500);
      if (fresh.status === 'pending') {
        // Nothing decided; the update itself failed. Retrying is safe.
        return page('ERROR', 'Could not record the decision. Try again.', 500);
      }
      if (fresh.status !== 'approved') {
        return page('ALREADY DECIDED', `This application was already ${esc(fresh.status)}.`, 409);
      }
      // Approved but possibly unstamped (a half-completed approve). Stamp it.
    }

    const { error: e1 } = await admin.auth.admin.updateUserById(row.user_id, {
      app_metadata: { approved: true },
    });
    if (e1) {
      return page(
        'ERROR',
        'The record is approved, but the clearance did not stamp. Click the link again to finish. ' +
          'Retrying is safe: stamping an approved clearance twice changes nothing.',
        500,
      );
    }
    return page('CLEARANCE GRANTED', `${esc(row.email)} may enter. Their next page load lets them in.`);
  }

  // Deny never touches clearance metadata.
  const { data: flipped, error: e2 } = await admin
    .from('access_requests')
    .update({ status: 'denied', decided_at: new Date().toISOString() })
    .eq('id', row.id)
    .eq('status', 'pending')
    .select('id');
  if (e2 || !flipped || flipped.length === 0) {
    const { data: fresh, error: e3 } = await admin
      .from('access_requests')
      .select('status')
      .eq('id', row.id)
      .single();
    if (e3 || !fresh) return page('ERROR', 'Could not record the decision. Try again.', 500);
    if (fresh.status === 'pending') {
      // Nothing decided; the update itself failed. Retrying is safe.
      return page('ERROR', 'Could not record the decision. Try again.', 500);
    }
    if (fresh.status !== 'denied') {
      return page('ALREADY DECIDED', `This application was already ${esc(fresh.status)}.`, 409);
    }
    // Already denied: a re-click. Fall through to the same answer.
  }
  return page('APPLICATION SHELVED', `${esc(row.email)} remains under review. From where they stand, forever.`);
});

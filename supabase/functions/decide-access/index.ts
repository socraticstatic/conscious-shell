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

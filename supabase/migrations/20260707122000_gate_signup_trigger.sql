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

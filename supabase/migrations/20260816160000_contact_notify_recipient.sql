/*
  # Contact notification → micah@conscious-shell.com

  The 2026-08-16 audit found no notification email was ever received for a
  live contact_submissions insert. One of the two failure candidates is the
  recipient: Deckard@conscious-shell.com may never have been created as an
  alias on the domain, in which case Resend sends and the mail bounces.
  micah@conscious-shell.com is a verified working mailbox (present in Apple
  Mail), so route there and retire the suspect. Everything else about the
  function is unchanged from 20260619150000.
*/

create or replace function public.notify_contact_submission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  api_key text;
  v_name  text := replace(replace(replace(coalesce(new.name, ''),  '&', '&amp;'), '<', '&lt;'), '>', '&gt;');
  v_email text := replace(replace(replace(coalesce(new.email, ''), '&', '&amp;'), '<', '&lt;'), '>', '&gt;');
  v_msg   text := replace(replace(replace(coalesce(new.message, ''),'&', '&amp;'), '<', '&lt;'), '>', '&gt;');
  body jsonb;
begin
  select decrypted_secret into api_key
  from vault.decrypted_secrets
  where name = 'resend_api_key'
  limit 1;

  if api_key is null then
    raise warning 'resend_api_key missing from vault; contact email not sent';
    return new;
  end if;

  body := jsonb_build_object(
    'from', 'Conscious Shell <contact@familyroots.center>',
    'to',   jsonb_build_array('micah@conscious-shell.com'),
    'subject', 'New contact form submission from ' || coalesce(new.name, '(no name)'),
    'html',
      '<h2>New contact form submission</h2>' ||
      '<p><strong>Name:</strong> '    || v_name  || '</p>' ||
      '<p><strong>Email:</strong> '   || v_email || '</p>' ||
      '<p><strong>Message:</strong></p><p>' || replace(v_msg, E'\n', '<br>') || '</p>' ||
      '<hr><p style="color:#888;font-size:12px">via conscious-shell.com contact form</p>'
  );

  -- only add reply_to when the submitted email is well-formed
  if new.email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    body := body || jsonb_build_object('reply_to', new.email);
  end if;

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || api_key,
      'Content-Type',  'application/json'
    ),
    body := body
  );

  return new;
end;
$$;

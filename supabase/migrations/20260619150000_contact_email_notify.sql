/*
  # Email contact-form submissions via Resend

  On each INSERT into contact_submissions, POST the submission to the Resend
  API (https://api.resend.com/emails) using pg_net, delivering a notification
  to Deckard@conscious-shell.com.

  - The Resend API key is read at runtime from Supabase Vault
    (vault.decrypted_secrets, name 'resend_api_key'). It is NOT in this file.
  - SECURITY DEFINER + empty search_path; all objects fully qualified.
  - User input is HTML-escaped. reply_to is set only when the email is valid.
  - "from" uses the verified familyroots.center domain until conscious-shell.com
    is verified in Resend; swap the from address then.

  Prerequisite: pg_net extension enabled (done out-of-band as superuser).
*/

create extension if not exists pg_net with schema extensions;

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
    'to',   jsonb_build_array('Deckard@conscious-shell.com'),
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

drop trigger if exists trg_notify_contact_submission on public.contact_submissions;
create trigger trg_notify_contact_submission
  after insert on public.contact_submissions
  for each row execute function public.notify_contact_submission();

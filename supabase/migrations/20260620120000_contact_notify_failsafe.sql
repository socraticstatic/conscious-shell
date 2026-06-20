/*
  # Make the contact-form email notification fail-safe

  The notify trigger runs inside the INSERT transaction. If anything in it
  threw (vault read, pg_net, a malformed value), the whole INSERT rolled back
  and the visitor saw "transmission failed" even though their message was fine.

  Wrap the notification body in an exception handler: a notification failure now
  only logs a warning; the submission always commits. A dropped email is far
  better than a dropped lead.
*/

create or replace function public.notify_contact_submission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  api_key text;
  v_name  text;
  v_email text;
  v_msg   text;
  body jsonb;
begin
  begin
    select decrypted_secret into api_key
    from vault.decrypted_secrets
    where name = 'resend_api_key'
    limit 1;

    if api_key is null then
      raise warning 'resend_api_key missing from vault; contact email not sent';
      return new;
    end if;

    v_name  := replace(replace(replace(coalesce(new.name, ''),  '&', '&amp;'), '<', '&lt;'), '>', '&gt;');
    v_email := replace(replace(replace(coalesce(new.email, ''), '&', '&amp;'), '<', '&lt;'), '>', '&gt;');
    v_msg   := replace(replace(replace(coalesce(new.message, ''),'&', '&amp;'), '<', '&lt;'), '>', '&gt;');

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
  exception
    when others then
      -- Never let a notification failure roll back the visitor's submission.
      raise warning 'contact notify failed (submission still saved): %', sqlerrm;
  end;

  return new;
end;
$$;

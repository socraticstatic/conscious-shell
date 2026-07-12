/*
  # Drop the approval gate's Vault secrets

  The signup trigger (dropped in 20260712000000) read these from Vault to
  sign the approve/deny email links and build the decide-access URL. Nothing
  references them now. Remove them.

  Idempotent: on a fresh database these rows never existed, so the delete
  simply affects zero rows. resend_api_key is intentionally left in place —
  the contact form's email notify path still uses it.
*/

do $$
declare n int;
begin
  delete from vault.secrets where name in ('gate_link_secret', 'gate_functions_url');
  get diagnostics n = row_count;
  raise notice 'dropped % gate vault secret(s)', n;
end $$;

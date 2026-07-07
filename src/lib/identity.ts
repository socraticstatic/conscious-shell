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

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

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[0-9a-f]+$/.test(hex) || hex.length % 2 !== 0) return null;
  const out = new Uint8Array(new ArrayBuffer(hex.length / 2));
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

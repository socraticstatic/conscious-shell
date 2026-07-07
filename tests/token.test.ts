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

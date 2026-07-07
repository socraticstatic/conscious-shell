import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { supabase } from '../lib/supabase';
import '../index.css';

// The intake terminal. Everything an unapproved identity will ever see.
// Denied and pending are the same room on purpose — see the spec.

type GateState = 'boot' | 'identify' | 'sent' | 'pending' | 'error';

function Gate() {
  const [state, setState] = useState<GateState>('boot');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get('token_hash');
      if (window.location.pathname === '/auth/confirm' && tokenHash) {
        const { error } = await supabase.auth.verifyOtp({ type: 'email', token_hash: tokenHash });
        if (error) {
          setNote('The transmission could not be verified. Request a new one.');
          setState('identify');
          return;
        }
        window.history.replaceState({}, '', '/');
      }
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        setState('identify');
        return;
      }
      if ((session.user.app_metadata as Record<string, unknown>)?.approved === true) {
        window.location.replace('/');
        return;
      }
      setState('pending');
    })().catch(() => setState('identify'));
  }, []);

  // While under review, quietly refresh the session once a minute. The
  // moment clearance is stamped, the next refreshed token carries the
  // claim and the visitor walks in without touching anything.
  useEffect(() => {
    if (state !== 'pending') return;
    const id = setInterval(async () => {
      const { data } = await supabase.auth.refreshSession();
      if ((data.session?.user.app_metadata as Record<string, unknown>)?.approved === true) {
        window.location.replace('/');
      }
    }, 60_000);
    return () => clearInterval(id);
  }, [state]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
    setBusy(true);
    setNote('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    setBusy(false);
    if (error) {
      setNote('Transmission failed. Wait a moment and try again.');
      return;
    }
    setState('sent');
  };

  return (
    <div className="min-h-[100dvh] bg-[#07070a] text-[#e8e4dc] flex items-center justify-center p-6">
      <div className="w-full max-w-md font-mono">
        <p className="text-[10px] tracking-[0.4em] text-[#e8e4dc]/40 mb-8">
          CONSCIOUS SHELL // ENTRY CONTROL
        </p>

        {state === 'boot' && <p className="text-sm text-[#e8e4dc]/60 animate-pulse">reading credentials...</p>}

        {state === 'identify' && (
          <form onSubmit={submit} className="space-y-6">
            <p className="text-lg tracking-widest">IDENTIFY YOURSELF.</p>
            <p className="text-xs text-[#e8e4dc]/60 leading-relaxed">
              This site admits registered identities only. Leave a registry
              contact and the department will write to you.
            </p>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="registry contact (email)"
              className="w-full bg-transparent border border-[#e8e4dc]/30 rounded px-4 py-3 text-sm outline-none focus:border-[#e8e4dc]/70 placeholder:text-[#e8e4dc]/30"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full border border-[#e8e4dc]/40 rounded px-4 py-3 text-xs tracking-[0.3em] hover:bg-[#e8e4dc]/10 disabled:opacity-40"
            >
              {busy ? 'TRANSMITTING' : 'TRANSMIT'}
            </button>
            {note && <p className="text-xs text-[#ff006e]">{note}</p>}
          </form>
        )}

        {state === 'sent' && (
          <div className="space-y-4">
            <p className="text-lg tracking-widest">TRANSMISSION SENT.</p>
            <p className="text-xs text-[#e8e4dc]/60 leading-relaxed">
              The department has written to {email}. Open the letter and
              follow it back here.
            </p>
          </div>
        )}

        {state === 'pending' && (
          <div className="space-y-4">
            <p className="text-lg tracking-widest">APPLICATION UNDER REVIEW.</p>
            <p className="text-xs text-[#e8e4dc]/60 leading-relaxed">
              Your identity is on file. The department will contact you.
              This page checks on your standing by itself. There is nothing
              else you need to do.
            </p>
            <p className="text-[10px] text-[#e8e4dc]/30 tracking-widest">DO NOT RESUBMIT.</p>
          </div>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary
      label="gate"
      fallback={() => (
        <div className="min-h-[100dvh] bg-[#07070a] text-[#e8e4dc] flex items-center justify-center p-6">
          <p className="font-mono text-sm opacity-70">the door hit an error. it is still closed. reload.</p>
        </div>
      )}
    >
      <Gate />
    </ErrorBoundary>
  </StrictMode>,
);

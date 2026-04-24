import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { SectionHeader } from './Work';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    setErrorMsg('');

    const { error } = await supabase
      .from('contact_submissions')
      .insert({ name, email, message });

    if (error) {
      setState('error');
      setErrorMsg(error.message);
      return;
    }

    setState('success');
    setName('');
    setEmail('');
    setMessage('');
  }

  return (
    <section id="contact" className="relative py-20 md:py-32 border-b border-[#1f1c17]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader path="ssh hello@conscious-shell.com" jp="送信 — transmit" />

        <div className="mt-10 grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8">
            <div className="text-[#6b6660] text-sm leading-relaxed">
              # establishing secure channel ...
              <br /># handshake ........................... <span className="text-[#5ec8d8]">OK</span>
              <br /># channel ............................. <span className="text-[#e7b766]">OPEN</span>
              <br /># latency ............................. <span className="text-[#5ec8d8]">~48h</span>
            </div>

            <h2 className="mt-8 text-4xl md:text-6xl lg:text-7xl leading-[1.05] chroma text-[#e8e4dc]">
              LET'S BUILD
              <br /> <span className="neon-amber">SOMETHING WORTH</span>
              <br /> SHIPPING<span className="neon-pink">.</span>
            </h2>

            <div className="mt-4 font-jp text-[#5ec8d8] text-sm md:text-base">
              何か形にする価値のあるものを作ろう。
            </div>

            <p className="mt-8 text-[#a8a29e] max-w-xl leading-relaxed">
              Tell me what you're working on — product, team, or both — and I'll reply with an honest read on
              whether I can help. No auto-responders. No sales funnel.
            </p>

            {state === 'success' ? (
              <div className="mt-10 border border-[#1f1c17] p-6">
                <div className="text-xs text-[#6b6660] mb-2"># transmission_status</div>
                <div className="text-[#e7b766] text-lg">MESSAGE RECEIVED.</div>
                <p className="text-[#a8a29e] text-sm mt-2">I'll get back to you within ~48h.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-10 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#6b6660] mb-1">
                      NAME
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent border border-[#1f1c17] focus:border-[#e7b766] px-4 py-3 text-sm text-[#e8e4dc] outline-none transition-colors placeholder-[#4a453e]"
                      placeholder="your name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#6b6660] mb-1">
                      EMAIL
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border border-[#1f1c17] focus:border-[#e7b766] px-4 py-3 text-sm text-[#e8e4dc] outline-none transition-colors placeholder-[#4a453e]"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#6b6660] mb-1">
                    MESSAGE
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-transparent border border-[#1f1c17] focus:border-[#e7b766] px-4 py-3 text-sm text-[#e8e4dc] outline-none transition-colors placeholder-[#4a453e] resize-none"
                    placeholder="what are you building?"
                  />
                </div>

                {state === 'error' && (
                  <div className="text-[#ff6b6b] text-xs">
                    # error: {errorMsg || 'transmission failed — try again'}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={state === 'loading'}
                  className="group flex items-center justify-between gap-4 border border-[#2a2620] hover:border-[#e7b766] disabled:opacity-40 disabled:cursor-not-allowed px-5 py-4 transition-colors text-sm"
                  data-cursor="hover"
                >
                  <span className="flex items-center gap-3 text-[#e8e4dc]">
                    <span className="text-[#e7b766]">$</span>
                    <span>{state === 'loading' ? 'transmitting...' : 'send_message --secure'}</span>
                  </span>
                  <span className="text-[#6b6660] group-hover:text-[#e7b766] transition-colors">→</span>
                </button>
              </form>
            )}

            <div className="mt-10 text-[11px] text-[#4a453e]">
              # session logged · response time ~48h · all tears, in rain
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="border-l border-[#e7b766] pl-5">
              <div className="text-[10px] uppercase tracking-widest text-[#6b6660] mb-2">
                INCEPT — TRANSMISSION FRAGMENT
              </div>
              <p className="text-[#e8e4dc] text-sm leading-relaxed italic">
                "I've seen things you people wouldn't believe … dashboards shipped in the rain, research
                decks lost at the gates of the Tannhäuser Quarterly Review."
              </p>
              <p className="mt-3 font-jp text-[#5ec8d8]/80 text-xs">
                涙のように、雨に流されて。
              </p>
              <div className="mt-4 text-[10px] text-[#4a453e]">
                — excerpt, hypothetical monologue.v4.7
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

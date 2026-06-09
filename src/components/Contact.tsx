import { useState } from 'react';
import { motion } from 'framer-motion';
import { SectionHeader } from './Work';
import { supabase } from '../lib/supabase';

type FormState = 'idle' | 'sending' | 'success' | 'error';
type Fields = { name: string; email: string; message: string };
type Errors = Partial<Fields>;

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = 'required';
  if (!f.email.trim()) e.email = 'required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'invalid address';
  if (!f.message.trim()) e.message = 'required';
  else if (f.message.trim().length < 20) e.message = 'min 20 characters';
  return e;
}

export default function Contact() {
  const [fields, setFields] = useState<Fields>({ name: '', email: '', message: '' });
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [status, setStatus] = useState<FormState>('idle');
  const [serverError, setServerError] = useState('');

  const errors = validate(fields);
  const hasErrors = Object.keys(errors).length > 0;

  const set = (k: keyof Fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [k]: e.target.value }));

  const blur = (k: keyof Fields) => () =>
    setTouched((t) => ({ ...t, [k]: true }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (hasErrors) return;
    setStatus('sending');
    setServerError('');
    const { error } = await supabase.from('contact_submissions').insert({
      name: fields.name.trim(),
      email: fields.email.trim(),
      message: fields.message.trim(),
    });
    if (error) {
      setServerError(error.message);
      setStatus('error');
    } else {
      setStatus('success');
    }
  };

  return (
    <section id="contact" className="relative py-20 md:py-32 border-b border-[#1f1c17]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">
        <SectionHeader path="ssh hello@conscious-shell.com" jp="送信 — transmit" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-10 grid grid-cols-12 gap-8"
        >
          <div className="col-span-12 lg:col-span-8">
            <div className="text-[#6b6660] text-sm leading-relaxed font-mono">
              # establishing secure tyrell.link ...
              <br /># handshake ...........................{' '}
              <span className="text-[#00d4ff]">OK</span>
              <br /># channel .............................{' '}
              <span className="text-[#e040fb]">OPEN</span>
              <br /># latency .............................{' '}
              <span className="text-[#00d4ff]">~48h</span>
            </div>

            <h2 className="mt-8 text-3xl sm:text-4xl md:text-6xl lg:text-7xl leading-[1.05] chroma text-[#e8e4dc]">
              LET'S BUILD
              <br /> <span className="neon-amber">SOMETHING WORTH</span>
              <br /> SHIPPING<span className="neon-pink">.</span>
            </h2>

            <div className="mt-4 font-jp text-[#00d4ff] text-sm md:text-base">
              何か形にする価値のあるものを作ろう。
            </div>

            <p className="mt-8 text-[#a8a29e] max-w-xl leading-relaxed">
              Tell me what you're working on — product, team, or both — and I'll reply with an
              honest read on whether I can help. No auto-responders. No sales funnel.
            </p>

            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-10 border border-[#1f1c17] p-6 font-mono text-sm space-y-1"
              >
                <div className="text-[#00d4ff]"># handshake CONFIRMED</div>
                <div className="text-[#6b6660]"># message queued for human review</div>
                <div className="text-[#6b6660]"># response time ~48h</div>
                <div className="mt-3 text-[#4a453e]">— transmission complete.</div>
              </motion.div>
            ) : (
              <form onSubmit={submit} noValidate className="mt-10 space-y-5">
                {(
                  [
                    { key: 'name'  as const, label: '> name',  type: 'text',  placeholder: 'your name' },
                    { key: 'email' as const, label: '> email', type: 'email', placeholder: 'you@domain.com' },
                  ]
                ).map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-[11px] text-[#6b6660] font-mono tracking-widest mb-1.5">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={fields[key]}
                      onChange={set(key)}
                      onBlur={blur(key)}
                      placeholder={placeholder}
                      className="w-full bg-[#0b0a08] border border-[#2a2620] focus:border-[#00d4ff] outline-none px-4 py-3 text-[#e8e4dc] font-mono text-sm placeholder:text-[#4a453e] transition-colors"
                    />
                    {touched[key] && errors[key] && (
                      <div className="mt-1 text-[10px] text-[#ff006e] font-mono">
                        # {errors[key]}
                      </div>
                    )}
                  </div>
                ))}

                <div>
                  <label className="block text-[11px] text-[#6b6660] font-mono tracking-widest mb-1.5">
                    &gt; message
                  </label>
                  <textarea
                    rows={5}
                    value={fields.message}
                    onChange={set('message')}
                    onBlur={blur('message')}
                    placeholder="what are you working on?"
                    className="w-full bg-[#0b0a08] border border-[#2a2620] focus:border-[#00d4ff] outline-none px-4 py-3 text-[#e8e4dc] font-mono text-sm placeholder:text-[#4a453e] transition-colors resize-none"
                  />
                  {touched.message && errors.message && (
                    <div className="mt-1 text-[10px] text-[#ff006e] font-mono">
                      # {errors.message}
                    </div>
                  )}
                </div>

                {status === 'error' && (
                  <div className="text-[11px] text-[#ff006e] font-mono">
                    # transmission failed — {serverError || 'unknown error'}
                  </div>
                )}

                <div className="flex items-center gap-4 flex-wrap">
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="border border-[#e040fb] text-[#e040fb] px-6 py-3 text-sm font-mono tracking-widest hover:bg-[#e040fb] hover:text-[#07070a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {status === 'sending' ? '// transmitting...' : '$ transmit'}
                  </button>
                  <a
                    href="mailto:hello@conscious-shell.com"
                    className="text-[11px] text-[#4a453e] hover:text-[#a8a29e] font-mono transition-colors"
                  >
                    or mail hello@conscious-shell.com
                  </a>
                </div>
              </form>
            )}

            <div className="mt-10 text-[11px] text-[#4a453e] font-mono">
              # session logged · response time ~48h · all tears, in rain
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="border-l border-[#e040fb] pl-5">
              <div className="text-[10px] uppercase tracking-widest text-[#6b6660] mb-2">
                INCEPT — TRANSMISSION FRAGMENT
              </div>
              <p className="text-[#e8e4dc] text-sm leading-relaxed italic">
                "I've seen things you people wouldn't believe … dashboards shipped in the rain,
                research decks lost at the gates of the Tannhäuser Quarterly Review."
              </p>
              <p className="mt-3 font-jp text-[#00d4ff]/80 text-xs">
                涙のように、雨に流されて。
              </p>
              <div className="mt-4 text-[10px] text-[#4a453e]">
                — excerpt, hypothetical monologue.v4.7
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

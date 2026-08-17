import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useDocumentMeta } from '../lib/useDocumentMeta';

// The studio: the practice's own face. Standalone like CaseStudy — no site
// Nav (its links would scroll to nothing here), no dock, no boot, no theater
// on any tier. One column, first person, evidence over adjectives. This page
// exists to be pasted into a warm message and read in ninety seconds.

// The pilot story every buyer recognizes, drawn instead of described:
// launch spike, six-week decay, 8% flatline. The line draws itself once.
function AdoptionCurve() {
  // path: ramp to 90% by week 1, decay to 8% by week 6, flatline.
  const d = 'M0,140 L30,138 C60,10 80,8 120,14 C220,30 300,96 420,124 C500,140 560,142 700,142';
  return (
    <figure className="mt-12 select-none" aria-label="Typical pilot adoption: launch spike, six-week decay to 8% of seats">
      <svg viewBox="0 0 700 160" className="w-full h-auto block">
        {[0, 35, 70, 105, 140].map((y) => (
          <line key={y} x1="0" x2="700" y1={y + 2} y2={y + 2} stroke="#1f1c17" strokeWidth="1" />
        ))}
        <path
          d={d}
          fill="none"
          stroke="#e8e4dc"
          strokeWidth="2"
          strokeDasharray="900"
          strokeDashoffset="900"
          style={{ animation: 'studio-draw 2.2s cubic-bezier(0.22,1,0.36,1) 0.3s forwards' }}
        />
        <circle cx="700" cy="142" r="4" fill="#e040fb" style={{ animation: 'studio-fade 0.5s ease 2.4s forwards', opacity: 0 }} />
      </svg>
      {/* Annotations live BELOW the plot — an axis caption can't collide with
          the line at any viewport, unlike percent-positioned overlays. */}
      <div className="mt-2 flex items-baseline justify-between font-mono text-[11px] sm:text-[12px] tracking-[0.15em]">
        <span className="text-[#605a52]">launch<span className="hidden sm:inline"> demo</span> · 90%</span>
        <span className="text-[#e040fb]" style={{ animation: 'studio-fade 0.5s ease 2.4s forwards', opacity: 0 }}>
          week 6 · 8%<span className="hidden sm:inline"> of seats</span>
        </span>
      </div>
      <style>{`
        @keyframes studio-draw { to { stroke-dashoffset: 0; } }
        @keyframes studio-fade { to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          figure svg path { animation: none !important; stroke-dashoffset: 0 !important; }
          figure svg circle, figure span { animation: none !important; opacity: 1 !important; }
        }
      `}</style>
      <figcaption className="mt-2 font-mono text-[12px] tracking-[0.2em] text-[#605a52]">
        the curve nobody puts in the deck
      </figcaption>
    </figure>
  );
}

// Monospace diagrams are the house language. Every diagram is designed at
// 40 characters or fewer so it renders on a 375px phone without scrolling.
function Ascii({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="my-6">
      {label && (
        <div className="mb-2 font-mono text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-[#605a52] whitespace-nowrap">{label}</div>
      )}
      <pre className="text-[13px] sm:text-[14px] leading-[1.45] whitespace-pre text-[#8a837a] overflow-hidden" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Cascadia Mono', monospace" }}>
        {children}
      </pre>
    </div>
  );
}

const M = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#e040fb]">{children}</span>
);
const B = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#e8e4dc]">{children}</span>
);

const PROOF = [
  ['48%', 'error reduction', '/work/ge-nuclear-fortran-unification', 'GE Nuclear. Hundreds of legacy apps unified into role-based dashboards.'],
  ['$300K+', 'recovered', '/work/at-and-t-product-design', 'AT&T. One diagnostics redesign.'],
  ['31%', 'abandonment cut', '/work/us-mint-omnichannel-strategy', 'U.S. Mint. First persona-driven strategy for a government retailer.'],
] as const;

const FAILURES = [
  ['the trust cliff', 'fatal'],
  ['answer-shaped output', 'high'],
  ['outside the record', 'high'],
  ['no draft state', 'medium'],
  ['expertise inversion', 'compounding'],
] as const;

type Fields = { name: string; email: string; company: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = 'required';
  if (!f.email.trim()) e.email = 'required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'invalid address';
  if (!f.message.trim()) e.message = 'required';
  else if (f.message.trim().length < 20) e.message = 'min 20 characters';
  return e;
}

function StudioIntake() {
  const [fields, setFields] = useState<Fields>({ name: '', email: '', company: '', message: '' });
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const errors = validate(fields);
  const set = (k: keyof Fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [k]: e.target.value }));
  const blur = (k: keyof Fields) => () => setTouched((t) => ({ ...t, [k]: true }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(errors).length) return;
    setStatus('sending');
    const { error } = await supabase.from('contact_submissions').insert({
      name: fields.name.trim(),
      email: fields.email.trim(),
      company: fields.company.trim(),
      message: fields.message.trim(),
      source: 'studio',
    });
    setStatus(error ? 'error' : 'success');
  };

  if (status === 'success') {
    return (
      <p className="font-serif text-[17px] leading-[1.7] text-[#e8e4dc]">
        Got it. You&rsquo;ll hear from me within 48 hours, with an honest read on
        whether I can help.
      </p>
    );
  }

  const inputCls =
    'w-full bg-transparent border border-[#2a2620] focus:border-[#e040fb] outline-none px-4 py-3 min-h-[44px] text-[16px] text-[#e8e4dc] placeholder:text-[#605a52] transition-colors';
  const err = (k: keyof Fields) =>
    touched[k] && errors[k] ? (
      <div className="mt-1 text-[11px] font-mono text-[#e040fb]"># {errors[k]}</div>
    ) : null;

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <input value={fields.name} onChange={set('name')} onBlur={blur('name')} placeholder="name" className={inputCls} />
          {err('name')}
        </div>
        <div>
          <input type="email" value={fields.email} onChange={set('email')} onBlur={blur('email')} placeholder="email" className={inputCls} />
          {err('email')}
        </div>
      </div>
      <input value={fields.company} onChange={set('company')} placeholder="company (optional)" className={inputCls} />
      <div>
        <label className="block text-[11px] font-mono tracking-[0.25em] text-[#6b6660] mb-1.5">
          &gt; what&rsquo;s stalling?
        </label>
        <textarea rows={4} value={fields.message} onChange={set('message')} onBlur={blur('message')} placeholder="the pilot, the team, where it stopped" className={`${inputCls} resize-none`} />
        {err('message')}
      </div>
      {status === 'error' && (
        <div className="text-[12px] font-mono text-[#e040fb]"># transmission failed — try email instead</div>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="min-h-[44px] px-6 border border-[#e040fb] text-[#e040fb] font-mono text-sm tracking-widest hover:bg-[#e040fb] hover:text-[#0b0a08] active:bg-[#e040fb] active:text-[#0b0a08] transition-colors disabled:opacity-40"
      >
        {status === 'sending' ? '// sending...' : 'request the call'}
      </button>
    </form>
  );
}

const label = 'text-[11px] font-mono tracking-[0.25em] uppercase text-[#6b6660]';

export default function Studio() {
  useDocumentMeta({
    title: 'The AI Adoption Teardown — Micah Boswell',
    description:
      "Your AI pilot works. Nobody uses it. A two-week teardown that finds out why, and hands your team the fix.",
    url: 'https://conscious-shell.com/studio',
    image: 'https://conscious-shell.com/esper/art-corazon.jpg',
    type: 'website',
  });

  return (
    <main className="min-h-[100dvh] bg-[#0b0a08] text-[#e8e4dc]">
      <div className="max-w-[720px] mx-auto px-5 sm:px-6 py-12 md:py-16">
        {/* header */}
        <div className="flex items-baseline justify-between gap-4 mb-14">
          <div className="font-mono text-[11px] tracking-[0.2em] text-[#a8a29e]">
            <span className="text-[#e040fb]">■</span> micah boswell · the studio
          </div>
          <Link to="/" className="font-mono text-[11px] tracking-[0.2em] text-[#6b6660] hover:text-[#e040fb] min-h-[44px] inline-flex items-center transition-colors">
            ← the lab
          </Link>
        </div>

        {/* hero */}
        <h1 className="text-[44px] sm:text-6xl md:text-[68px] leading-[1.04] tracking-tight font-mono font-light">
          Your AI pilot works.
          <br />
          Nobody uses it<span className="text-[#e040fb]">.</span>
          <span className="inline-block w-[0.5em] h-[0.9em] ml-2 align-baseline bg-[#e040fb] [animation:studio-blink_1.1s_steps(2)_infinite]" aria-hidden />
        </h1>
        <style>{`@keyframes studio-blink { 50% { opacity: 0; } }`}</style>
        <p className="mt-7 font-serif text-[17px] sm:text-[18px] leading-[1.7] text-[#c8c2b7]">
          I&rsquo;m Micah Boswell. Thirty years of enterprise UX, currently
          Experience Lead, DNI at AT&amp;T. I take one outside engagement a
          month: a two-week teardown that finds out why the humans won&rsquo;t
          adopt your AI, and hands your team the fix.
        </p>

        {/* problem */}
        <p className="mt-10 font-serif text-[17px] sm:text-[18px] leading-[1.7] text-[#a8a29e]">
          Most enterprise AI pilots don&rsquo;t fail on the model. They fail at
          the moment a person has to trust the output, change a habit, or
          explain the answer to someone else. That moment is a design problem,
          and it&rsquo;s usually the one nobody staffed.
        </p>

        <AdoptionCurve />

        {/* SKU */}
        <section id="offer" className="mt-16">
          <div className={label}>the engagement</div>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 className="text-2xl sm:text-3xl font-mono text-[#e040fb]">AI Adoption Teardown</h2>
            <span className="font-mono text-[13px] sm:text-[14px] text-[#8a837a]">$18,000 fixed · two weeks · one per month</span>
          </div>
          <div className="mt-8">
            <div className="mb-2 font-mono text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-[#605a52]">ten days, mapped</div>
            <div className="grid grid-cols-[104px_1fr] gap-x-3 gap-y-0 font-mono text-[12px]">
              <span />
              <div className="grid grid-cols-2 gap-x-2 pb-1 text-[10px] tracking-[0.15em] uppercase text-[#605a52]">
                <span>week one</span><span>week two</span>
              </div>
              {[
                ['shadow', 0, 30],
                ['failure map', 30, 20],
                ['redesign', 50, 30],
                ['build path', 80, 15],
                ['readout', 95, 5],
              ].map(([k, start, len]) => (
                <React.Fragment key={k as string}>
                  <span className="py-[5px] text-[12px] sm:text-[13px] text-[#e040fb]">{k}</span>
                  <div className="relative my-[7px] h-[10px] bg-[#16140f]">
                    <div className="absolute inset-y-0 bg-[#e040fb]" style={{ left: `${start}%`, width: `${len}%` }} />
                    <div className="absolute inset-y-0 left-1/2 w-px bg-[#0b0a08]" />
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
          <ul className="mt-4">
            {[
              ['shadow', 'the real users inside the real workflow. Not interviews. The work itself.'],
              ['failure map', 'every human drop-out point, ranked by cost.'],
              ['redesign', 'the new interaction model, tested with your users.'],
              ['build path', 'what your engineers ship, in order, with acceptance criteria.'],
            ].map(([k, v]) => (
              <li key={k} className="grid grid-cols-[104px_1fr] gap-x-3 py-1.5 items-baseline">
                <span className="font-mono text-[13px] text-[#e040fb]">{k}</span>
                <span className="font-serif text-[15px] leading-[1.6] text-[#a8a29e]">{v}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 font-mono text-[12px] leading-relaxed text-[#8a837a]">
            You keep: the failure map, the redesign, the build path, and the recording of the readout.
          </p>
        </section>

        {/* proof */}
        <section className="mt-16">
          <div className={label}>measured, not promised</div>
          <div className="mt-5 grid sm:grid-cols-3 gap-px bg-[#1f1c17] border border-[#1f1c17]">
            {PROOF.map(([num, what, href, ctx]) => (
              <Link key={href} to={href} className="group bg-[#0b0a08] p-5 hover:bg-[#121008] transition-colors">
                <div className="text-[44px] leading-none tabular-nums font-mono text-[#e8e4dc] group-hover:text-[#e040fb] transition-colors">{num}</div>
                <div className="mt-1 font-mono text-[11px] tracking-[0.15em] uppercase text-[#8a837a]">{what}</div>
                <div className="mt-3 font-serif text-[13px] leading-[1.55] text-[#6b6660]">{ctx}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* sample */}
        <section id="sample" className="mt-16 border border-[#1f1c17] p-4 sm:p-8">
          <div className={label}>case file · composite, drawn from real patterns · no client named</div>
          <h2 className="mt-3 text-2xl font-mono text-[#e8e4dc]">the assistant nobody asked twice</h2>
          <p className="mt-4 font-serif text-[16px] leading-[1.7] text-[#a8a29e]">
            An ops copilot. The demo dazzled leadership. Six weeks later, 8% of
            seats. The model was fine. Here is where the humans left.
          </p>

          <div className="mt-8">
            <div className={label}>failure map · where the seats went</div>
            <div className="mt-5 font-mono">
              {[
                ['100%', 100, 'seats at launch', null],
                [' 40%', 40, null, 'first wrong answer, no source shown'],
                [' 23%', 23, null, 'paragraphs where a value would do'],
                [' 15%', 15, null, 'wrong tab · truth lives in the ticket'],
                ['  8%', 8, null, 'no undo, no draft state'],
              ].map(([pct, w, note, reason], i) => (
                <div key={pct as string}>
                  {reason && (
                    <div className="ml-[3px] border-l border-[#2a2620] pl-4 py-2 text-[12px] sm:text-[13px] text-[#605a52]">
                      {reason}
                    </div>
                  )}
                  <div className="grid grid-cols-[1fr_52px] items-center gap-3">
                    <div className="h-[16px] bg-[#e8e4dc]" style={{ width: `${w}%`, opacity: i === 0 ? 1 : 0.92 }} />
                    <span className="text-[13px] sm:text-[14px] text-[#e040fb] text-right tabular-nums whitespace-pre">{pct}</span>
                  </div>
                  {note && (
                    <div className="mt-1 text-[11px] tracking-[0.15em] uppercase text-[#605a52]">{note}</div>
                  )}
                </div>
              ))}
              <div className="mt-3 text-[12px] sm:text-[13px] text-[#8a837a]">week six · the flatline</div>
            </div>
            <ol className="mt-4">
              {FAILURES.map(([name, sev], i) => (
                <li key={name} className="grid grid-cols-[26px_1fr_auto] items-baseline gap-x-3 py-1.5 border-b border-dashed border-[#16140f] last:border-b-0 font-mono text-[13px]">
                  <span className="text-[#605a52]">0{i + 1}</span>
                  <span className="text-[14px] text-[#e040fb] whitespace-nowrap">{name}</span>
                  <span className="text-[10px] tracking-[0.12em] uppercase text-[#605a52] whitespace-nowrap">{sev}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-12">
            <div className={label}>the redesign · two moves</div>
            <Ascii label="move one · citations or silence">
{`before              after`}{'\n'}
{`┌───────────────┐   ┌───────────────┐`}{'\n'}
{`│ "the likely   │   │ `}<B>{`42ms · p95`}</B>{`    │`}{'\n'}
{`│  cause may    │ → │ `}<M>{`[source row]`}</M>{`  │`}{'\n'}
{`│  be..."       │   │ `}<B>{`accept · edit`}</B>{` │`}{'\n'}
{`└───────────────┘   └───────────────┘`}{'\n'}
{`  fluent guess        refusable fact`}
            </Ascii>
            <Ascii label="move two · into the ticket">
{`before              after`}{'\n'}
{`┌───────────────┐   ┌───────────────┐`}{'\n'}
{`│ ticket        │   │ ticket        │`}{'\n'}
{`│      ↕ detour │   │  `}<M>{`└ suggestion`}</M>{` │`}{'\n'}
{`│ [copilot tab] │   │   `}<B>{`accept·undo`}</B>{` │`}{'\n'}
{`└───────────────┘   └───────────────┘`}{'\n'}
{`   two places         one place`}
            </Ascii>
          </div>

          <div className="mt-7">
            <div className={label}>build path</div>
            <p className="mt-2 font-mono text-[13px] leading-[1.8] text-[#c8c2b7]">
              week 1 · instrument the drop-off, ship the citation layer.
              <br />week 2 · the inline surface, behind a flag.
              <br />week 3 · measure suggestion-acceptance, not sessions.
            </p>
          </div>

          <p className="mt-8 font-serif text-[17px] leading-[1.6] text-[#e8e4dc]">
            Adoption isn&rsquo;t the metric. Unforced return use in week four is.
          </p>
        </section>

        {/* retainer */}
        <p className="mt-14 font-serif text-[15px] leading-[1.7] text-[#8a837a]">
          After the teardown, some teams keep me. Advisory retainer:
          $6,000/month, 4-6 hrs/week, two seats, selective.
        </p>

        {/* about */}
        <p className="mt-14 pt-8 border-t border-[#1f1c17] font-serif text-[15px] leading-[1.7] text-[#8a837a]">
          Thirty years shipping enterprise software: GE Nuclear, Citi, Wells
          Fargo, the U.S. Mint, Dell, AT&amp;T. I write TypeScript and run
          production agents at home. The rest of me lives at{' '}
          <Link to="/" className="text-[#c8c2b7] underline decoration-dotted underline-offset-4 hover:text-[#e040fb]">
            conscious-shell.com
          </Link>
          .
        </p>

        {/* intake */}
        <section id="intake" className="mt-14">
          <div className={label}>start the intro call</div>
          <div className="mt-5">
            <StudioIntake />
          </div>
          <p className="mt-5 font-mono text-[12px] text-[#6b6660]">
            or write me directly:{' '}
            <a href="mailto:micah@conscious-shell.com" className="text-[#8a837a] hover:text-[#e040fb] min-h-[44px] inline-flex items-center">
              micah@conscious-shell.com
            </a>
          </p>
        </section>

        <div className="mt-16 pb-6 font-mono text-[10px] tracking-[0.2em] text-[#3a3530]">
          © 2026 micah boswell · one engagement at a time
        </div>
      </div>
    </main>
  );
}

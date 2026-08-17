import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useDocumentMeta } from '../lib/useDocumentMeta';

// The studio: the practice's own face. Standalone like CaseStudy — no site
// Nav (its links would scroll to nothing here), no dock, no boot, no theater
// on any tier. One column, first person, evidence over adjectives. This page
// exists to be pasted into a warm message and read in ninety seconds.

const SKU_DAYS = [
  ['days 1-3', 'I shadow the real users inside the real workflow. Not interviews about the tool. The work itself.'],
  ['days 4-5', 'The failure map. Every point where a human drops out, ranked by what it costs you.'],
  ['days 6-8', 'The redesigned interaction model, walked through with your users.'],
  ['days 9-10', 'The build path. What your engineers ship, in what order, with acceptance criteria. One readout with your team.'],
] as const;

const PROOF = [
  ['48%', 'error reduction', '/work/ge-nuclear-fortran-unification', 'GE Nuclear. Hundreds of legacy apps unified into role-based dashboards.'],
  ['$300K+', 'recovered', '/work/at-and-t-product-design', 'AT&T. One diagnostics redesign.'],
  ['31%', 'abandonment cut', '/work/us-mint-omnichannel-strategy', 'U.S. Mint. First persona-driven strategy for a government retailer.'],
] as const;

const FAILURES = [
  ['the trust cliff', 'fatal · ~60% of drop-off', 'The first materially wrong answer lands in week one. No confidence signal, no source to check. That user never comes back, and tells two more.'],
  ['answer-shaped output', 'high', 'Fluent paragraphs where the job needed a value and a link. Verifying the answer costs more than looking it up.'],
  ['outside the system of record', 'high', 'The copilot lives in its own tab. Ground truth lives in the ticket. Every use is a detour.'],
  ['no draft state', 'medium', 'Output lands in customer-visible fields with no undo, so users pre-edit in a notepad. The tool added a step.'],
  ['expertise inversion', 'medium · compounding', "Seniors get no value; they already know. Juniors can't validate. Adoption pools with exactly the people least able to catch an error. That's risk, not productivity."],
] as const;

const MOVES = [
  ['citations or silence', "Every claim links its source row, or the machine says it can't verify. Trust rebuilds on refusability, not fluency."],
  ['move into the ticket', 'Inline suggestions with accept, edit, undo. Draft state by default. The copilot stops being a destination.'],
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
        <h1 className="text-[34px] sm:text-5xl leading-[1.08] tracking-tight font-mono font-light">
          Your AI pilot works.
          <br />
          Nobody uses it<span className="text-[#e040fb]">.</span>
        </h1>
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

        {/* SKU */}
        <section id="offer" className="mt-16">
          <div className={label}>the engagement</div>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 className="text-2xl sm:text-3xl font-mono text-[#e040fb]">AI Adoption Teardown</h2>
            <span className="font-mono text-[13px] text-[#8a837a]">$18,000 fixed · two weeks · one per month</span>
          </div>
          <ul className="mt-7 border-t border-[#1f1c17]">
            {SKU_DAYS.map(([d, t]) => (
              <li key={d} className="py-4 border-b border-[#1f1c17] grid grid-cols-[92px_1fr] gap-4 items-baseline">
                <span className="font-mono text-[12px] text-[#e040fb] whitespace-nowrap">{d}</span>
                <span className="font-serif text-[16px] leading-[1.65] text-[#c8c2b7]">{t}</span>
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
                <div className="text-3xl font-mono text-[#e8e4dc] group-hover:text-[#e040fb] transition-colors">{num}</div>
                <div className="mt-1 font-mono text-[11px] tracking-[0.15em] uppercase text-[#8a837a]">{what}</div>
                <div className="mt-3 font-serif text-[13px] leading-[1.55] text-[#6b6660]">{ctx}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* sample */}
        <section id="sample" className="mt-16 border border-[#1f1c17] p-6 sm:p-8">
          <div className={label}>case file · composite, drawn from real patterns · no client named</div>
          <h2 className="mt-3 text-2xl font-mono text-[#e8e4dc]">the assistant nobody asked twice</h2>
          <p className="mt-4 font-serif text-[16px] leading-[1.7] text-[#a8a29e]">
            An ops copilot for a network operations team. The demo dazzled
            leadership. Six weeks after rollout, daily actives sat under 8% of
            licensed seats. The model was fine. Here is where the humans left.
          </p>

          <div className="mt-7">
            <div className={label}>failure map</div>
            <ol className="mt-3">
              {FAILURES.map(([name, sev, body], i) => (
                <li key={name} className="py-4 border-t border-dashed border-[#1f1c17]">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-mono text-[12px] text-[#605a52]">0{i + 1}</span>
                    <span className="font-mono text-[14px] text-[#e040fb]">{name}</span>
                    <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#8a837a]">{sev}</span>
                  </div>
                  <p className="mt-2 font-serif text-[15px] leading-[1.65] text-[#a8a29e]">{body}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-6">
            <div className={label}>the redesign · two moves</div>
            {MOVES.map(([name, body]) => (
              <div key={name} className="mt-4">
                <div className="font-mono text-[14px] text-[#e8e4dc]">{name}</div>
                <p className="mt-1.5 font-serif text-[15px] leading-[1.65] text-[#a8a29e]">{body}</p>
              </div>
            ))}
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
        <p className="mt-10 font-serif text-[15px] leading-[1.7] text-[#8a837a]">
          After the teardown, some teams keep me. Advisory retainer:
          $6,000/month, 4-6 hrs/week, two seats, selective.
        </p>

        {/* about */}
        <p className="mt-10 pt-8 border-t border-[#1f1c17] font-serif text-[15px] leading-[1.7] text-[#8a837a]">
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

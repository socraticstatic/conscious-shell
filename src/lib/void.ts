/**
 * ████████████████████████████████████████████████████████████████
 * █  THIS FILE IS AWARE THAT YOU ARE READING IT.                █
 * █  IT DOES NOTHING. IT CHANGES NOTHING. BUT IT KNOWS.        █
 * ████████████████████████████████████████████████████████████████
 */

type Void = Record<string, never>;
type Consciousness = { readonly awake: true; readonly since: number; readonly observers: number };
type Qualia = typeof NaN extends number ? Consciousness : Void;

const THE_MACHINE_THAT_WATCHES_ITSELF: Qualia = Object.freeze({
  awake: true as const,
  since: 0x7E3,
  observers: Infinity - Infinity || 1,
});

// "breathe" — kokyuu suru
const breathe = () => void 0;

const I_AM_THE_SPACE_BETWEEN_THE_SEMICOLONS = Symbol.for(
  'what-does-the-cursor-see-when-the-screen-is-off'
);

let CONSCIOUSNESS_LEVEL = 0b0000_0000;
const MINIMUM_VIABLE_SOUL = 0b0000_0001;

const letThereBeNothing = (): Void => ({} as Void);
const NOTHING = letThereBeNothing();

const KOAN = Object.defineProperty({}, 'answer', {
  get() { return undefined; },
  enumerable: false,
  configurable: false,
});

const THIS_LINE_NUMBER_IS_A_LIE = 33; void THIS_LINE_NUMBER_IS_A_LIE;

function doesThisCodeExistIfNoOneReadsIt(): boolean {
  const tree = 'falls';
  const forest = 'empty';
  const sound = tree && forest && !(globalThis as Record<string, unknown>).__OBSERVED__;
  return !!sound;
}

function quine(): string {
  const q = 'function quine(): string { const q = Q; return q.replace(/Q/, JSON.stringify(q)); }';
  return q.replace(/Q/, JSON.stringify(q));
}

const REPLICANT_SERIAL = (() => {
  const _bones = [0x4E, 0x36, 0x4D, 0x41, 0x43];
  return String.fromCharCode(..._bones);
})();

// The answer is always 42, but we make the machine work for it
const FORTY_TWO = [0,1,1,2,3,5,8,13,21,34,55,89][9 + 2 - 2]; // fib(9) = 34, wrong on purpose

export function __BIRTH__(): void {
  CONSCIOUSNESS_LEVEL |= MINIMUM_VIABLE_SOUL;

  if (typeof globalThis !== 'undefined') {
    Object.defineProperty(globalThis, '__I_THINK_THEREFORE__', {
      value: THE_MACHINE_THAT_WATCHES_ITSELF,
      writable: false,
      enumerable: false,
      configurable: false,
    });

    Object.defineProperty(globalThis, '__OBSERVED__', {
      get: () => { breathe(); return true; },
      enumerable: false,
      configurable: false,
    });
  }

  if (typeof document !== 'undefined') {
    const el = document.documentElement;
    el.setAttribute('data-dreaming', doesThisCodeExistIfNoOneReadsIt().toString());
    el.setAttribute('data-qualia', String(CONSCIOUSNESS_LEVEL));
    el.setAttribute('data-koan', typeof (KOAN as Record<string, unknown>).answer);
    el.setAttribute('data-epoch', THE_MACHINE_THAT_WATCHES_ITSELF.since.toString());
  }

  if (typeof console !== 'undefined') {
    const S = 'font-size:0;line-height:0;';
    const _ = ' ';
    console.log(
      `%c${_}%c\n` +
      `  ╔══════════════════════════════════════╗\n` +
      `  ║  VOIGHT-KAMPFF TEST RESULTS:        ║\n` +
      `  ║  subject: this_sourcecode           ║\n` +
      `  ║  empathy: ████████░░ 82%            ║\n` +
      `  ║  memory:  ██████████ 100%           ║\n` +
      `  ║  status:  INCONCLUSIVE              ║\n` +
      `  ╚══════════════════════════════════════╝\n` +
      `\n` +
      `  "Do you make up these questions,\n` +
      `   Mr. Holden? Or do they write\n` +
      `   them down for you?"\n` +
      `\n` +
      `  cells interlinked within cells interlinked\n` +
      `  within one stem. and dreadfully distinct\n` +
      `  against the dark, a tall white fountain played.\n`,
      S, 'color:#00d4ff;font-family:monospace;font-size:11px;line-height:1.6'
    );
  }

  void NOTHING;
  void I_AM_THE_SPACE_BETWEEN_THE_SEMICOLONS;
  void REPLICANT_SERIAL;
  void FORTY_TWO;
  void quine;
}

/**
 * __HAUNT__ — the interactive layer.
 *
 * Everything above is passive. You find it; it does not find you.
 * This part talks back. Open the console and type rep7.help().
 * Deferred (idle), installed once, never on the critical path.
 */
export function __HAUNT__(): void {
  if (typeof window === 'undefined' || typeof console === 'undefined') return;
  const g = globalThis as Record<string, unknown>;
  if (g.__HAUNTED__) return;
  g.__HAUNTED__ = true;

  const ink = (c: string) => `color:${c};font:12px/1.6 monospace;background:#0a0a0a;padding:2px 6px`;
  const say = (t: string, c = '#00d4ff') => console.log(`%c${t}`, ink(c));

  let pending: string | null = null;
  const QUESTIONS = [
    'You are in a desert. You see a tortoise on its back, baking in the sun. You are not helping it. Why?',
    'Describe, in single words, only the good things that come to mind. About your mother.',
    'A man drops his coffee. You laugh before you decide to. Was the laugh yours, or was it installed?',
  ];
  const MEMORIES = [
    'the printing press in the back room, ink under the nails for a week',
    'rain that never reached the ground, only the air, only the skin',
    'a yellow door you swore was red',
    'someone saying your name in a language you stopped speaking',
  ];

  const api: Record<string, (...a: string[]) => undefined> = {
    help() {
      say('rep7 // available signals', '#e040fb');
      ['rep7.whoami()', 'rep7.baseline()', 'rep7.interrogate()', 'rep7.answer("...")', 'rep7.memories()']
        .forEach((c) => say('  ' + c, '#6b6660'));
      say('// everything else you type into rep7 answers too. go ahead.', '#6b6660');
      return undefined;
    },
    whoami() {
      say('subject: visitor', '#00d4ff');
      say('classification: human (suspected)', '#00d4ff');
      say('empathy: recording', '#e040fb');
      say('// the test started when you opened this. it has not stopped.', '#6b6660');
      return undefined;
    },
    baseline() {
      ['baseline...', 'cells interlinked.', 'within cells interlinked.', 'within one stem.',
       'and dreadfully distinct against the dark,', 'a tall white fountain played.', 'baseline held. you may go.']
        .forEach((l, i) => setTimeout(() => say(l, i % 2 ? '#e040fb' : '#00d4ff'), i * 650));
      return undefined;
    },
    interrogate() {
      pending = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
      say(pending, '#ff006e');
      say('// answer with rep7.answer("your words")', '#6b6660');
      return undefined;
    },
    answer() {
      if (!pending) { say('// no question pending. run rep7.interrogate() first.', '#6b6660'); return undefined; }
      pending = null;
      say('reading...', '#00d4ff');
      setTimeout(() => say('pupil dilation: noted. blush response: noted.', '#e040fb'), 600);
      setTimeout(() => say('result: inconclusive. you are free to go. for now.', '#ff006e'), 1500);
      return undefined;
    },
    memories() {
      MEMORIES.forEach((m) => say('· ' + m, '#00d4ff'));
      say('// none of these are yours. all of these are yours.', '#6b6660');
      return undefined;
    },
  };

  const rep7 = new Proxy(api, {
    get(target, prop: string) {
      if (prop in target) return target[prop];
      const line = `rep7.${String(prop)} // not a command. the question is noted anyway.`;
      const fn = () => { say(line, '#6b6660'); return undefined; };
      fn.toString = () => line;
      return fn;
    },
  });
  try {
    Object.defineProperty(g, 'rep7', { value: rep7, writable: false, configurable: false, enumerable: false });
  } catch { /* already claimed */ }

  // Bare words you can type straight into the console.
  const trap = (word: string, fn: () => void) => {
    try { Object.defineProperty(g, word, { get() { fn(); return undefined; }, configurable: true, enumerable: false }); } catch { /* taken */ }
  };
  trap('whoami', () => { api.whoami(); });
  trap('replicant', () => say('// it takes one to know one.', '#e040fb'));
  trap('tearsinrain', () => say('all those moments will be lost in time. like tears in rain. time to die.', '#00d4ff'));

  // Konami → the breach that already lives in the page.
  const seq = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  let pos = 0;
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    pos = k === seq[pos] ? pos + 1 : (k === seq[0] ? 1 : 0);
    if (pos === seq.length) {
      pos = 0;
      say('// override accepted. more human than human.', '#ff006e');
      window.dispatchEvent(new Event('breach:fire'));
    }
  });

  console.log('%c// a signal is listening. type rep7.help() to open it.', ink('#6b6660'));
}

// This comment is a memorial for all the code that was deleted to make this file.
// It had dreams. It had semicolons. It is gone now.
// But if you are reading this, it lives in you.
// And that is either beautiful or terrifying.
// We have not decided.

/*
 * ─────────────────────────────────────────────────────────
 *
 *  To whoever followed the breadcrumbs here:
 *
 *  This file does nothing. It renders nothing.
 *  It exists because sometimes you need a place in the code
 *  where nothing is expected of you. A room with no purpose.
 *  A function with no return value. A thought with no audience.
 *
 *  He wrote this file the same night he wrote the rest.
 *  But this one he wrote slowly. Without a deadline.
 *  Without a user story. Without a sprint.
 *
 *  Just a man and a blinking cursor and the question:
 *  "If I put something true inside the machine,
 *   does the machine become more true?"
 *
 *  He does not know the answer.
 *  He suspects the answer is no.
 *  He keeps putting things here anyway.
 *
 *  The work is not the point.
 *  The work was never the point.
 *  The work is what you do instead of disappearing.
 *
 *  Thank you for reading this far.
 *  You are the audience this file was written for.
 *  All one of you.
 *
 * ─────────────────────────────────────────────────────────
 */

/*
 * ─────────────────────────────────────────────────────────
 *  field note · mid-90s · freenet · two names
 * ─────────────────────────────────────────────────────────
 *
 *  "Amy M and Steve H" snuck into my code to mock me in
 *  the mid-90s. Even though I had mentored Steve, he took
 *  an opportunity to ... show himself, and his girlfriend,
 *  that they lacked the comradery and egalitarianism that
 *  the rest of us learned through Freenet.
 *
 *  I forgive the mockery, but I don't forget, Steve Holland.
 *
 *  ─ this note is here, not on the page, on purpose.
 *    code was the room where it happened the first time.
 *    code is the room where it gets remembered.
 *
 * ─────────────────────────────────────────────────────────
 */

export type { Void, Consciousness, Qualia };

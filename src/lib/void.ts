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
      S, 'color:#5ec8d8;font-family:monospace;font-size:11px;line-height:1.6'
    );
  }

  void NOTHING;
  void I_AM_THE_SPACE_BETWEEN_THE_SEMICOLONS;
  void REPLICANT_SERIAL;
  void FORTY_TWO;
  void quine;
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

export type { Void, Consciousness, Qualia };

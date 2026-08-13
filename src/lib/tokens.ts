/**
 * The single source of truth for colour in this site.
 *
 * Tokens are stored as space-separated RGB channels because that is the only
 * form under which Tailwind's <alpha-value> placeholder works, and 103 call
 * sites depend on opacity modifiers like `border-accent/60` continuing to
 * resolve. See docs/superpowers/specs/2026-07-26-token-layer-design.md.
 *
 * Names describe the job, never the hue. `signal` is #00d4ff here and will be
 * turquoise in another world, and no component is allowed to care.
 *
 * GREY RAMP DECISION (task 3, step 1): COLLAPSE to three. #7a6e62 (19 uses)
 * folds into #6b6660. Relative luminance: #a8a29e 64%, #7a6e62 44%, #6b6660
 * 40%, #4a453e 27%. The 44/40 pair sit 4% apart and do the same job (small
 * uppercase tracked labels), and #6b6660 has 132 uses to #7a6e62's 19.
 * #7a6e62 happens to be the value :root currently calls --muted, which the
 * components ignored.
 *
 * CONTRAST CORRECTION (2026-08-13): fg-ghost moved #4a453e -> #605a52, 72
 * sites. Against the #07070a page it measured 2.12:1, the worst band on the
 * site by a wide margin and carrying real structure - project index numbers,
 * the `//` separators. #605a52 is 2.95:1.
 *
 * It does NOT reach the 4.5:1 AA floor, and cannot on its own: fg-ghost has to
 * stay a visible step below fg-dim, and fg-dim is itself only 3.54:1. Clearing
 * AA means lifting the whole tail of the ramp - fg-ghost to ~4.6:1 and fg-dim
 * above that - across 132+ further sites. That call has not been made yet.
 *
 * PAGE BACKGROUND DECISION (task 3, step 1): UNIFY on #07070a. It has 13
 * uses including the App wrapper. #08060a has 2 and is vestigial: the --bg
 * declaration itself plus AgentBattle.tsx:197. The Task 4 gate will report
 * an expected diff on html/body background-color when --bg is recaptured.
 *
 * MECHANICAL CORRECTION (not part of the step 1 human gate): the plan's
 * illustrative Step 4 code paired `accent-hot` with #ff2d78, which appears
 * exactly once in the whole codebase, as the :root declaration itself
 * (src/index.css:24). The colour actually used for the hot-pink accent
 * throughout components is #ff006e (87 uses, declared separately in
 * src/index.css as --pink). TOKENS['accent-hot'] is set to #ff006e so the
 * round-trip and "five highest-traffic hexes" tests in tests/tokens.test.ts
 * (which name #ff006e explicitly) pass, and so Step 6's completeness check
 * over docs/tokens/audit.json is satisfied. #ff2d78 is kept as a collapse
 * into accent-hot rather than dropped, since it is still a live :root value
 * today.
 */

export type TokenName =
  | 'bg' | 'surface' | 'raised'
  | 'rule' | 'rule-strong'
  | 'fg' | 'fg-warm' | 'fg-muted' | 'fg-dim' | 'fg-ghost'
  | 'accent' | 'accent-hot' | 'signal' | 'signal-hot'
  | 'alert' | 'ember';

export const TOKENS: Record<TokenName, string> = {
  bg: '7 7 10',            // #07070a
  surface: '11 10 8',      // #0b0a08
  raised: '26 23 18',      // #1a1712
  rule: '31 28 23',        // #1f1c17
  'rule-strong': '42 38 32', // #2a2620
  fg: '232 228 220',       // #e8e4dc
  'fg-warm': '201 184 166', // #c9b8a6
  'fg-muted': '168 162 158', // #a8a29e
  'fg-dim': '107 102 96',  // #6b6660, absorbs #7a6e62 per the step 1 ruling
  'fg-ghost': '96 90 82',  // #605a52
  accent: '224 64 251',    // #e040fb
  'accent-hot': '255 0 110', // #ff006e, absorbs #ff2d78 (see header note)
  signal: '0 212 255',     // #00d4ff
  'signal-hot': '79 195 247', // #4fc3f7
  alert: '255 59 59',      // #ff3b3b
  ember: '124 58 237',     // #7c3aed
};

export const HEX_TO_ROLE: Record<string, TokenName> = {
  '#07070a': 'bg',
  '#0b0a08': 'surface',
  '#1a1712': 'raised',
  '#1f1c17': 'rule',
  '#2a2620': 'rule-strong',
  '#e8e4dc': 'fg',
  '#c9b8a6': 'fg-warm',
  '#a8a29e': 'fg-muted',
  '#6b6660': 'fg-dim',
  '#605a52': 'fg-ghost',
  '#e040fb': 'accent',
  '#ff006e': 'accent-hot',
  '#00d4ff': 'signal',
  '#4fc3f7': 'signal-hot',
  '#ff3b3b': 'alert',
  '#7c3aed': 'ember',
};

/**
 * Deliberate collapses, ruled on by Micah in task 3 step 1 (the first two
 * entries) or resolved mechanically against the audit and the test file
 * (the third; see the header note above).
 *
 * These hexes do NOT round-trip: each is being retired into a token whose
 * value differs slightly, so the sites using them change colour by a visible-
 * on-paper, invisible-in-practice amount. Kept separate from HEX_TO_ROLE so
 * the round-trip test stays a real assertion instead of being weakened to
 * accommodate them.
 *
 * Each entry costs exactly one intentional wave of gate diffs, at the phase
 * where the sites using it are rewritten. Expected diff counts are noted.
 */
export const COLLAPSED_HEX: Record<string, { role: TokenName; sites: number; why: string }> = {
  '#7a6e62': {
    role: 'fg-dim',
    sites: 19,
    why: 'Same job as #6b6660 (small uppercase tracked labels) at 44% vs 40% luminance. #6b6660 has 132 uses to its 19. Was the value :root called --muted, which the components ignored.',
  },
  '#08060a': {
    role: 'bg',
    sites: 2,
    why: 'Vestigial page background. #07070a is the de facto value with 13 uses including the App wrapper. This one survived only in the --bg declaration itself and AgentBattle.tsx:197.',
  },
  '#ff2d78': {
    role: 'accent-hot',
    sites: 1,
    why: 'Vestigial accent-hot value. #ff006e is the de facto hot-pink accent with 87 uses across components. This one survives only as the --accent-hot declaration itself in src/index.css:24.',
  },
};

/** What the codemod actually consults. Exact matches plus ruled collapses. */
export const CODEMOD_MAP: Record<string, TokenName> = {
  ...HEX_TO_ROLE,
  ...Object.fromEntries(
    Object.entries(COLLAPSED_HEX).map(([hex, { role }]) => [hex, role]),
  ),
};

export const RGBA_TO_ROLE: Record<string, TokenName> = Object.fromEntries(
  Object.entries(HEX_TO_ROLE).map(([hex, role]) => [
    [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ].join(','),
    role,
  ]),
) as Record<string, TokenName>;

export function channelsToHex(channels: string): string {
  const parts = channels.trim().split(/\s+/).map(Number);
  return '#' + parts.map((n) => n.toString(16).padStart(2, '0')).join('');
}

const cache = new Map<TokenName, string>();
let cachedWorld: string | null = null;

/**
 * Resolves a token to hex for consumers that cannot use CSS.
 *
 * Two of those exist and both are real: THREE.Color rejects the
 * `rgb(r g b / a)` form entirely, and devtools console CSS (see src/lib/void.ts)
 * is evaluated outside the document and cannot resolve var() at all.
 */
export function readToken(name: TokenName): string {
  const world = document.documentElement.dataset.world ?? 'default';
  if (world !== cachedWorld) {
    cache.clear();
    cachedWorld = world;
  }
  const hit = cache.get(name);
  if (hit) return hit;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(`--${name}`)
    .trim();
  const hex = raw ? channelsToHex(raw) : channelsToHex(TOKENS[name]);
  cache.set(name, hex);
  return hex;
}

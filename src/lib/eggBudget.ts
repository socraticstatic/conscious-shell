// eggBudget.ts — a session-wide governor for unprompted ("auto-fire") eggs.
//
// The shell has many eggs that pop on their own: breach alarms, memory
// fabrications, exit-intent whispers, scroll ruptures. Each is fine alone; in
// aggregate they crowd the screen. This governor enforces three limits so a
// visitor sees at most a handful, well spaced, never two at once:
//
//   1. one unprompted popup at a time — the cooldown dwarfs any popup's display
//   2. a long cooldown between any two — COOLDOWN_MS
//   3. a hard cap per browser session — MAX_PER_SESSION (sessionStorage-backed)
//
// Discoverable triggers — typed words, palette commands, deliberate events —
// do NOT call this. Those are earned: the visitor asked. Only self-firing code
// claims a slot.

export const COOLDOWN_MS = 300_000; // 5 min minimum between auto-fired popups
export const MAX_PER_SESSION = 0; // no auto-fired popups; only discoverable triggers fire

const COUNT_KEY = 'cs:egg-auto-count';

// module-scoped: resets on a full reload, which is fine — a reload is a fresh
// stretch of attention. The per-session cap is the durable backstop.
let lastAutoFireAt = 0;

function readCount(): number {
  try {
    return parseInt(sessionStorage.getItem(COUNT_KEY) || '0', 10) || 0;
  } catch {
    return 0;
  }
}

function bumpCount(n: number) {
  try {
    sessionStorage.setItem(COUNT_KEY, String(n));
  } catch {
    /* storage blocked — governor still works off module state */
  }
}

// Pure decision, so the policy is testable in isolation: given the clock, the
// last-fire time, the session count, and whether a full-screen egg owns the
// screen, may an unprompted popup fire right now?
export function mayAutoFire(
  now: number,
  last: number,
  count: number,
  eggActive: boolean,
): boolean {
  if (eggActive) return false; // a takeover owns the screen
  if (count >= MAX_PER_SESSION) return false; // session budget spent
  if (now - last < COOLDOWN_MS) return false; // still cooling down
  return true;
}

// claimEggSlot — call right before showing an unprompted popup. Returns true
// (and records the claim) when the budget allows; returns false otherwise, in
// which case the caller shows nothing. Recurring eggs simply try again on
// their next cycle. A rejected claim has no side effects, so a popup whose own
// gate later fails never wastes budget.
export function claimEggSlot(): boolean {
  const eggActive =
    typeof document !== 'undefined' && document.body.classList.contains('egg-active');
  const now = Date.now();
  const count = readCount();
  if (!mayAutoFire(now, lastAutoFireAt, count, eggActive)) return false;
  lastAutoFireAt = now;
  bumpCount(count + 1);
  return true;
}

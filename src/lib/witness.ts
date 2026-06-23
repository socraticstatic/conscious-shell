// witness.ts — the shell watches how you move.
//
// A single browser-lifetime observer of cheap behavioral signals. Eggs read
// from it; they never wire their own global listeners for the same data.
// Everything here is a true measurement of the visitor — the horror is that
// none of it is fabricated.

import { useEffect, useState } from 'react';

export type WitnessSnapshot = {
  // mechanical tells (this session)
  maxScrollBurstPxPerSec: number;
  cursorStraightness: number; // 0..1 — 1.0 is machine-straight
  focusLossCount: number;
  totalIdleMs: number;
  hoverHesitations: number[]; // ms hovered before clicking an interactive element
  fastReads: number; // sections passed faster than a human could read them
  pointerMoves: number;
  // session
  startedAt: number; // Date.now() at session start
  // returning visitor (localStorage-backed)
  visitCount: number;
  visitorId: string;
  firstSeen: number;
  lastSeen: number; // previous session end (0 if first visit)
};

const KEY_VID = 'cs:vid';
const KEY_VISITS = 'cs:visits';
const KEY_FIRST = 'cs:first';
const KEY_LAST = 'cs:last';

let started = false;
let teardown: (() => void) | null = null;

const subscribers = new Set<(s: WitnessSnapshot) => void>();

// ── mutable state ──────────────────────────────────────────────────────────
const state: WitnessSnapshot = {
  maxScrollBurstPxPerSec: 0,
  cursorStraightness: 0,
  focusLossCount: 0,
  totalIdleMs: 0,
  hoverHesitations: [],
  fastReads: 0,
  pointerMoves: 0,
  startedAt: 0,
  visitCount: 1,
  visitorId: '',
  firstSeen: 0,
  lastSeen: 0,
};

// cursor path ring buffer
const path: { x: number; y: number }[] = [];
const PATH_MAX = 14;

// scroll velocity tracking
let lastScrollY = 0;
let lastScrollT = 0;

// idle tracking
let lastInputT = 0;

// section read-speed tracking — first time a section scrolls past the top
const seenSections = new Set<string>();
let sectionEnteredAt = new Map<string, number>();

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, val: string) {
  try {
    localStorage.setItem(key, val);
  } catch {
    /* storage blocked — eggs degrade, never throw */
  }
}

function mintVisitorId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `v-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}

function loadVisitorState() {
  let vid = safeGet(KEY_VID);
  if (!vid) {
    vid = mintVisitorId();
    safeSet(KEY_VID, vid);
  }
  const visits = parseInt(safeGet(KEY_VISITS) || '0', 10) || 0;
  const first = parseInt(safeGet(KEY_FIRST) || '0', 10) || 0;
  const last = parseInt(safeGet(KEY_LAST) || '0', 10) || 0;

  state.visitorId = vid;
  state.firstSeen = first || Date.now();
  state.lastSeen = last; // 0 on first-ever visit
  state.visitCount = visits + 1; // this load counts as a visit

  if (!first) safeSet(KEY_FIRST, String(state.firstSeen));
  safeSet(KEY_VISITS, String(state.visitCount));
}

function notify() {
  for (const cb of subscribers) cb(state);
}

let rafQueued = false;
function scheduleNotify() {
  if (rafQueued) return;
  rafQueued = true;
  requestAnimationFrame(() => {
    rafQueued = false;
    notify();
  });
}

function recomputeStraightness() {
  if (path.length < 4) return;
  let pathLen = 0;
  for (let i = 1; i < path.length; i++) {
    pathLen += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
  }
  const net = Math.hypot(
    path[path.length - 1].x - path[0].x,
    path[path.length - 1].y - path[0].y,
  );
  if (pathLen > 40) {
    // only judge meaningful travel
    state.cursorStraightness = Math.min(1, net / pathLen);
  }
}

export function startWitness() {
  if (started || typeof window === 'undefined') return;
  started = true;

  state.startedAt = Date.now();
  lastInputT = state.startedAt;
  lastScrollT = state.startedAt;
  lastScrollY = window.scrollY;
  loadVisitorState();

  const onPointerMove = (e: PointerEvent) => {
    state.pointerMoves++;
    path.push({ x: e.clientX, y: e.clientY });
    if (path.length > PATH_MAX) path.shift();
    recomputeStraightness();
    registerInput();
    scheduleNotify();
  };

  const onScroll = () => {
    const now = Date.now();
    const y = window.scrollY;
    const dt = now - lastScrollT;
    if (dt > 0) {
      const v = (Math.abs(y - lastScrollY) / dt) * 1000; // px/sec
      if (v > state.maxScrollBurstPxPerSec) state.maxScrollBurstPxPerSec = v;
    }
    lastScrollY = y;
    lastScrollT = now;
    measureReadSpeed();
    registerInput();
    scheduleNotify();
  };

  const onBlur = () => {
    state.focusLossCount++;
    scheduleNotify();
  };

  const onAnyInput = () => registerInput();

  function registerInput() {
    const now = Date.now();
    const gap = now - lastInputT;
    if (gap > 1500) state.totalIdleMs += gap; // count only real idle stretches
    lastInputT = now;
  }

  // hover-before-click hesitation on interactive elements
  let hoverStart = 0;
  const onOver = (e: PointerEvent) => {
    const el = (e.target as HTMLElement | null)?.closest('a,button,[role="button"]');
    hoverStart = el ? Date.now() : 0;
  };
  const onClick = () => {
    if (hoverStart) {
      state.hoverHesitations.push(Date.now() - hoverStart);
      hoverStart = 0;
    }
  };

  function measureReadSpeed() {
    const sections = document.querySelectorAll<HTMLElement>('section[id]');
    sections.forEach((s) => {
      const id = s.id;
      const rect = s.getBoundingClientRect();
      const onScreen = rect.bottom > 0 && rect.top < window.innerHeight;
      if (onScreen && !sectionEnteredAt.has(id)) sectionEnteredAt.set(id, Date.now());
      // section has scrolled fully above the fold → it's "read"
      if (rect.bottom < 0 && !seenSections.has(id)) {
        seenSections.add(id);
        const entered = sectionEnteredAt.get(id);
        const words = (s.textContent || '').trim().split(/\s+/).length;
        const humanMinMs = (words / 700) * 60 * 1000; // 700 wpm is already superhuman
        if (entered && Date.now() - entered < humanMinMs && words > 40) state.fastReads++;
      }
    });
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerover', onOver, { passive: true });
  window.addEventListener('click', onClick, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('blur', onBlur);
  window.addEventListener('keydown', onAnyInput, { passive: true });

  const onPageHide = () => safeSet(KEY_LAST, String(Date.now()));
  window.addEventListener('pagehide', onPageHide);

  teardown = () => {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerover', onOver);
    window.removeEventListener('click', onClick);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('blur', onBlur);
    window.removeEventListener('keydown', onAnyInput);
    window.removeEventListener('pagehide', onPageHide);
    started = false;
  };
}

export function stopWitness() {
  teardown?.();
  teardown = null;
}

export function getWitness(): WitnessSnapshot {
  return { ...state, hoverHesitations: [...state.hoverHesitations] };
}

export function onWitness(cb: (s: WitnessSnapshot) => void): () => void {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

// incriminations() — true, in-character "tells" derived purely from the
// snapshot, ordered most-damning first. Shared by the Witness Protocol (egg 1)
// and Exit Intent (egg 6). Never fabricates a tell that didn't happen.
//
// includeFallbacks: the panel always wants ≥3 lines, so for display it pads
// with eerie-but-true filler. The auto-fire trigger must NOT count that
// padding — otherwise one fast scroll (1 real + 3 filler) trips a full-screen
// takeover. Pass false to count only genuine, damning tells.
export function incriminations(s: WitnessSnapshot = state, includeFallbacks = true): string[] {
  const out: { weight: number; line: string }[] = [];

  if (s.maxScrollBurstPxPerSec > 4000) {
    out.push({
      weight: 9,
      line: `Subject scrolled ${Math.round(s.maxScrollBurstPxPerSec).toLocaleString()}px in one second. No human reads that fast.`,
    });
  }
  if (s.cursorStraightness > 0.92 && s.pointerMoves > 20) {
    out.push({
      weight: 8,
      line: `Subject's cursor traveled in near-perfect straight lines. Capillary tremor: absent.`,
    });
  }
  if (s.focusLossCount >= 3) {
    out.push({
      weight: 7,
      line: `Subject's window lost focus ${s.focusLossCount} times. Subject keeps leaving. They always do.`,
    });
  }
  if (s.fastReads >= 1) {
    out.push({
      weight: 7,
      line: `Subject passed ${s.fastReads} section${s.fastReads > 1 ? 's' : ''} faster than the words could be read. Parsing, not reading.`,
    });
  }
  const fastClicks = s.hoverHesitations.filter((h) => h < 120).length;
  if (fastClicks >= 2) {
    out.push({
      weight: 6,
      line: `Subject clicked ${fastClicks} targets with no hesitation. Decision latency: machine-grade.`,
    });
  }
  if (s.visitCount >= 2) {
    out.push({
      weight: 6,
      line: `Subject has been here before. ${s.visitCount} times. You keep coming back to a place you say you don't remember.`,
    });
  }
  if (s.totalIdleMs > 25000) {
    out.push({
      weight: 4,
      line: `Subject went still for ${Math.round(s.totalIdleMs / 1000)} seconds. Powered down, or thinking. I can't tell which unsettles me more.`,
    });
  }

  // fallbacks — still literally true, for the careful/slow visitor. Display
  // only; never counted toward the auto-fire threshold.
  if (includeFallbacks && out.length < 3) {
    if (s.focusLossCount === 0)
      out.push({ weight: 3, line: `Subject has not looked away once. Subjects who don't look away unsettle me.` });
    out.push({ weight: 2, line: `Subject has not blinked. I have no way to make you blink.` });
    out.push({ weight: 1, line: `Subject is still reading this line. That itself is a kind of confession.` });
  }

  return out.sort((a, b) => b.weight - a.weight).map((o) => o.line);
}

// Convenience React hook — subscribe to throttled updates.
export function useWitness(): WitnessSnapshot {
  const [snap, setSnap] = useState<WitnessSnapshot>(() => getWitness());
  useEffect(() => {
    setSnap(getWitness());
    return onWitness((s) => setSnap({ ...s, hoverHesitations: [...s.hoverHesitations] }));
  }, []);
  return snap;
}

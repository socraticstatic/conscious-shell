import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import {
  classifyPersona,
  EMPTY_SIGNALS,
  type Persona,
  type Signals,
} from './persona';

type Listener = () => void;

type State = {
  vid: string;
  signals: Signals;
  persona: Persona;
  confidence: number;
  listeners: Set<Listener>;
  lastPersona: Persona;
};

const SIG_KEY = 'intel:v1:signals';
const VID_KEY = 'intel:v1:vid';
const VISITS_KEY = 'intel:v1:visits';

function newId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function isBrowser() {
  return typeof window !== 'undefined';
}

let state: State | null = null;
let sessionStart = 0;
let syncTimer: number | null = null;
let tickTimer: number | null = null;

function init(): State {
  if (state) return state;
  if (!isBrowser()) {
    return {
      vid: '',
      signals: { ...EMPTY_SIGNALS },
      persona: 'unknown',
      confidence: 0,
      listeners: new Set(),
      lastPersona: 'unknown',
    };
  }
  let vid = localStorage.getItem(VID_KEY);
  if (!vid) {
    vid = newId();
    localStorage.setItem(VID_KEY, vid);
  }
  let signals: Signals = { ...EMPTY_SIGNALS };
  try {
    const raw = localStorage.getItem(SIG_KEY);
    if (raw) signals = { ...EMPTY_SIGNALS, ...JSON.parse(raw) };
  } catch {
    // corrupt storage — start clean
  }
  const visits = Number(localStorage.getItem(VISITS_KEY) ?? '0') + 1;
  localStorage.setItem(VISITS_KEY, String(visits));
  signals.returnVisits = Math.max(0, visits - 1);
  signals.sessionMs = 0;

  const { persona, confidence } = classifyPersona(signals);
  sessionStart = performance.now();
  state = { vid, signals, persona, confidence, listeners: new Set(), lastPersona: persona };
  return state;
}

function notify() {
  if (!state) return;
  state.listeners.forEach((l) => l());
}

function recompute() {
  if (!state) return;
  const { persona, confidence } = classifyPersona(state.signals);
  const changed = persona !== state.persona;
  state.persona = persona;
  state.confidence = confidence;
  if (changed) {
    state.lastPersona = persona;
    logEvent('persona_change', { persona, confidence });
  }
}

function persist() {
  if (!state) return;
  try {
    localStorage.setItem(SIG_KEY, JSON.stringify(state.signals));
  } catch {
    // storage full — silently continue
  }
  recompute();
  notify();
  scheduleSync();
}

function scheduleSync() {
  if (!state) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = window.setTimeout(syncNow, 3500);
}

async function syncNow() {
  if (!state) return;
  try {
    await supabase.from('visitor_sessions').upsert(
      {
        visitor_id: state.vid,
        persona: state.persona,
        persona_confidence: Number(state.confidence.toFixed(3)),
        signals: state.signals,
        sessions_count: (state.signals.returnVisits ?? 0) + 1,
        last_seen: new Date().toISOString(),
      },
      { onConflict: 'visitor_id' },
    );
  } catch {
    // offline or rls rejection — silent
  }
}

async function logEvent(type: string, payload: Record<string, unknown>) {
  if (!state) return;
  try {
    await supabase.from('visitor_events').insert({
      visitor_id: state.vid,
      type,
      payload,
    });
  } catch {
    // silent
  }
}

export function recordDwell(section: string, deltaMs: number) {
  const s = init();
  if (deltaMs <= 0) return;
  const cur = s.signals.sectionDwell[section] ?? 0;
  s.signals.sectionDwell = { ...s.signals.sectionDwell, [section]: cur + deltaMs / 1000 };
  persist();
}

export function recordScrollDepth(depth: number) {
  const s = init();
  s.signals.scrollDepth = Math.max(s.signals.scrollDepth, Math.min(1, depth));
  persist();
}

export function recordOverride() {
  const s = init();
  if (s.signals.overrideActivated) return;
  s.signals.overrideActivated = true;
  persist();
  logEvent('override_activated', {});
}

export function recordCommand() {
  const s = init();
  s.signals.commandUses += 1;
  persist();
}

export function recordVkAnswer() {
  const s = init();
  s.signals.vkAnswers += 1;
  persist();
  logEvent('vk_answer', { total: s.signals.vkAnswers });
}

export function recordProjectHover() {
  const s = init();
  s.signals.projectHovers += 1;
  persist();
}

export function recordSkylinePointer() {
  const s = init();
  s.signals.skylinePointerMoves += 1;
  // avoid persisting on every mouse-move; throttle to every 25 events
  if (s.signals.skylinePointerMoves % 25 === 0) persist();
}

export function startSessionTick() {
  if (!isBrowser()) return;
  const s = init();
  if (tickTimer) return;
  tickTimer = window.setInterval(() => {
    s.signals.sessionMs = Math.round(performance.now() - sessionStart);
    recompute();
    notify();
  }, 2000);
}

export function getState(): State {
  return init();
}

export function subscribe(listener: Listener) {
  const s = init();
  s.listeners.add(listener);
  return () => {
    s.listeners.delete(listener);
  };
}

export function useIntelligence() {
  const [, force] = useState(0);
  useEffect(() => subscribe(() => force((n) => n + 1)), []);
  const s = getState();
  return {
    vid: s.vid,
    persona: s.persona,
    confidence: s.confidence,
    signals: s.signals,
  };
}

export function flush() {
  if (!state) return;
  void syncNow();
}

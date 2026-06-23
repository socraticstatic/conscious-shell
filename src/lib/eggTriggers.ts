// eggTriggers.ts — shared trigger helpers for the behavioral eggs.

import { useEffect } from 'react';

function isTypingTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
}

// useTypedWord — fire `handler` when the visitor types `word` anywhere on the
// page (outside form fields). Case-insensitive. Matches the rolling key buffer
// the same way OverrideMode matches the Konami code.
export function useTypedWord(word: string, handler: () => void) {
  useEffect(() => {
    const target = word.toLowerCase();
    let buf = '';
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-target.length);
      if (buf === target) {
        buf = '';
        handler();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [word, handler]);
}

// useWindowEvent — small typed wrapper for the CustomEvent triggers eggs use
// (e.g. palette commands dispatch `egg:witness`).
export function useWindowEvent(name: string, handler: () => void) {
  useEffect(() => {
    const fn = () => handler();
    window.addEventListener(name, fn);
    return () => window.removeEventListener(name, fn);
  }, [name, handler]);
}

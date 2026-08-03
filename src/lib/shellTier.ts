//
// The shell has two costumes. 'full' is the desktop theater: ambient
// overlays, HUDs, eggs. 'calm' is the reader: content, the boot sequence,
// grain, one slow rain layer, the dock. Phones and coarse-pointer tablets
// are calm; the theater needs a wide screen and a fine pointer.
// See docs/superpowers/specs/2026-08-03-mobile-calm-reader-design.md.

import { useEffect, useState } from 'react';

export type ShellTier = 'full' | 'calm';

const WIDE_QUERY = '(min-width: 768px)';
const FINE_QUERY = '(hover: hover) and (pointer: fine)';

export function resolveTier(wide: boolean, finePointer: boolean): ShellTier {
  return wide && finePointer ? 'full' : 'calm';
}

function readTier(): ShellTier {
  if (typeof window === 'undefined' || !window.matchMedia) return 'calm';
  return resolveTier(
    window.matchMedia(WIDE_QUERY).matches,
    window.matchMedia(FINE_QUERY).matches,
  );
}

export function useShellTier(): ShellTier {
  const [tier, setTier] = useState<ShellTier>(readTier);

  useEffect(() => {
    if (!window.matchMedia) return;
    const wide = window.matchMedia(WIDE_QUERY);
    const fine = window.matchMedia(FINE_QUERY);
    const update = () => setTier(resolveTier(wide.matches, fine.matches));
    wide.addEventListener('change', update);
    fine.addEventListener('change', update);
    return () => {
      wide.removeEventListener('change', update);
      fine.removeEventListener('change', update);
    };
  }, []);

  return tier;
}

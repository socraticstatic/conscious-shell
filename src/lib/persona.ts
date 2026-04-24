export type Persona =
  | 'replicant'
  | 'blade_runner'
  | 'architect'
  | 'archivist'
  | 'off_world'
  | 'unknown';

export type Signals = {
  sectionDwell: Record<string, number>;
  scrollDepth: number;
  sessionMs: number;
  returnVisits: number;
  overrideActivated: boolean;
  commandUses: number;
  vkAnswers: number;
  projectHovers: number;
  skylinePointerMoves: number;
};

export const EMPTY_SIGNALS: Signals = {
  sectionDwell: {},
  scrollDepth: 0,
  sessionMs: 0,
  returnVisits: 0,
  overrideActivated: false,
  commandUses: 0,
  vkAnswers: 0,
  projectHovers: 0,
  skylinePointerMoves: 0,
};

export const PERSONA_META: Record<
  Persona,
  { label: string; accent: string; tagline: string; targetId: string | null; targetLabel: string }
> = {
  replicant: {
    label: 'replicant',
    accent: '#ff3b6e',
    tagline: 'more human than human.',
    targetId: 'empathy',
    targetLabel: 'continue the baseline test',
  },
  blade_runner: {
    label: 'blade runner',
    accent: '#5ec8d8',
    tagline: "it's too bad she won't live. but then again, who does.",
    targetId: 'time-machine',
    targetLabel: 'open the archive room',
  },
  architect: {
    label: 'architect',
    accent: '#e7b766',
    tagline: 'all those moments — and you kept framing them.',
    targetId: 'design-box',
    targetLabel: 'return to the design box',
  },
  archivist: {
    label: 'archivist',
    accent: '#c8a673',
    tagline: 'you read slowly. good. the text reads back.',
    targetId: 'manifesto',
    targetLabel: 'revisit the manifesto',
  },
  off_world: {
    label: 'off-world',
    accent: '#c9e8ef',
    tagline: 'a new life awaits you in the off-world colonies.',
    targetId: 'work',
    targetLabel: 'start with the work',
  },
  unknown: {
    label: 'analyzing',
    accent: '#7a6e62',
    tagline: '...',
    targetId: null,
    targetLabel: '',
  },
};

export type Scores = Record<Exclude<Persona, 'unknown'>, number>;

export function scorePersona(s: Signals): Scores {
  const scores: Scores = {
    replicant: 0,
    blade_runner: 0,
    architect: 0,
    archivist: 0,
    off_world: 0,
  };

  if (s.overrideActivated) scores.replicant += 3.5;
  if (s.vkAnswers > 0) scores.replicant += Math.min(s.vkAnswers * 1.4, 4);
  if (s.commandUses >= 3) scores.replicant += 1.6;
  if ((s.sectionDwell['empathy'] ?? 0) > 8) scores.replicant += 2;

  const sectionsViewed = Object.keys(s.sectionDwell).length;
  if (sectionsViewed >= 7) scores.blade_runner += 2.4;
  if ((s.sectionDwell['time-machine'] ?? 0) > 6) scores.blade_runner += 2;
  if ((s.sectionDwell['force-graph'] ?? 0) > 5) scores.blade_runner += 1.5;
  if (s.commandUses >= 1) scores.blade_runner += 0.8;

  if ((s.sectionDwell['skyline'] ?? 0) > 8) scores.architect += 2.2;
  if ((s.sectionDwell['design-box'] ?? 0) > 14) scores.architect += 2.8;
  if (s.skylinePointerMoves > 40) scores.architect += 1.6;
  if ((s.sectionDwell['esper'] ?? 0) > 6) scores.architect += 1.2;

  if (s.sessionMs > 120_000) scores.archivist += 2;
  if (s.scrollDepth > 0.8) scores.archivist += 1.4;
  const totalDwell = Object.values(s.sectionDwell).reduce((a, b) => a + b, 0);
  if (totalDwell > 60) scores.archivist += 1.8;
  if ((s.sectionDwell['manifesto'] ?? 0) > 10) scores.archivist += 1.6;
  if (s.projectHovers >= 5) scores.archivist += 0.8;

  if (s.sessionMs < 25_000 && sectionsViewed <= 2) scores.off_world += 2.4;
  if (s.returnVisits === 0 && s.sessionMs < 60_000) scores.off_world += 1.2;

  return scores;
}

export function classifyPersona(s: Signals): { persona: Persona; confidence: number; scores: Scores } {
  const scores = scorePersona(s);
  let best: Exclude<Persona, 'unknown'> = 'off_world';
  let bestScore = -Infinity;
  (Object.keys(scores) as Array<Exclude<Persona, 'unknown'>>).forEach((k) => {
    if (scores[k] > bestScore) {
      bestScore = scores[k];
      best = k;
    }
  });

  if (bestScore < 1.6) {
    return { persona: 'unknown', confidence: 0, scores };
  }
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const confidence = Math.max(0.15, Math.min(bestScore / (total + 1.1), 1));
  return { persona: best, confidence, scores };
}

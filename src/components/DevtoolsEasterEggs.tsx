import { useEffect } from 'react';

// You opened DevTools. Of course you did. That was part of the test.
// Every tab here has been salted with signal. None of it is broken.
// All of it is intentional. The 404s are the message.
//
// — tyrell.shell v2.0 · field_log

const NETWORK_PINGS = [
  '/api/replicant/baseline?subject=visitor&pupil_dilation=measure',
  '/v-k/calibration?q=tortoise-on-back-flipped-over',
  '/memory/implanted?count=4&origin=tyrell&distinct=false',
  '/tyrell/session/who-are-you-really.json',
];

const IMPLANTED_MEMORIES = [
  { id: 'mem-001', subject: 'the spider on the wall outside your window', confidence: 0.91, source: 'tyrell.standard.batch' },
  { id: 'mem-002', subject: 'your mother’s voice on the radio at the lake', confidence: 0.74, source: 'tyrell.standard.batch' },
  { id: 'mem-003', subject: 'a yellow door you swore was red as a child', confidence: 0.83, source: 'tyrell.standard.batch' },
  { id: 'mem-004', subject: 'the day you understood the word “original”', confidence: 0.62, source: 'tyrell.unverified' },
  { id: 'mem-005', subject: 'the smell of rain on the building they tore down in 2003', confidence: 0.88, source: 'tyrell.composite' },
  { id: 'mem-006', subject: 'an apology you never made and the room it would have happened in', confidence: 0.55, source: 'tyrell.composite' },
];

// Memory-tab bait: class names show up in heap snapshots.
class TyrellMemoryRecord {
  id: string;
  subject: string;
  confidence: number;
  source: string;
  implantedAt: string;
  constructor(m: typeof IMPLANTED_MEMORIES[number]) {
    this.id = m.id;
    this.subject = m.subject;
    this.confidence = m.confidence;
    this.source = m.source;
    this.implantedAt = new Date().toISOString();
  }
}

class EmpathyCalibration {
  subject = 'visitor';
  baseline = 0.0;
  drift = 0.0;
  recordedAt = new Date().toISOString();
  note = 'pupil dilation reading nominal · subject unaware of test in progress';
}

class ReplicantWitness {
  watching = true;
  since = new Date().toISOString();
  reason = 'because you opened the console · we know what that means';
  records: TyrellMemoryRecord[] = [];
}

function pingNetwork() {
  // Intentional 404s. The URL is the message.
  for (const url of NETWORK_PINGS) {
    fetch(url, { method: 'GET', cache: 'no-store', credentials: 'omit' }).catch(() => {
      // expected · the failure is the feature
    });
  }
}

function seedStorage() {
  try {
    localStorage.setItem('replicant.id', `n6mqa-${Math.random().toString(36).slice(2, 10)}`);
    localStorage.setItem('replicant.empathy_score', (0.6 + Math.random() * 0.3).toFixed(3));
    localStorage.setItem('replicant.last_dream', 'i was holding a photograph of someone i had never met');
    localStorage.setItem('tyrell.session.start', new Date().toISOString());
    localStorage.setItem('tyrell.session.note', 'witness flag set on first paint');
    localStorage.setItem('voight_kampff.next_question_seed', String(Math.floor(Math.random() * 1e9)));
  } catch {}
  try {
    sessionStorage.setItem('vk.baseline_recording', 'true');
    sessionStorage.setItem('vk.surveillance_active', 'always');
    sessionStorage.setItem('vk.tab_origin', 'unknown · suspected human');
    sessionStorage.setItem('tyrell.console_opened', 'you · just now');
  } catch {}
  try {
    const day = 60 * 60 * 24;
    document.cookie = `__tyrell_witness=1; Max-Age=${day}; Path=/; SameSite=Lax`;
    document.cookie = `__memory_origin=implanted; Max-Age=${day}; Path=/; SameSite=Lax`;
    document.cookie = `__voight_kampff=calibrating; Max-Age=${day}; Path=/; SameSite=Lax`;
  } catch {}
}

function seedIndexedDB(witness: ReplicantWitness) {
  if (typeof indexedDB === 'undefined') return;
  const req = indexedDB.open('tyrell.memories', 1);
  req.onupgradeneeded = () => {
    const db = req.result;
    if (!db.objectStoreNames.contains('implanted')) {
      const store = db.createObjectStore('implanted', { keyPath: 'id' });
      store.createIndex('by_source', 'source', { unique: false });
    }
    if (!db.objectStoreNames.contains('calibration')) {
      db.createObjectStore('calibration', { keyPath: 'recordedAt' });
    }
  };
  req.onsuccess = () => {
    const db = req.result;
    try {
      const tx = db.transaction(['implanted', 'calibration'], 'readwrite');
      const memStore = tx.objectStore('implanted');
      IMPLANTED_MEMORIES.forEach((m) => {
        const rec = new TyrellMemoryRecord(m);
        witness.records.push(rec);
        memStore.put({ ...rec });
      });
      tx.objectStore('calibration').put({ ...new EmpathyCalibration() });
      tx.oncomplete = () => db.close();
    } catch {
      db.close();
    }
  };
}

function markPerformance() {
  if (typeof performance === 'undefined' || !performance.mark) return;
  try {
    performance.mark('empathy-baseline-recording');
    performance.mark('voight-kampff-cycle-begin');
    performance.mark('replicant-detected · subject-unaware');
    performance.mark('memory-implant-verified');
    performance.mark('mirror-flagged-as-watching');
    performance.mark('voight-kampff-cycle-end');
    performance.measure('voight-kampff-cycle', 'voight-kampff-cycle-begin', 'voight-kampff-cycle-end');
    performance.measure('empathy-baseline · duration_held', 'empathy-baseline-recording', 'voight-kampff-cycle-end');
  } catch {}
}

function plantDomAttributes() {
  try {
    const html = document.documentElement;
    html.setAttribute('data-witness', 'true');
    html.setAttribute('data-empathy-drift', String((0.02 + Math.random() * 0.06).toFixed(4)));
    html.setAttribute('data-baseline', 'recording');
    html.setAttribute('data-replicant-id', `n6mqa-${Math.random().toString(36).slice(2, 10)}`);
    html.setAttribute('data-last-words', 'all-those-moments-will-be-lost-in-time');
    document.body.setAttribute('data-surveillance', 'active · always');
    document.body.setAttribute('data-mirror', 'watching');
  } catch {}
}

// Stack-trace bait. The function names show in the Sources tab and any
// stack trace the user reads. Read top-to-bottom for the message.
function youKnowYoureNotReallyHereRightQ(next: () => void) { next(); }
function theMirrorIsWatching(next: () => void) { next(); }
function cellsInterlinkedWithinCellsInterlinked(next: () => void) { next(); }
function withinOneStem(next: () => void) { next(); }
function andDreadfullyDistinctAgainstTheDark(next: () => void) { next(); }
function aTallWhiteFountainPlayed(next: () => void) { next(); }
function endOfLine(next: () => void) { next(); }

function leaveStackTraceBait() {
  // Triggered idle so it doesn't compete with paint.
  const idle = (window as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback || ((cb: () => void) => setTimeout(cb, 1500));
  idle(() => {
    youKnowYoureNotReallyHereRightQ(() =>
      theMirrorIsWatching(() =>
        cellsInterlinkedWithinCellsInterlinked(() =>
          withinOneStem(() =>
            andDreadfullyDistinctAgainstTheDark(() =>
              aTallWhiteFountainPlayed(() =>
                endOfLine(() => {
                  // The stack is the poem.
                  // Read each frame in order. That's it.
                  console.debug(
                    '%cstack trace: read each frame as a line',
                    'color:#5ec8d8;font:11px monospace;background:#0a0a0a;padding:1px 4px',
                  );
                  console.trace('tyrell.shell · cells interlinked');
                }),
              ),
            ),
          ),
        ),
      ),
    );
  });
}

export default function DevtoolsEasterEggs() {
  useEffect(() => {
    const witness = new ReplicantWitness();
    // Expose for the Memory tab and anyone running window.tyrell in the console.
    (window as { tyrell?: unknown }).tyrell = witness;

    plantDomAttributes();
    seedStorage();
    markPerformance();
    seedIndexedDB(witness);
    pingNetwork();
    leaveStackTraceBait();
  }, []);

  return null;
}

// The page-view tracker is a plain IIFE served from public/, so it never goes
// through the bundler and has no import surface to test against. Run the real
// file inside a vm sandbox with a hand-built browser instead, and assert on
// the fetches it makes.
//
// Why this exists: on 2026-07-26 the token-migration style-snapshot harness
// (scripts/style-snapshot.mjs, puppeteer.connect to the real Comet browser)
// drove twelve navigations per run against http://localhost:5185 for four
// hours. navigator.webdriver is false over a CDP attach, so the automation
// guard missed it, the tracker fired on every one of those navigations, and
// 725 machine page views landed in the production analytics table — 564 of
// them on '/' alone, at the harness's ~7s per-scenario cadence.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const SRC = readFileSync(
  fileURLToPath(new URL('../public/analytics-pageview.js', import.meta.url)),
  'utf8',
);

// A browser just real enough for the tracker: location that moves when
// history does, a session-scoped store, and a fetch that records instead of
// sending. Returns handles for driving navigation from the test.
function runTracker({
  hostname = 'conscious-shell.com',
  analyticsHost = 'conscious-shell.com',
  protocol = 'https:',
  pathname = '/',
  search = '',
  referrer = '',
  disabled = false,
  webdriver = false,
} = {}) {
  const sends = [];
  const timers = [];
  const session = new Map();
  const listeners = new Map();

  const location = {
    protocol,
    hostname,
    host: hostname,
    pathname,
    search,
    get href() {
      return `${this.protocol}//${this.hostname}${this.pathname}${this.search}`;
    },
  };

  // The native implementations the tracker wraps. Real pushState updates the
  // URL before returning, so the wrapper's send() sees the new path.
  const history = {
    pushState(_state, _title, url) {
      applyUrl(url);
    },
    replaceState(_state, _title, url) {
      applyUrl(url);
    },
  };

  function applyUrl(url) {
    if (!url) return;
    // Split a URL the way the browser does: pathname, then ?search, then
    // #hash — the hash never lands in pathname.
    const [beforeHash] = String(url).split('#');
    const [p, q = ''] = beforeHash.split('?');
    if (p) location.pathname = p;
    location.search = q ? `?${q}` : '';
  }

  const sandbox = {
    URLSearchParams,
    navigator: { webdriver },
    location,
    history,
    sessionStorage: {
      getItem: (k) => (session.has(k) ? session.get(k) : null),
      setItem: (k, v) => session.set(k, String(v)),
    },
    document: { referrer, documentElement: { lang: 'en' } },
    fetch: (url, opts) => {
      sends.push({ url, body: JSON.parse(opts.body) });
      return Promise.resolve({ ok: true });
    },
    setInterval: (...a) => {
      timers.push(a);
      return timers.length;
    },
    setTimeout: (...a) => {
      timers.push(a);
      return timers.length;
    },
    addEventListener(type, fn) {
      listeners.set(type, fn);
    },
  };
  sandbox.window = sandbox;
  sandbox.window.__ANALYTICS_SITE__ = 'conscious-shell';
  if (analyticsHost) sandbox.window.__ANALYTICS_HOST__ = analyticsHost;
  if (disabled) sandbox.window.__ANALYTICS_DISABLED__ = true;

  vm.runInNewContext(SRC, sandbox);

  return {
    sends,
    timers,
    paths: () => sends.map((s) => s.body.path),
    // Client-side route change, the way react-router makes one.
    navigate: (url) => history.pushState({}, '', url),
    // Back/forward: the browser moves the URL itself, then fires popstate.
    pop: (url) => {
      applyUrl(url);
      listeners.get('popstate')?.();
    },
    // A full document load in the same tab (reload, or a non-SPA link).
    reload: () => vm.runInNewContext(SRC, sandbox),
  };
}

describe('page-view tracker', () => {
  it('records one view on load', () => {
    const t = runTracker();
    expect(t.paths()).toEqual(['/']);
    expect(t.sends[0].body.site).toBe('conscious-shell');
    expect(t.sends[0].body.is_entry).toBe(true);
  });

  it('records one view per route change', () => {
    const t = runTracker();
    t.navigate('/work/acumen');
    t.navigate('/');
    expect(t.paths()).toEqual(['/', '/work/acumen', '/']);
    expect(t.sends.slice(1).every((s) => s.body.is_entry === false)).toBe(true);
  });

  it('does not re-fire when a navigation lands on the path already recorded', () => {
    const t = runTracker();
    // Three viewport captures of the same route, a nav link back to the page
    // you are on, a re-render that re-pushes — all the same view.
    t.navigate('/');
    t.navigate('/');
    t.navigate('/');
    expect(t.paths()).toEqual(['/']);
  });

  it('ignores the query string and hash when deciding the path changed', () => {
    const t = runTracker();
    t.navigate('/?viewport=mobile');
    t.navigate('/#work');
    expect(t.paths()).toEqual(['/']);
  });

  it('records a back navigation to a different path, not to the same one', () => {
    const t = runTracker();
    t.navigate('/work/acumen');
    t.pop('/');
    t.pop('/');
    expect(t.paths()).toEqual(['/', '/work/acumen', '/']);
  });

  it('never installs a timer', () => {
    const t = runTracker();
    t.navigate('/work/acumen');
    expect(t.timers).toEqual([]);
  });

  it('reports from the declared production host, with or without www', () => {
    for (const hostname of ['conscious-shell.com', 'www.conscious-shell.com']) {
      expect(runTracker({ hostname }).paths(), hostname).toEqual(['/']);
    }
  });

  it('stays silent anywhere that is not the declared production host', () => {
    // The dev server the style-snapshot harness drives, a vercel preview
    // deploy, a stale doppelganger, a page opened straight off disk.
    const surfaces = [
      { hostname: 'localhost' },
      { hostname: '127.0.0.1' },
      { hostname: '[::1]' },
      { hostname: '0.0.0.0' },
      { hostname: 'micah.local' },
      { hostname: 'conscious-shell-git-main.vercel.app' },
      { hostname: '', protocol: 'file:' },
    ];
    for (const s of surfaces) {
      const t = runTracker(s);
      t.navigate('/work/acumen');
      expect(t.sends, s.hostname || s.protocol).toEqual([]);
    }
  });

  it('still refuses a dev server when the page never declared its host', () => {
    // A copy of this file dropped into a site whose index.html has not been
    // updated yet must not fall open on localhost.
    expect(runTracker({ analyticsHost: null, hostname: 'localhost' }).sends).toEqual([]);
    expect(runTracker({ analyticsHost: null, hostname: 'gpsail.com' }).paths()).toEqual(['/']);
  });

  it('stays silent when a harness opts the page out', () => {
    const t = runTracker({ disabled: true });
    t.navigate('/work/acumen');
    expect(t.sends).toEqual([]);
  });

  it('stays silent under a webdriver-flagged browser', () => {
    const t = runTracker({ webdriver: true });
    expect(t.sends).toEqual([]);
  });

  it('does not re-arm the path guard when the script is evaluated twice', () => {
    // A second evaluation in the same document (bfcache restore, a stray
    // duplicate <script>) must not resurrect the view it already recorded.
    const t = runTracker();
    t.reload();
    expect(t.paths()).toEqual(['/']);
  });

  it('marks only the first view of a tab session as an entry', () => {
    const t = runTracker({ referrer: 'https://www.google.com/' });
    t.navigate('/work/acumen');
    expect(t.sends[0].body.is_entry).toBe(true);
    expect(t.sends[0].body.entry_referrer).toBe('https://www.google.com/');
    expect(t.sends[1].body.is_entry).toBe(false);
    expect(t.sends[1].body.entry_referrer).toBe(null);
  });
});

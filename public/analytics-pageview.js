// Privacy-friendly page-view tracker for the shared analytics hub.
// Records site + path + referrer + locale only. No IP, cookies, UA, or fingerprint.
// Fire-and-forget; never throws.
//
// SPA-aware, and deliberately at-most-once per path: the only thing that
// counts as a new view is landing on a path this document has not already
// reported. A navigation back to the page you are already on, a re-render
// that re-pushes the same URL, a query-string or hash change, a second copy
// of this script in the document — none of those are views.
//
// On the first pageview of a tab session, captures entry referrer + UTM params
// so real acquisition sources survive internal navigation.
//
// Three ways to be silent, in the order they are checked:
//   1. navigator.webdriver — Playwright/Selenium.
//   2. window.__ANALYTICS_DISABLED__ — an opt-out any harness can set before
//      this script runs (page.evaluateOnNewDocument, an injected <script>).
//   3. anything that is not the declared production host.
// (2) and (3) exist because scripts/style-snapshot.mjs drives the real
// browser over a CDP attach, where navigator.webdriver is FALSE. On
// 2026-07-26 it ran twelve navigations per capture against localhost:5185
// for four hours and put 725 machine page views into the production table —
// 564 of them on '/', spaced at the harness's ~7s per-scenario cadence.
(function () {
  if (typeof window === 'undefined' || !window.fetch) return;
  if (navigator.webdriver) return; // headless automation / E2E
  if (window.__ANALYTICS_DISABLED__) return; // harness opt-out
  if (!isProductionSurface()) return; // dev server, preview, file://

  var SB_URL = 'https://uunehrczooesuganzujg.supabase.co';
  var KEY = 'sb_publishable_kO5HEhc0V68L5psarh4pfw_8vte_8JO';
  var SITE = window.__ANALYTICS_SITE__ || 'unknown';

  // The live site reports. Nothing else does. The host is declared next to the
  // site name in index.html so the domain lives in one place; when a page
  // declares one, only that host counts. The local-host rejection stands on
  // its own so a copy of this file that has not declared its host yet still
  // cannot report a dev server as an audience.
  function isProductionSurface() {
    try {
      if (location.protocol !== 'https:' && location.protocol !== 'http:') return false;
      var here = strip(location.hostname);
      if (isLocalHost(here)) return false;
      var declared = window.__ANALYTICS_HOST__;
      return declared ? here === strip(declared) : true;
    } catch (_) {
      return false; // unknowable surface -> not production
    }
  }

  function strip(h) {
    return String(h || '')
      .toLowerCase()
      .replace(/^\[|\]$/g, '') // location.hostname wraps IPv6 in brackets
      .replace(/^www\./, '');
  }

  function isLocalHost(h) {
    return (
      h === 'localhost' ||
      h === '0.0.0.0' ||
      h === '::1' ||
      /^127\./.test(h) ||
      /\.localhost$/.test(h) ||
      /\.local$/.test(h)
    );
  }

  // The path this document has already reported. Parked on `window` rather
  // than in this closure so a second evaluation of this file cannot report a
  // view the first one already sent.
  function alreadyReported(path) {
    return window.__pvPath === path;
  }

  function send() {
    try {
      var path = location.pathname;
      if (alreadyReported(path)) return;
      window.__pvPath = path;

      var ref = document.referrer || null;
      var externalRef = ref && ref.indexOf(location.host) === -1 ? ref.slice(0, 500) : null;
      var isEntry = false;
      try {
        if (!sessionStorage.getItem('_pv_session')) {
          sessionStorage.setItem('_pv_session', '1');
          isEntry = true;
        }
      } catch (_) { isEntry = true; } // storage blocked -> treat as entry
      var qp;
      try { qp = new URLSearchParams(location.search); } catch (_) { qp = null; }
      function utm(k) { return (qp && qp.get('utm_' + k)) || null; }
      fetch(SB_URL + '/rest/v1/page_views', {
        method: 'POST',
        headers: {
          apikey: KEY,
          Authorization: 'Bearer ' + KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          site: SITE,
          path: path,
          referrer: externalRef,
          locale: document.documentElement.lang || null,
          is_entry: isEntry,
          entry_referrer: isEntry ? externalRef : null,
          utm_source: utm('source'),
          utm_medium: utm('medium'),
          utm_campaign: utm('campaign'),
        }),
        keepalive: true,
      }).catch(function () {});
    } catch (_) { /* analytics must never break the page */ }
  }

  send();
  // pushState only. replaceState rewrites the current entry — a filter, a
  // scroll restore, a canonicalised query — and is not a new view.
  var push = history.pushState;
  history.pushState = function () { push.apply(this, arguments); send(); };
  window.addEventListener('popstate', send);
})();

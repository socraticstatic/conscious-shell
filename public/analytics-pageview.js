// Privacy-friendly page-view tracker for the shared analytics hub.
// Records site + path + referrer + locale only. No IP, cookies, UA, or fingerprint.
// Fire-and-forget; never throws. SPA-aware (re-fires on client route changes).
// Skips automation (Playwright/Selenium) so E2E runs don't inflate counts.
// On the first pageview of a tab session, captures entry referrer + UTM params
// so real acquisition sources survive internal navigation.
(function () {
  if (typeof window === 'undefined' || !window.fetch) return;
  if (navigator.webdriver) return; // skip headless automation / E2E
  var SB_URL = 'https://uunehrczooesuganzujg.supabase.co';
  var KEY = 'sb_publishable_kO5HEhc0V68L5psarh4pfw_8vte_8JO';
  var SITE = window.__ANALYTICS_SITE__ || 'unknown';

  function send() {
    try {
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
          path: location.pathname,
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
  var push = history.pushState;
  history.pushState = function () { push.apply(this, arguments); send(); };
  window.addEventListener('popstate', send);
})();

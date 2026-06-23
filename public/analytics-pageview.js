// Privacy-friendly page-view tracker for the shared analytics hub.
// Records site + path + referrer + locale only. No IP, cookies, UA, or fingerprint.
// Fire-and-forget; never throws. SPA-aware (re-fires on client route changes).
(function () {
  if (typeof window === 'undefined' || !window.fetch) return;
  var SB_URL = 'https://uunehrczooesuganzujg.supabase.co';
  var KEY = 'sb_publishable_kO5HEhc0V68L5psarh4pfw_8vte_8JO';
  var SITE = window.__ANALYTICS_SITE__ || 'unknown';

  function send() {
    try {
      var ref = document.referrer || null;
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
          referrer: ref && ref.indexOf(location.host) === -1 ? ref.slice(0, 500) : null,
          locale: document.documentElement.lang || null,
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

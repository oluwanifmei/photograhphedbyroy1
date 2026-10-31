(() => {
  if (navigator.doNotTrack === '1' || navigator.globalPrivacyControl || !window.crypto?.randomUUID || typeof APP_CONFIG === 'undefined') return;
  const routes = new Set(['portfolio','services','before-after','stories','book','about','contact','collections','login','signup']);
  const parts = location.pathname.replace(/\.html$/, '').split('/').filter(Boolean);
  if (parts.some(part => ['admin','account'].includes(part))) return;
  const route = parts.find(part => routes.has(part));
  const page = route ? '/' + route : '/';
  let session;
  try {
    const saved = JSON.parse(sessionStorage.getItem('roy-visit') || 'null');
    session = saved && Date.now() - saved.last < 1800000 ? saved.id : crypto.randomUUID();
    sessionStorage.setItem('roy-visit', JSON.stringify({ id: session, last: Date.now() }));
  } catch { session = crypto.randomUUID(); }
  let source = 'direct';
  try { if (document.referrer && new URL(document.referrer).origin !== location.origin) source = new URL(document.referrer).hostname; } catch {}
  const device = matchMedia('(max-width: 760px)').matches ? 'mobile' : matchMedia('(max-width: 1100px)').matches ? 'tablet' : 'desktop';
  let clicks = 0;
  const send = kind => {
    fetch(APP_CONFIG.API_BASE + '/api/analytics/event', { method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: crypto.randomUUID(), session, page, kind, device, source }), keepalive: true }).catch(() => {});
  };
  send('pageview');
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]'); if (!link || clicks >= 20) return;
    let target; try { target = new URL(link.href); } catch { return; }
    const kind = /(^|\.)(wa\.me|whatsapp\.com)$/.test(target.hostname) ? 'whatsapp' : /\/(book|booking)(\.html)?\/?$/.test(target.pathname) ? 'booking_open' : target.protocol === 'mailto:' ? 'email' : null;
    if (kind) { clicks++; send(kind); }
  });
})();

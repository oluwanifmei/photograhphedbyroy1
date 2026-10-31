(() => {
  const dialog = document.getElementById('royWelcome');
  if (!dialog || !document.querySelector('#page-home.active') || typeof dialog.showModal !== 'function') return;
  const remember = dialog.querySelector('#royWelcomeRemember');
  const read = (storage, key) => { try { return window[storage].getItem(key); } catch { return null; } };
  const write = (storage, key) => { try { window[storage].setItem(key, '1'); } catch {} };
  if (read('localStorage', 'roy-welcome-hidden') || read('sessionStorage', 'roy-welcome-seen')) return;
  const previousFocus = document.activeElement;
  dialog.addEventListener('close', () => {
    write('sessionStorage', 'roy-welcome-seen');
    if (remember.checked) write('localStorage', 'roy-welcome-hidden');
    if (previousFocus && previousFocus !== document.body) previousFocus.focus();
  });
  dialog.querySelector('.roy-welcome-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('a').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  dialog.showModal();
})();

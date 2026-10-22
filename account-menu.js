(() => {
  const initialize = async () => {
    const button = document.getElementById('accountBtn');
    const menu = document.getElementById('accountMenu');
    const dropdown = document.getElementById('accountDropdown');
    if (!button || !menu || !dropdown) return;
    const setOpen = open => {
      button.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden', String(!open));
      menu.classList.toggle('active', open);
    };
    button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
    button.addEventListener('keydown', event => {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault(); setOpen(true); menu.querySelector('a, button')?.focus();
    });
    document.addEventListener('click', event => { if (!dropdown.contains(event.target)) setOpen(false); });
    document.addEventListener('focusin', event => { if (!dropdown.contains(event.target)) setOpen(false); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') { setOpen(false); button.focus(); }
    });
    // On Pages, account links open their first-party backend destinations after hosting is connected.
    if (window.APP_CONFIG.STATIC_HOSTING) return;
    let user;
    try { user = await window.RoyAPI.request('/api/me'); } catch { return; }
    menu.innerHTML = '<p class="account-menu-header">YOUR ACCOUNT</p><a href="account.html" class="account-menu-item">My account</a>'
      + (user.isAdmin ? '<a href="admin.html" class="account-menu-item">Admin dashboard<small>Manage private bookings</small></a>' : '')
      + '<div class="account-menu-divider"></div><button type="button" class="account-menu-item" id="accountLogout">Log out</button>';
    menu.querySelector('#accountLogout')?.addEventListener('click', async event => {
      event.target.disabled = true;
      try { await window.RoyAPI.request('/api/logout', { method: 'POST', body: '{}' }); window.location.reload(); }
      catch { event.target.disabled = false; event.target.textContent = 'Retry log out'; }
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();

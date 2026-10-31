document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const notice = (message, error = false) => { $('adminNotice').textContent = message; $('adminNotice').dataset.state = error ? 'error' : 'success'; };
  let page = 1, total = 0, loadVersion = 0;
  const limit = 20;
  const query = () => new URLSearchParams({ search: $('bookingSearch').value.trim(), status: $('bookingStatusFilter').value });
  const node = (tag, text, className) => { const el = document.createElement(tag); if (text != null) el.textContent = text; if (className) el.className = className; return el; };
  function renderRows(items) {
    $('bookingRows').replaceChildren(); $('bookingEmpty').hidden = items.length > 0;
    items.forEach(booking => {
      const row = node('tr');
      const cell = (label, text) => { const el = node('td', text); el.dataset.label = label; row.appendChild(el); return el; };
      const client = cell('Client'); client.appendChild(node('strong', booking.name || 'Unnamed client'));
      const email = node('a', booking.email || ''); email.href = 'mailto:' + encodeURIComponent(booking.email || ''); client.appendChild(email);
      if (booking.phone) client.appendChild(node('small', booking.phone));
      const session = cell('Session', booking.service || 'Custom');
      if (booking.message || booking.location) { const details = node('details'); details.appendChild(node('summary', 'View notes')); details.appendChild(node('p', [booking.location, booking.message].filter(Boolean).join(' · '))); session.appendChild(details); }
      cell('Requested date', [booking.date, booking.time].filter(Boolean).join(' · '));
      const status = cell('Status'); status.appendChild(node('span', booking.status || 'pending', 'status-badge status-' + (['pending','confirmed','completed','cancelled'].includes(booking.status) ? booking.status : 'pending')));
      const action = cell('Update'); const select = node('select'); select.setAttribute('aria-label', 'Status for ' + (booking.name || 'client'));
      ['pending','confirmed','completed','cancelled'].forEach(value => { const option = node('option', value); option.value = value; select.appendChild(option); }); select.value = booking.status || 'pending';
      const save = node('button', 'Save', 'button button-secondary'); save.type = 'button';
      save.addEventListener('click', async () => {
        save.disabled = true; select.disabled = true;
        try { await RoyAPI.request('/api/admin/booking/' + encodeURIComponent(booking.id) + '/status', { method: 'POST', body: JSON.stringify({ status: select.value }) }); await refresh(); notice('Booking status updated.'); }
        catch (err) { notice(err.message, true); save.disabled = false; select.disabled = false; }
      });
      const reply = node('a', 'Email client ↗', 'button button-secondary');
      const feedback = ['Hi ' + (booking.name || 'there') + ',', '', 'Thank you for choosing Photographed by Roy.', 'Your booking status: ' + (booking.status || 'pending') + '.', 'Session: ' + (booking.service || 'Custom') + '.', 'Requested date: ' + [booking.date, booking.time].filter(Boolean).join(' ') + '.', 'Reference: ' + (booking.id || '').slice(-8).toUpperCase() + '.', '', booking.status === 'confirmed' ? 'Your appointment is confirmed. Please transfer the amount agreed with Roy to:\nBank: OPay\nAccount number: 9025803917\nAccount name: AYOOLA OLUWANIFEMI\nPlease include your name and reference, and reply with your payment receipt.' : 'I will be in touch about the next steps for your session.', '', 'Roy\nPhotographed by Roy'].join('\n');
      reply.href = 'mailto:' + encodeURIComponent(booking.email || '') + '?subject=' + encodeURIComponent('Your photography booking · ' + (booking.id || '').slice(-8).toUpperCase()) + '&body=' + encodeURIComponent(feedback);
      reply.setAttribute('aria-label', 'Email booking update to ' + (booking.name || 'client'));
      action.append(select, save, reply); $('bookingRows').appendChild(row);
    });
  }
  async function refresh() {
    const version = ++loadVersion;
    $('previousBookings').disabled = true; $('nextBookings').disabled = true;
    try {
      const params = query(); params.set('page', page); params.set('limit', limit);
      const [summary, bookings] = await Promise.all([RoyAPI.request('/api/admin/summary'), RoyAPI.request('/api/admin/bookings?' + params)]);
      if (version !== loadVersion) return;
      total = bookings.total;
      if (page > 1 && !bookings.items.length) { page--; return refresh(); }
      $('metricTotal').textContent = summary.total; $('metricPending').textContent = summary.pending; $('metricConfirmed').textContent = summary.confirmed; $('metricClients').textContent = summary.clients;
      renderRows(bookings.items); $('bookingPage').textContent = total ? `Page ${page} of ${Math.ceil(total / limit)} · ${total} enquiries` : 'No enquiries yet';
      $('adminWorkspace').hidden = false; $('adminLoginForm').hidden = true; $('adminLogout').hidden = false;
      notice('');
      if (typeof RoyAdminAnalytics !== 'undefined') RoyAdminAnalytics.refresh();
    } catch (err) {
      if (version !== loadVersion) return;
      notice(err.status === 401 ? 'Sign in to access your studio.' : err.status === 403 ? 'This account needs verified owner access. Sign in with the owner account.' : err.message, err.status !== 401);
      if (err.status === 401 || err.status === 403) { $('adminWorkspace').hidden = true; $('adminLoginForm').hidden = false; $('adminLogout').hidden = true; $('bookingRows').replaceChildren(); $('signupList').replaceChildren(); }
    } finally { if (version === loadVersion) { $('previousBookings').disabled = page <= 1; $('nextBookings').disabled = page * limit >= total; } }
  }
  $('adminLoginForm').addEventListener('submit', async event => {
    event.preventDefault(); const button = event.currentTarget.querySelector('button'); button.disabled = true;
    try { await RoyAPI.request('/api/login', { method: 'POST', body: JSON.stringify({ email: $('adminEmail').value.trim(), password: $('adminPassword').value }) }); $('adminPassword').value = ''; await refresh(); }
    catch (err) { notice(err.message, true); } finally { button.disabled = false; }
  });
  $('adminFilters').addEventListener('submit', event => { event.preventDefault(); page = 1; refresh(); });
  $('refreshBookings').addEventListener('click', () => refresh());
  $('previousBookings').addEventListener('click', () => { if (page > 1) { page--; refresh(); } });
  $('nextBookings').addEventListener('click', () => { if (page * limit < total) { page++; refresh(); } });
  $('adminLogout').addEventListener('click', async () => { try { await RoyAPI.request('/api/logout', { method: 'POST', body: '{}' }); location.reload(); } catch (err) { notice(err.message, true); } });
  $('exportBookings').addEventListener('click', async () => {
    try { const response = await fetch(APP_CONFIG.API_BASE + '/api/admin/export/bookings?' + query(), { credentials: 'include' }); if (!response.ok) throw new Error('Export failed. Please sign in and retry.'); const url = URL.createObjectURL(await response.blob()); const link = node('a'); link.href = url; link.download = 'roy-bookings.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); } catch (err) { notice(err.message, true); }
  });
  document.querySelector('.studio-clients').addEventListener('toggle', async event => {
    if (!event.target.open) return;
    try { const clients = await RoyAPI.request('/api/admin/signups'); $('signupList').replaceChildren(...clients.map(client => node('li', `${client.name || 'Client'} · ${client.email || ''}${client.phone ? ' · ' + client.phone : ''}`))); if (!clients.length) $('signupList').appendChild(node('li', 'No registered clients yet.')); } catch (err) { notice(err.message, true); }
  });
  refresh();
});

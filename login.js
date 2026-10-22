document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', async event => {
    event.preventDefault(); const button = form.querySelector('[type="submit"]'); button.disabled = true;
    try { await RoyAPI.request('/api/login', { method: 'POST', body: JSON.stringify({ email: document.getElementById('email').value.trim(), password: document.getElementById('password').value }) }); location.href = 'account.html'; }
    catch (err) { alert(err.message); } finally { button.disabled = false; }
  });
  document.getElementById('resendVerification').addEventListener('click', async event => {
    event.target.disabled = true;
    try { const result = await RoyAPI.request('/api/resend-confirmation', { method: 'POST', body: JSON.stringify({ email: document.getElementById('email').value.trim() }) }); alert(result.message); }
    catch (err) { alert(err.message); } finally { event.target.disabled = false; }
  });
});

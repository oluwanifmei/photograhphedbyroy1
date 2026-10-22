// Register accounts with the server.
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signupForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const entry = {
      id: 's_' + Date.now(),
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      createdAt: new Date().toISOString()
    };
    const password = document.getElementById('password').value;

    const API_BASE = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || (window.location.protocol === 'file:' ? 'http://localhost:3000' : '');

    // Try sending to backend API /api/register; fallback to localStorage if network fails
    fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: entry.name, email: entry.email, phone: entry.phone, password: password })
    })
      .then(res => {
        if (res.ok) return res.json();
        return res.json().then(err => Promise.reject(err));
      })
      .then((data) => {
        alert(data.message || 'Registered successfully.');
        window.location.href = 'login.html';
      })
      .catch((err) => {
        alert(err && err.error ? err.error : 'Unable to reach the server. Please try again.');
      });
  });
});

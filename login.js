document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const API_BASE = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || (window.location.protocol === 'file:' ? 'http://localhost:3000' : '');

    fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(r => r.ok ? r.json() : r.json().then(err => Promise.reject(err)))
      .then(data => {
        localStorage.setItem('token', data.token);
        alert('Logged in successfully');
        window.location.href = 'index.html';
      })
      .catch(err => {
        console.warn('Login server error or offline:', err);

        // If the server explicitly returned an error (e.g. invalid password, email not verified)
        if (err && err.error) {
          alert(err.error);
        } else {
          // Server is offline (NetworkError) -> Fallback to localStorage offline mode
          const signups = JSON.parse(localStorage.getItem('signups') || '[]');
          const userFound = signups.find(s => s.email.toLowerCase() === email.toLowerCase());

          if (userFound) {
            localStorage.setItem('token', 'mock_token_for_' + email);
            alert('Logged in successfully (Offline demo mode)');
            window.location.href = 'index.html';
          } else if (email === 'admin@example.com' && password === 'admin') {
            // Admin testing bypass
            localStorage.setItem('adminToken', 'mock_admin_token');
            alert('Logged in as Admin (Offline demo mode)');
            window.location.href = 'index.html';
          } else {
            alert('Login failed: Account not found. Please Sign Up first.');
          }
        }
      });
  });
});

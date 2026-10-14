// Admin demo: read signups and bookings from localStorage and render lists
document.addEventListener('DOMContentLoaded', () => {
  const signupList = document.getElementById('signupList');
  const bookingList = document.getElementById('bookingList');
  const loginBtn = document.getElementById('adminLogin');
  const adminEmail = document.getElementById('adminEmail');
  const adminPassword = document.getElementById('adminPassword');

  const API_BASE = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || (window.location.protocol === 'file:' ? 'http://localhost:3000' : '');

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const email = adminEmail.value.trim();
      const password = adminPassword.value;
      if (!email || !password) return alert('Email and password required');

      fetch(`${API_BASE}/api/login`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email, password }) 
      })
        .then(r => r.ok ? r.json() : r.json().then(err => Promise.reject(err)))
        .then(data => {
          localStorage.setItem('adminToken', data.token);
          alert('Logged in as admin');
          location.reload();
        }).catch(err => {
          console.warn('Admin login server error or offline:', err);
          
          if (err && err.error) {
            alert(err.error);
          } else {
            // Offline Admin authentication fallback
            if (email === 'admin@example.com' && password === 'admin') {
              localStorage.setItem('adminToken', 'mock_admin_token');
              alert('Logged in as Admin (Offline demo mode)');
              location.reload();
            } else {
              alert('Login failed: Invalid credentials.');
            }
          }
        });
    });
  }

  // Try fetching from backend, otherwise use localStorage fallback
  const token = localStorage.getItem('adminToken');
  if (token) {
    // If it's a mock token, skip server request and fall back directly
    if (token === 'mock_admin_token') {
      loadOfflineData();
    } else {
      Promise.all([
        fetch(`${API_BASE}/api/admin/signups`, { headers: { Authorization: 'Bearer ' + token } }).then(r => r.ok ? r.json() : Promise.reject()),
        fetch(`${API_BASE}/api/admin/bookings`, { headers: { Authorization: 'Bearer ' + token } }).then(r => r.ok ? r.json() : Promise.reject())
      ]).then(([signups, bookings]) => {
        renderLists(signups, bookings);
      }).catch(err => {
        console.warn('Failed to fetch admin lists from server, using local fallback:', err);
        loadOfflineData();
      });
    }
  } else {
    loadOfflineData();
  }

  function loadOfflineData() {
    const signups = JSON.parse(localStorage.getItem('signups') || '[]');
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    renderLists(signups, bookings);
  }

  function renderLists(signups, bookings) {
    if (!signupList || !bookingList) return;
    if (!signups || signups.length === 0) {
      signupList.innerHTML = '<li>No signups yet.</li>';
    } else {
      signupList.innerHTML = signups.map(s => `<li><strong>${s.name}</strong> — ${s.email} — ${s.phone || '—'} <small>(${new Date(s.createdAt).toLocaleString()})</small></li>`).join('');
    }

    if (!bookings || bookings.length === 0) {
      bookingList.innerHTML = '<li>No booking requests yet.</li>';
    } else {
      bookingList.innerHTML = bookings.map(b => `<li><strong>${b.name}</strong> — ${b.service} on ${b.date} ${b.time ? b.time : ''} — ${b.email} <small>(${b.status})</small></li>`).join('');
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login to view your account');
    window.location.href = 'login.html';
    return;
  }

  function authFetch(url, opts = {}) {
    const API_BASE = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || (window.location.protocol === 'file:' ? 'http://localhost:3000' : '');
    opts.headers = opts.headers || {};
    opts.headers['Authorization'] = 'Bearer ' + token;
    return fetch(API_BASE + url, opts)
      .then(r => r.ok ? r.json() : r.json().then(err => Promise.reject(err)));
  }

  const nameInput = document.getElementById('profileName');
  const phoneInput = document.getElementById('profilePhone');
  const passInput = document.getElementById('profilePassword');
  const saveBtn = document.getElementById('saveProfile');
  const bookingsList = document.getElementById('myBookingsList');

  const renderProfile = (data) => {
    if (nameInput) nameInput.value = data.name || '';
    if (phoneInput) phoneInput.value = data.phone || '';
    if (bookingsList) {
      if (data.bookings && data.bookings.length) {
        bookingsList.innerHTML = data.bookings.map(b => `<li>${b.service} — ${b.date} ${b.time || ''} — <strong>${b.status}</strong></li>`).join('');
      } else {
        bookingsList.innerHTML = '<li>No bookings yet.</li>';
      }
    }
  };

  const loadProfile = () => {
    authFetch('/api/me')
      .then(data => {
        renderProfile(data);
      })
      .catch(err => {
        console.warn('Profile load server error or offline:', err);
        
        // If in offline fallback mode
        if (token.startsWith('mock_token_for_')) {
          const email = token.replace('mock_token_for_', '');
          const signups = JSON.parse(localStorage.getItem('signups') || '[]');
          const user = signups.find(s => s.email.toLowerCase() === email.toLowerCase()) || { name: 'Demo User', phone: '' };
          
          const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
          const userBookings = allBookings.filter(b => b.email.toLowerCase() === email.toLowerCase());

          renderProfile({
            name: user.name,
            phone: user.phone,
            bookings: userBookings
          });
        } else {
          alert('Failed to load profile details.');
        }
      });
  };

  // Run load
  loadProfile();

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const payload = { name: nameInput.value.trim(), phone: phoneInput.value.trim() };
      if (passInput.value) payload.password = passInput.value;
      
      authFetch('/api/me', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      })
        .then(() => alert('Profile updated successfully'))
        .catch(err => {
          console.warn('Profile update server error or offline:', err);
          
          if (token.startsWith('mock_token_for_')) {
            const email = token.replace('mock_token_for_', '');
            const signups = JSON.parse(localStorage.getItem('signups') || '[]');
            const userIndex = signups.findIndex(s => s.email.toLowerCase() === email.toLowerCase());
            
            if (userIndex !== -1) {
              signups[userIndex].name = payload.name;
              signups[userIndex].phone = payload.phone;
              localStorage.setItem('signups', JSON.stringify(signups));
              alert('Profile updated locally (Offline demo mode)');
            } else {
              alert('Profile save failed: Local user record not found.');
            }
          } else {
            alert(err && err.error ? err.error : 'Update failed');
          }
        });
    });
  }
});

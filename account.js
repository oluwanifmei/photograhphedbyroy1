document.addEventListener('DOMContentLoaded', () => {
  function authFetch(url, options = {}) { return RoyAPI.request(url, options); }
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
        bookingsList.replaceChildren(...data.bookings.map(b => { const item = document.createElement('li'); item.textContent = `${b.service} — ${b.date} ${b.time || ''} — ${b.status}`; return item; }));
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
        
        if (err.status === 401) location.href = 'login.html'; else alert(err.message);
      });
  };

  // Run load
  loadProfile();

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const payload = { name: nameInput.value.trim(), phone: phoneInput.value.trim() };
      if (passInput.value) { payload.password = passInput.value; payload.currentPassword = document.getElementById('currentPassword').value; }
      
      authFetch('/api/me', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      })
        .then(() => { passInput.value = ''; document.getElementById('currentPassword').value = ''; alert('Profile updated successfully'); })
        .catch(err => {
          console.warn('Profile update server error or offline:', err);
          
          alert(err.message);
        });
    });
  }
});

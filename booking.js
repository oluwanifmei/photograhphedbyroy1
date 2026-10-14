// Multi-Channel Booking Logic (Express API, WhatsApp, Calendly)
document.addEventListener('DOMContentLoaded', () => {
  // Resolve App Config or defaults
  const config = window.APP_CONFIG || {
    API_BASE: window.location.protocol === 'file:' ? 'http://localhost:3000' : '',
    WHATSAPP_NUMBER: '2348000000000',
    CALENDLY_URL: 'https://calendly.com'
  };

  // --- Tab Switching Logic ---
  const tabButtons = document.querySelectorAll('.booking-tab-btn');
  const sections = document.querySelectorAll('.booking-section');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      tabButtons.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      btn.classList.add('active');
      const activeSection = document.getElementById(`booking-section-${targetTab}`);
      if (activeSection) {
        activeSection.classList.add('active');
      }

      // Initialize Calendly if switching to calendly tab
      if (targetTab === 'calendly') {
        initCalendlyWidget();
      }
    });
  });

  // --- WhatsApp Booking Handler ---
  const waBtn = document.getElementById('openWhatsAppBtn');
  if (waBtn) {
    waBtn.addEventListener('click', () => {
      const service = document.getElementById('wa-service')?.value || 'Photography Session';
      const date = document.getElementById('wa-date')?.value || 'flexible date';
      const notes = document.getElementById('wa-notes')?.value.trim() || 'None';

      const messageText = `Hello! I would like to book a photography session via your website.\n\n` +
                          `📸 *Service:* ${service}\n` +
                          `📅 *Preferred Date:* ${date}\n` +
                          `📝 *Notes/Location:* ${notes}\n\n` +
                          `Please let me know your availability and rates!`;

      const encodedText = encodeURIComponent(messageText);
      const cleanPhone = (config.WHATSAPP_NUMBER || '').replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

      window.open(waUrl, '_blank');
    });
  }

  // --- Calendly Embed Handler ---
  function initCalendlyWidget() {
    const widget = document.getElementById('calendlyWidget');
    if (!widget) return;
    
    const targetUrl = config.CALENDLY_URL || 'https://calendly.com';
    widget.setAttribute('data-url', targetUrl);

    // If Calendly SDK is loaded
    if (window.Calendly && typeof window.Calendly.initInlineWidget === 'function') {
      widget.innerHTML = ''; // clear loading placeholder
      window.Calendly.initInlineWidget({
        url: targetUrl,
        parentElement: widget
      });
    } else {
      // Fallback if script is slow to load or iframe direct load
      widget.innerHTML = `<iframe src="${targetUrl}" width="100%" height="650" frameborder="0"></iframe>`;
    }
  }

  // --- Express API Booking Form Submission ---
  const form = document.getElementById('bookingForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const entry = {
        id: 'b_' + Date.now(),
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        service: document.getElementById('service').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        message: document.getElementById('message').value.trim(),
        createdAt: new Date().toISOString(),
        status: 'pending'
      };
      
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = 'Bearer ' + token;

      const API_BASE = config.API_BASE;

      fetch(`${API_BASE}/api/booking`, {
        method: 'POST',
        headers,
        body: JSON.stringify(entry)
      }).then(res => {
        if (res.ok) return res.json();
        return res.json().then(err => Promise.reject(err));
      }).then(() => {
        alert('Booking request submitted successfully! The admin team will review and confirm.');
        window.location.href = 'index.html';
      }).catch(err => {
        console.warn('Booking server error or offline mode:', err);
        
        const existing = JSON.parse(localStorage.getItem('bookings') || '[]');
        existing.push(entry);
        localStorage.setItem('bookings', JSON.stringify(existing));
        alert('Booking saved locally (offline mode). Admin will review once connected.');
        window.location.href = 'index.html';
      });
    });
  }
});

// Multi-Channel Booking Logic (Express API, WhatsApp, Calendly)
document.addEventListener('DOMContentLoaded', () => {
  // Resolve App Config or defaults
  const config = window.APP_CONFIG || {
    API_BASE: window.location.protocol === 'file:' ? 'http://localhost:3000' : '',
    WHATSAPP_NUMBER: '2348000000000',
    CALENDLY_URL: 'https://calendly.com'
  };

  const form = document.getElementById('bookingForm');
  if (form) {
    const status = document.getElementById('bookingStatus');
    const notify = (message, kind) => { if (!status) return alert(message); status.hidden = false; status.textContent = message; status.dataset.state = kind; status.focus(); };
    let submitting = false;
    let previousBody = '';
    let requestKey = '';
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (submitting || !form.reportValidity()) return;
      const value = (...ids) => { const element = ids.map(id => document.getElementById(id)).find(Boolean); return element ? element.value.trim() : ''; };
      const entry = { name: value('name','clientName'), email: value('email','clientEmail'), phone: value('phone','clientPhone'), service: value('service','shootType'), date: value('date','shootDate'), time: value('time','shootTime'), message: value('message','shootMessage'), location: value('shootLocation'), priority: value('shootPriority') };
      if (config.STATIC_HOSTING && !config.RENDER_BACKEND_URL) {
        const details = ['Hello Roy, I would like to enquire about a photography session.', ...Object.entries(entry).filter(([, text]) => text).map(([label, text]) => `${label[0].toUpperCase() + label.slice(1)}: ${text}`)].join('\n');
        window.open('https://wa.me/' + config.WHATSAPP_NUMBER + '?text=' + encodeURIComponent(details), '_blank', 'noopener');
        notify('Continue in WhatsApp and press Send to share your enquiry with Roy. Your session is confirmed only after Roy agrees availability and the details with you. If WhatsApp did not open, use the Chat with Roy link beside this form.', 'info');
        return;
      }
      const body = JSON.stringify(entry);
      if (body !== previousBody) {
        requestKey = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        previousBody = body;
      }
      const button = form.querySelector('[type="submit"]');
      submitting = true;
      if (button) button.disabled = true;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      try {
        const headers = { 'Content-Type': 'application/json', 'Idempotency-Key': requestKey };
        const response = await fetch(config.API_BASE + '/api/booking', { method: 'POST', credentials: 'include', headers, body, signal: controller.signal });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.error || 'Unable to submit your booking.');
        notify('Request received' + (result.reference ? ' · Reference ' + result.reference.slice(-8).toUpperCase() : '') + '. Roy will review your details and contact you by email to confirm availability. Your session is not booked yet.', 'success');
        form.reset();
        previousBody = '';
      } catch (err) {
        notify(err.name === 'AbortError' ? 'The server took too long to reply. Your details are still here; retry this form or contact Roy on WhatsApp.' : (err instanceof TypeError ? 'We could not confirm receipt. Your details are still in the form. Please retry or contact Roy on WhatsApp.' : err.message), 'error');
      } finally {
        clearTimeout(timeout);
        submitting = false;
        if (button) button.disabled = false;
      }
    });
  }
});

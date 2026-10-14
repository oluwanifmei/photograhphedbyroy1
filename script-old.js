const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const themeToggle = document.getElementById('themeToggle');

const setTheme = theme => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  if (themeToggle) {
    themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
    themeToggle.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`);
  }
};

const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  setTheme(savedTheme || systemTheme);
};

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
  });
}

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    siteNav.classList.toggle('active');
    const expanded = siteNav.classList.contains('active');
    navToggle.setAttribute('aria-expanded', expanded);
  });
}

const galleryItems = document.querySelectorAll('.gallery-item img');
if (galleryItems.length) {
  galleryItems.forEach(img => {
    img.addEventListener('error', () => {
      img.src = 'images/placeholder.svg';
    });
  });
}

initializeTheme();

// Gallery Category Filter
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems2 = document.querySelectorAll('.gallery-item');

if (filterBtns.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.getAttribute('data-filter');
      galleryItems2.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.style.display = 'block';
          setTimeout(() => item.style.opacity = '1', 0);
        } else {
          item.style.opacity = '0';
          setTimeout(() => item.style.display = 'none', 300);
        }
      });
    });
  });
}

// Before & After Slider
const beforeAfterRange = document.getElementById('beforeAfterRange');
const beforeAfterSlider = document.getElementById('beforeAfterSlider');

if (beforeAfterRange && beforeAfterSlider) {
  const updateClip = () => {
    const value = beforeAfterRange.value;
    beforeAfterSlider.style.setProperty('--clip', value + '%');
  };

  beforeAfterRange.addEventListener('input', updateClip);
  beforeAfterRange.addEventListener('mousemove', updateClip);
  beforeAfterRange.addEventListener('touchmove', updateClip);
  
  updateClip();
}

// Booking Form
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('clientName').value;
    const email = document.getElementById('clientEmail').value;
    const phone = document.getElementById('clientPhone').value;
    const shootType = document.getElementById('shootType').value;
    const shootDate = document.getElementById('shootDate').value;
    const shootTime = document.getElementById('shootTime').value;
    const shootLocation = document.getElementById('shootLocation').value;
    const message = document.getElementById('shootMessage').value;
    
    // Create WhatsApp message
    const whatsappMessage = `Hello! I'd like to book a shoot.
Name: ${name}
Email: ${email}
Phone: ${phone}
Type: ${shootType}
Date: ${shootDate}
Time: ${shootTime}
Location: ${shootLocation}
Details: ${message}`;
    
    // WhatsApp API
    const whatsappNumber = '2349025803917'; // Replace with your number
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Show success message
    alert('Thank you for your booking request! You will be redirected to WhatsApp to confirm your details.');
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Reset form
    bookingForm.reset();
  });
}

// Intro overlay logic: show on first visit unless user chose not to.
(function introOverlay() {
  const overlay = document.getElementById('introOverlay');
  const closeBtn = document.getElementById('introClose');
  const dontShow = document.getElementById('dontShowIntro');
  const INTRO_KEY = 'introSeen_v1';

  const showOverlay = () => {
    if (!overlay) return;
    overlay.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
  };
  const hideOverlay = () => {
    if (!overlay) return;
    overlay.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
  };

  const seen = localStorage.getItem(INTRO_KEY);
  if (!seen) {
    window.setTimeout(showOverlay, 300);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (dontShow && dontShow.checked) {
        localStorage.setItem(INTRO_KEY, 'true');
      }
      hideOverlay();
    });
  }

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      const card = overlay.querySelector('.intro-overlay-card');
      if (e.target === overlay) {
        if (dontShow && dontShow.checked) {
          localStorage.setItem(INTRO_KEY, 'true');
        }
        hideOverlay();
      }
    });
  }
})();

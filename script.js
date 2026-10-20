const siteLoader = document.getElementById('siteLoader');
if (siteLoader) {
  setTimeout(() => {
    siteLoader.classList.add('is-hidden');
    document.body.classList.remove('is-loading');
  }, 10000);
}

// Page Navigation System
const navLinks = document.querySelectorAll('[data-page]');
const pages = document.querySelectorAll('.page');

const navigateTo = (pageName) => {
  pages.forEach(page => page.classList.remove('active'));
  const targetPage = document.getElementById(`page-${pageName}`);
  if (targetPage) {
    targetPage.classList.add('active');
    window.scrollTo(0, 0);
  }
};

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const pageName = link.getAttribute('data-page');
    navigateTo(pageName);

    // Close mobile menu
    const siteNav = document.querySelector('.site-nav');
    if (siteNav) {
      siteNav.classList.remove('active');
      navToggle?.setAttribute('aria-expanded', 'false');
      navToggle?.setAttribute('aria-label', 'Open navigation menu');
    }
  });
});

// Parallax Scrolling Effect for Hero Image
const heroImageSection = document.querySelector('.hero-image-section');
const heroImageWrapper = document.querySelector('.hero-image-wrapper');
const heroImage = document.querySelector('.hero-image');

if (heroImageSection && heroImage) {
  window.addEventListener('scroll', () => {
    const rect = heroImageSection.getBoundingClientRect();
    const scrolled = window.scrollY;
    const elementOffset = heroImageSection.offsetTop;

    // Only apply parallax when element is in view
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const yPos = (scrolled - elementOffset) * 0.5; // 0.5 creates the parallax effect
      heroImage.style.transform = `translateY(${yPos}px)`;
    }
  });
}


// Theme Toggle
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

// Mobile Menu Toggle
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    siteNav.classList.toggle('active');
    const expanded = siteNav.classList.contains('active');
    navToggle.setAttribute('aria-expanded', expanded);
    navToggle.setAttribute('aria-label', expanded ? 'Close navigation menu' : 'Open navigation menu');
  });
}

const bookingBanner = document.getElementById('bookingBanner');
const bookingBannerClose = document.getElementById('bookingBannerClose');

if (bookingBanner) {
  const bannerClosed = localStorage.getItem('bookingBannerClosed');
  if (bannerClosed === 'true') {
    bookingBanner.style.display = 'none';
  }
}

if (bookingBannerClose) {
  bookingBannerClose.addEventListener('click', () => {
    if (bookingBanner) {
      bookingBanner.style.opacity = '0';
      setTimeout(() => {
        bookingBanner.style.display = 'none';
      }, 240);
      localStorage.setItem('bookingBannerClosed', 'true');
    }
  });
}

const fadeOutBookingBanner = () => {
  if (bookingBanner && bookingBanner.style.display !== 'none') {
    bookingBanner.style.opacity = '0';
    setTimeout(() => {
      bookingBanner.style.display = 'none';
    }, 240);
  }
};

document.body.classList.add('is-loading');

window.addEventListener('load', () => {
  if (bookingBanner) {
    setTimeout(() => {
      if (!localStorage.getItem('bookingBannerClosed')) {
        fadeOutBookingBanner();
      }
    }, 60000);
  }
});

// Gallery build from uploaded image files
const galleryData = [
  { src: 'My%20webproject/0ff61bc8-b908-48e2-9805-997ead6a3aa6.jpg', category: 'nature', title: 'Golden Nature Moment', alt: 'Nature photography with warm light' },
  { src: 'My%20webproject/20df2db2-92d7-4fe5-ae27-695dbb760021.jpg', category: 'nature', title: 'Green Landscape', alt: 'Green nature scene' },
  { src: 'My%20webproject/3b50f7e8-478f-4715-980e-fa87bde9d865.jpg', category: 'nature', title: 'Sunlit Outdoors', alt: 'Sunlit nature photo' },
  { src: 'My%20webproject/612c3b16-c058-4afd-ad41-897eeace0c0f.JPG', category: 'portraits', title: 'Portrait Session', alt: 'Studio portrait photograph' },
  { src: 'My%20webproject/93f6acf3-2871-4741-8d83-3a9926412819.jpg', category: 'portraits', title: 'Elegant Portrait', alt: 'Portrait photograph with soft lighting' },
  { src: 'My%20webproject/A80205CA-D241-47B4-9E25-B251FCF7A930.jpg', category: 'portraits', title: 'Artistic Portrait', alt: 'Creative portrait photo' },
  { src: 'My%20webproject/bda07e92-4a8e-4625-b959-8456758880d6.jpg', category: 'portraits', title: 'Fine Art Portrait', alt: 'Contemporary portrait photography' },
  { src: 'My%20webproject/C91E4D5E-6317-4AA4-A488-52519999466A_0D74C73E-1919-4D69-A590-583913595ABC.jpg', category: 'portraits', title: 'Portrait Emotion', alt: 'Emotive portrait image' },
  { src: 'My%20webproject/daf0821f-de15-413b-b5e6-5dc978b3852a.jpg', category: 'portraits', title: 'Styled Portrait', alt: 'Portrait with polished styling' },
  { src: 'My%20webproject/e52f00a6-d8f1-4182-af9c-890aadd79474.JPG', category: 'fashion', title: 'Fashion Editorial', alt: 'Fashion photography editorial image' },
  { src: 'My%20webproject/f498784a-3e3a-4d4b-896e-f04370e4db46.jpg', category: 'fashion', title: 'Runway Style', alt: 'Fashion shoot image' },
  { src: 'My%20webproject/IMG_003816_0.jpg', category: 'fashion', title: 'Style Portrait', alt: 'Fashion portrait photo' },
  { src: 'My%20webproject/IMG_0931.JPG', category: 'portraits', title: 'Editorial Portrait', alt: 'Portrait image with editorial styling' },
  { src: 'My%20webproject/IMG_190502_0.jpg', category: 'street', title: 'City Moments', alt: 'Street photography with city lights' },
  { src: 'My%20webproject/IMG_2160.jpg', category: 'weddings', title: 'Wedding Details', alt: 'Wedding ceremony detail photo' },
  { src: 'My%20webproject/IMG_2170.JPG', category: 'weddings', title: 'Wedding Portrait', alt: 'Couple wedding portrait' },
  { src: 'My%20webproject/IMG_2171.JPG', category: 'weddings', title: 'Wedding Celebration', alt: 'Wedding celebration photography' },
  { src: 'My%20webproject/IMG_2330.jpg', category: 'weddings', title: 'Ceremony Moment', alt: 'Wedding ceremony photograph' },
  { src: 'My%20webproject/IMG_2346.JPG', category: 'weddings', title: 'Wedding Details', alt: 'Close-up wedding detail photo' },
  { src: 'My%20webproject/IMG_2389.jpg', category: 'weddings', title: 'Couple Portrait', alt: 'Wedding couple portrait' },
  { src: 'My%20webproject/IMG_2768.jpg', category: 'events', title: 'Event Energy', alt: 'Live event photography' },
  { src: 'My%20webproject/IMG_2770.jpg', category: 'events', title: 'Celebration Lights', alt: 'Event coverage shot' },
  { src: 'My%20webproject/IMG_3130.JPG', category: 'events', title: 'Event Portrait', alt: 'Portrait at an event' },
  { src: 'My%20webproject/IMG_3658.jpg', category: 'events', title: 'Party Mood', alt: 'Party photography' },
  { src: 'My%20webproject/IMG_3664.JPG', category: 'events', title: 'Ceremony Moment', alt: 'Event photography ceremony image' },
  { src: 'My%20webproject/IMG_3668.jpg', category: 'events', title: 'Live Music Event', alt: 'Music event photograph' },
  { src: 'My%20webproject/IMG_3671.jpg', category: 'events', title: 'Crowd Scene', alt: 'Event crowd photo' },
  { src: 'My%20webproject/IMG_3685.jpg', category: 'events', title: 'Stage View', alt: 'Stage event photograph' },
  { src: 'My%20webproject/IMG_3746%281%29.jpg', category: 'birthday', title: 'Birthday Moments', alt: 'Birthday celebration photograph' },
  { src: 'My%20webproject/IMG_3746.jpg', category: 'birthday', title: 'Cake Celebration', alt: 'Birthday cake and celebration photo' },
  { src: 'My%20webproject/IMG_3769.JPG', category: 'birthday', title: 'Birthday Portrait', alt: 'Portrait at a birthday event' },
  { src: 'My%20webproject/IMG_4588.JPG', category: 'street', title: 'Street Style', alt: 'Urban street fashion photo' },
  { src: 'My%20webproject/IMG_4662.JPG', category: 'street', title: 'City Portrait', alt: 'Street portrait photography' },
  { src: 'My%20webproject/IMG_4663.JPG', category: 'street', title: 'Night Street', alt: 'Night street photography' },
  { src: 'My%20webproject/IMG_4665.JPG', category: 'street', title: 'Street Walk', alt: 'Street scene image' },
  { src: 'My%20webproject/IMG_4670.JPG', category: 'street', title: 'Urban Detail', alt: 'Urban street detail photo' },
  { src: 'My%20webproject/IMG_5039.JPG', category: 'portraits', title: 'Moody Portrait', alt: 'Moody portrait photograph' },
  { src: 'My%20webproject/IMG_5150.JPG', category: 'portraits', title: 'Studio Portrait', alt: 'Studio portrait image' },
  { src: 'My%20webproject/IMG_5152.JPG', category: 'portraits', title: 'Natural Portrait', alt: 'Portrait photo with natural light' },
  { src: 'My%20webproject/IMG_5154.jpg', category: 'portraits', title: 'Portrait Story', alt: 'Portrait storytelling image' },
  { src: 'My%20webproject/IMG_5179.JPG', category: 'portraits', title: 'Portrait Expression', alt: 'Portrait with expressive styling' },
  { src: 'My%20webproject/IMG_5498.jpg', category: 'portraits', title: 'Lifestyle Portrait', alt: 'Lifestyle portrait photography' },
  { src: 'My%20webproject/IMG_9124.jpg', category: 'fashion', title: 'Fashion Detail', alt: 'Fashion photography detail' },
  { src: 'My%20webproject/IMG_9171.JPG', category: 'fashion', title: 'Editorial Fashion', alt: 'Editorial fashion photo' },
  { src: 'My%20webproject/IMG_9396.JPG', category: 'fashion', title: 'Fashion Portrait', alt: 'Fashion portrait image' },
  { src: 'My%20webproject/IMG_9423.JPG', category: 'fashion', title: 'Runway Portrait', alt: 'Runway-style fashion photograph' },
  { src: 'My%20webproject/IMG_9428.JPG', category: 'fashion', title: 'Style Story', alt: 'Creative fashion photography' },
  { src: 'My%20webproject/IMG_9596.jpg', category: 'portraits', title: 'Editorial Portrait', alt: 'Editorial style portrait' },
  { src: 'My%20webproject/IMG_9665.jpg', category: 'portraits', title: 'Evening Portrait', alt: 'Portrait in evening light' },
  { src: 'My%20webproject/temp_image_115334A8-3116-43C3-A723-34DEE48E4644.webp', category: 'nature', title: 'Nature Texture', alt: 'Nature texture photo' },
];

const galleryGrid = document.getElementById('galleryGrid');
const buildGalleryGrid = () => {
  if (!galleryGrid) return;
  galleryGrid.innerHTML = galleryData.map(image => `
    <article class="gallery-item" data-category="${image.category}">
      <img src="${image.src}" alt="${image.alt}" loading="lazy" />
      <div class="gallery-overlay">
        <p>${image.title}</p>
      </div>
    </article>
  `).join('');
};

buildGalleryGrid();

// Gallery Filter
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = () => document.querySelectorAll('.gallery-item');

if (filterBtns.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      galleryItems().forEach(item => {
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
    beforeAfterSlider.style.setProperty('--clip', `${beforeAfterRange.value}%`);
  };

  beforeAfterRange.addEventListener('input', updateClip);
  updateClip();
}

// Booking Form
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('clientName').value;
    const email = document.getElementById('clientEmail').value;
    const phone = document.getElementById('clientPhone').value;
    const shootType = document.getElementById('shootType').value;
    const shootDate = document.getElementById('shootDate').value;
    const shootTime = document.getElementById('shootTime').value;
    const shootLocation = document.getElementById('shootLocation').value;
    const message = document.getElementById('shootMessage').value;

    const whatsappMessage = `Hello! I'd like to book a shoot.
Name: ${name}
Email: ${email}
Phone: ${phone}
Type: ${shootType}
Date: ${shootDate}
Time: ${shootTime}
Location: ${shootLocation}
Details: ${message}`;

    const whatsappNumber = '2349025803917';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    alert('Thank you for your booking request! You will be redirected to WhatsApp to confirm your details.');
    window.open(whatsappUrl, '_blank');

    bookingForm.reset();
  });
}

// Contact Form
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;

    const mailtoLink = `mailto:nifemiayoola3@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;
    window.location.href = mailtoLink;

    contactForm.reset();
  });
}

// Intro Overlay
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
    window.setTimeout(() => {
      if (overlay && overlay.getAttribute('aria-hidden') === 'false') {
        hideOverlay();
      }
    }, 1800);
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
      if (e.target === overlay) {
        if (dontShow && dontShow.checked) {
          localStorage.setItem(INTRO_KEY, 'true');
        }
        hideOverlay();
      }
    });
  }
})();

// Image Error Handling
const allImages = document.querySelectorAll('img');
allImages.forEach(img => {
  img.addEventListener('error', () => {
    img.src = 'images/placeholder.svg';
  });
});

// Initialize Theme
initializeTheme();

// Set Home as default page on load
window.addEventListener('load', () => {
  const currentPage = document.querySelector('.page.active');
  if (!currentPage) {
    navigateTo('home');
  }
});

const faqItems = document.querySelectorAll('.faq-item');
if (faqItems.length) {
  faqItems.forEach((faq) => {
    const button = faq.querySelector('.faq-question');
    button.addEventListener('click', () => {
      faq.classList.toggle('open');
      const toggle = faq.querySelector('.faq-toggle');
      if (faq.classList.contains('open')) {
        toggle.textContent = '−';
      } else {
        toggle.textContent = '+';
      }
    });
  });
}

// ============ CHATBOT SYSTEM ============

const CHAT_STORAGE_KEY = 'royPhotographyChat';
const CONVERSATIONS_KEY = 'royPhotographyChatConversations';

const chatData = {
  toggle: document.getElementById('chatbotToggle'),
  window: document.getElementById('chatWindow'),
  close: document.getElementById('chatClose'),
  input: document.getElementById('chatInput'),
  send: document.getElementById('chatSend'),
  messages: document.getElementById('chatMessages'),
  quickReplies: document.getElementById('quickReplies'),
  unreadBadge: document.getElementById('unreadBadge'),
};

const adminData = {
  panel: document.getElementById('adminPanel'),
  close: document.getElementById('adminClose'),
  exportBtn: document.getElementById('exportMessages'),
  clearBtn: document.getElementById('clearMessages'),
  messagesList: document.getElementById('adminMessages'),
  totalMessages: document.getElementById('totalMessages'),
  totalVisitors: document.getElementById('totalVisitors'),
};

const botResponses = {
  greeting: [
    "Hi! I'm Roy's virtual assistant. How can I help you today?",
    "Welcome! What would you like to know about Roy's photography services?"
  ],
  booking: [
    "Great! I'd love to help you book a photoshoot. Please provide your preferred date, time, and shoot type. A team member will confirm with you shortly.",
    "Awesome! Let me know more details: What type of shoot are you interested in? Portrait, Wedding, Event, or something custom?"
  ],
  services: [
    "Roy offers:\n📸 Portrait Sessions (₦50,000)\n💒 Wedding Photography (₦200,000+)\n🎉 Event Coverage (₦75,000)\n👗 Fashion Shoots (₦80,000)\n🎂 Birthday Sessions (₦45,000)\n🎓 Graduation Photos (₦35,000)\n\nWould you like more details on any service?",
    "Check out the Services page for detailed information about all packages and pricing!"
  ],
  pricing: [
    "Here's the pricing:\n• Portrait: ₦50,000\n• Weddings: ₦200,000+\n• Events: ₦75,000\n• Fashion: ₦80,000\n• Birthday: ₦45,000\n• Graduation: ₦35,000\n\nCustom packages available! Contact Roy for special requests."
  ],
  portfolio: [
    "You can view Roy's portfolio in the Gallery section! Check out work across different categories like Weddings, Portraits, Fashion, Events, and more.",
    "Head to the Gallery page to see Roy's best work across all categories!"
  ],
  default: [
    "Thanks for reaching out! Roy will get back to you as soon as possible. Your message has been saved.",
    "Got it! Your inquiry has been recorded. Roy typically responds within 24 hours.",
    "I'll pass your message to Roy. Is there anything else you'd like to know?"
  ]
};

// Get or create visitor ID
function getVisitorId() {
  let id = localStorage.getItem('visitorId');
  if (!id) {
    id = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('visitorId', id);
  }
  return id;
}

// Save message
function saveMessage(userMessage, botReply) {
  const visitorId = getVisitorId();
  let conversations = JSON.parse(localStorage.getItem(CONVERSATIONS_KEY)) || {};

  if (!conversations[visitorId]) {
    conversations[visitorId] = {
      id: visitorId,
      startTime: new Date().toISOString(),
      messages: []
    };
  }

  conversations[visitorId].messages.push({
    user: userMessage,
    bot: botReply,
    timestamp: new Date().toISOString()
  });

  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  updateAdminStats();
}

// Display message in chat
function displayMessage(content, type) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${type}`;
  messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
  chatData.messages.appendChild(messageDiv);
  chatData.messages.scrollTop = chatData.messages.scrollHeight;
}

// Get bot response
function getBotResponse(userMessage) {
  const msg = userMessage.toLowerCase();

  if (msg.includes('book') || msg.includes('shoot')) {
    return botResponses.booking[Math.floor(Math.random() * botResponses.booking.length)];
  } else if (msg.includes('service')) {
    return botResponses.services[Math.floor(Math.random() * botResponses.services.length)];
  } else if (msg.includes('price') || msg.includes('cost')) {
    return botResponses.pricing[0];
  } else if (msg.includes('portfolio') || msg.includes('work') || msg.includes('gallery')) {
    return botResponses.portfolio[Math.floor(Math.random() * botResponses.portfolio.length)];
  } else {
    return botResponses.default[Math.floor(Math.random() * botResponses.default.length)];
  }
}

// Send message
function sendMessage() {
  const userMessage = chatData.input.value.trim();
  if (!userMessage) return;

  displayMessage(userMessage, 'user');
  chatData.input.value = '';

  const botReply = getBotResponse(userMessage);
  setTimeout(() => {
    displayMessage(botReply, 'bot');
    saveMessage(userMessage, botReply);

    if (chatData.quickReplies.style.display !== 'none') {
      chatData.quickReplies.style.display = 'none';
    }
  }, 500);
}

// Toggle chat window
chatData.toggle.addEventListener('click', () => {
  chatData.window.classList.toggle('active');
  if (chatData.window.classList.contains('active')) {
    chatData.input.focus();
    chatData.unreadBadge.style.display = 'none';
  }
});

chatData.close.addEventListener('click', () => {
  chatData.window.classList.remove('active');
});

// Send message on button click
chatData.send.addEventListener('click', sendMessage);

// Send message on Enter key
chatData.input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// Quick replies
document.querySelectorAll('.quick-reply').forEach(btn => {
  btn.addEventListener('click', () => {
    const reply = btn.getAttribute('data-reply');
    chatData.input.value = reply;
    sendMessage();
  });
});

// Admin Panel Toggle (Ctrl+Shift+A)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    e.preventDefault();
    adminData.panel.classList.toggle('active');
    if (adminData.panel.classList.contains('active')) {
      loadAdminMessages();
    }
  }
});

adminData.close.addEventListener('click', () => {
  adminData.panel.classList.remove('active');
});

// Close admin panel when clicking outside
adminData.panel.addEventListener('click', (e) => {
  if (e.target === adminData.panel) {
    adminData.panel.classList.remove('active');
  }
});

// Load messages in admin panel
function loadAdminMessages() {
  const conversations = JSON.parse(localStorage.getItem(CONVERSATIONS_KEY)) || {};
  adminData.messagesList.innerHTML = '';

  let totalMsgs = 0;
  Object.values(conversations).forEach(conv => {
    conv.messages.forEach(msg => {
      totalMsgs++;
      const msgDiv = document.createElement('div');
      msgDiv.className = 'admin-message';
      const date = new Date(msg.timestamp).toLocaleString();
      msgDiv.innerHTML = `
        <div class="admin-message-time">${date}</div>
        <div class="admin-message-user">📨 Customer: ${msg.user}</div>
        <div class="admin-message-text"><strong>Response:</strong> ${msg.bot}</div>
      `;
      adminData.messagesList.appendChild(msgDiv);
    });
  });

  adminData.totalMessages.textContent = totalMsgs;
  adminData.totalVisitors.textContent = Object.keys(conversations).length;
}

// Update admin stats
function updateAdminStats() {
  const conversations = JSON.parse(localStorage.getItem(CONVERSATIONS_KEY)) || {};
  adminData.totalVisitors.textContent = Object.keys(conversations).length;

  let total = 0;
  Object.values(conversations).forEach(conv => {
    total += conv.messages.length;
  });
  adminData.totalMessages.textContent = total;
}

// Export messages
adminData.exportBtn.addEventListener('click', () => {
  const conversations = JSON.parse(localStorage.getItem(CONVERSATIONS_KEY)) || {};
  const csv = convertToCSV(conversations);
  downloadCSV(csv, 'photography-chat-messages.csv');
});

function convertToCSV(conversations) {
  let csv = 'Visitor ID,Date/Time,Customer Message,Response\n';

  Object.values(conversations).forEach(conv => {
    conv.messages.forEach(msg => {
      const date = new Date(msg.timestamp).toLocaleString();
      csv += `"${conv.id}","${date}","${msg.user.replace(/"/g, '""')}","${msg.bot.replace(/"/g, '""')}"\n`;
    });
  });

  return csv;
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// Clear all messages
adminData.clearBtn.addEventListener('click', () => {
  if (confirm('Are you sure? This cannot be undone!')) {
    localStorage.removeItem(CONVERSATIONS_KEY);
    loadAdminMessages();
    alert('All chat messages have been deleted.');
  }
});

// Simulate unread badge (shows after 5 minutes of inactivity)
setInterval(() => {
  if (!chatData.window.classList.contains('active')) {
    const conversations = JSON.parse(localStorage.getItem(CONVERSATIONS_KEY)) || {};
    const totalMsgs = Object.values(conversations).reduce((sum, conv) => sum + conv.messages.length, 0);
    if (totalMsgs > 0) {
      chatData.unreadBadge.style.display = 'flex';
    }
  }
}, 300000);

// Initialize admin stats on load
updateAdminStats();

// ============ ACCOUNT DROPDOWN SYSTEM ============
const accountBtn = document.getElementById('accountBtn');
const accountMenu = document.getElementById('accountMenu');
const accountDropdown = document.getElementById('accountDropdown');

// Toggle dropdown menu
if (accountBtn && accountMenu) {
  accountBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = accountBtn.getAttribute('aria-expanded') === 'true';
    accountBtn.setAttribute('aria-expanded', !isExpanded);
    accountMenu.classList.toggle('active');
    accountMenu.setAttribute('aria-hidden', isExpanded);
  });
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (accountDropdown && accountMenu && accountBtn) {
    if (!accountDropdown.contains(e.target)) {
      accountMenu.classList.remove('active');
      accountBtn.setAttribute('aria-expanded', 'false');
      accountMenu.setAttribute('aria-hidden', 'true');
    }
  }
});

// Render dropdown items based on auth state
const updateAccountDropdown = () => {
  if (!accountMenu) return;

  const token = localStorage.getItem('token');
  const adminToken = localStorage.getItem('adminToken');
  let menuHtml = '';

  if (token) {
    // Logged in user
    menuHtml += `
      <div class="account-menu-header">Logged In</div>
      <div class="account-menu-divider"></div>
      <a href="account.html" class="account-menu-item">Dashboard</a>
    `;

    // Admin link if admin token also exists
    if (adminToken) {
      menuHtml += `<a href="admin.html" class="account-menu-item">Admin Panel</a>`;
    }

    menuHtml += `
      <div class="account-menu-divider"></div>
      <button class="account-menu-item" id="logoutBtn">Log Out</button>
    `;
  } else if (adminToken) {
    // Only Admin is logged in
    menuHtml += `
      <div class="account-menu-header">Admin Access</div>
      <div class="account-menu-divider"></div>
      <a href="admin.html" class="account-menu-item">Admin Panel</a>
      <div class="account-menu-divider"></div>
      <button class="account-menu-item" id="logoutAdminBtn">Log Out Admin</button>
    `;
  } else {
    // Guest
    menuHtml += `
      <div class="account-menu-header">Guest</div>
      <div class="account-menu-divider"></div>
      <a href="login.html" class="account-menu-item">Login</a>
      <a href="signup.html" class="account-menu-item">Sign Up</a>
    `;
  }

  accountMenu.innerHTML = menuHtml;

  // Add event listeners for dynamic buttons
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      alert('Logged out successfully');
      location.reload();
    });
  }

  const logoutAdminBtn = document.getElementById('logoutAdminBtn');
  if (logoutAdminBtn) {
    logoutAdminBtn.addEventListener('click', () => {
      localStorage.removeItem('adminToken');
      alert('Admin logged out');
      location.reload();
    });
  }
};

// Run on load
document.addEventListener('DOMContentLoaded', updateAccountDropdown);
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  updateAccountDropdown();
}


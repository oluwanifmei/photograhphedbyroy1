// Direct page routes work with or without JavaScript.
document.addEventListener('DOMContentLoaded', () => {
 const requested = location.hash.slice(1);
 const initial = document.getElementById('page-' + requested) ? requested : document.body.dataset.initialPage || 'home';
 document.querySelectorAll('.page').forEach(page => page.classList.toggle('active', page.id === 'page-' + initial));
 document.querySelectorAll('.site-nav [data-page]').forEach(link => { if (link.dataset.page === initial) link.setAttribute('aria-current','page'); });
 const selected = new URLSearchParams(location.search).get('package');
 if (selected) document.getElementById('shootType').value = selected;
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') { document.querySelector('.site-nav')?.classList.remove('active'); document.querySelector('.nav-toggle')?.setAttribute('aria-expanded','false'); } });

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
  {
    "src": "IMG_8510.JPG.jpeg",
    "category": "portraits",
    "title": "Garden in blue",
    "alt": "Woman in a light blue outfit standing in a green garden"
  },
  {
    "src": "IMG_7125.JPG.jpeg",
    "category": "fashion",
    "title": "An everyday kind of confidence",
    "alt": "Man in a dark shirt and burgundy trousers photographed outdoors"
  },
  {
    "src": "IMG_7474.JPG.jpeg",
    "category": "portraits",
    "title": "In your own light",
    "alt": "Woman wearing glasses seated beside a window"
  },
  {
    "src": "DARA.jpeg",
    "category": "portraits",
    "title": "Sunshine in the city",
    "alt": "Woman in glasses and a yellow blouse photographed outdoors"
  },
  {
    "src": "My%20webproject/IMG_1094.jpg",
    "category": "events",
    "title": "In the spotlight",
    "alt": "Saxophonist performing under purple concert lighting"
  },
  {
    "src": "My%20webproject/joshb.JPG",
    "category": "portraits",
    "title": "Green room",
    "alt": "Woman with orange hair seated beside a green hedge"
  },
  {
    "src": "My%20webproject/bda07e92-4a8e-4625-b959-8456758880d6.jpg",
    "category": "fashion",
    "title": "In good company",
    "alt": "Two people in coordinated black and white outfits on outdoor steps"
  },
  {
    "src": "My%20webproject/IMG_5498.jpg",
    "category": "portraits",
    "title": "A softer shade",
    "alt": "Woman in a blue dress against a dark blue studio background"
  },
  {
    "src": "My%20webproject/IMG_4662.JPG",
    "category": "street",
    "title": "City pace",
    "alt": "Man in a dark outfit photographed on a busy city street"
  },
  {
    "src": "ABOUT%20ROY.jpeg",
    "category": "portraits",
    "title": "Through the trees",
    "alt": "Portrait of Roy in a white shirt beneath trees"
  },
  {
    "src": "IMG_7127.JPG.jpeg",
    "category": "fashion",
    "title": "The finishing touch",
    "alt": "Man adjusting his collar during an outdoor fashion portrait"
  },
  {
    "src": "IMG_9571.JPG.jpeg",
    "category": "fashion",
    "title": "Quiet confidence",
    "alt": "Black and white full-length portrait of a man in a suit"
  },
  {
    "src": "My%20webproject/0ff61bc8-b908-48e2-9805-997ead6a3aa6.jpg",
    "category": "portraits",
    "title": "Off the court",
    "alt": "Young man in a check shirt photographed on a basketball court"
  },
  {
    "src": "My%20webproject/20df2db2-92d7-4fe5-ae27-695dbb760021.jpg",
    "category": "portraits",
    "title": "Everyday stories",
    "alt": "Smiling woman in glasses holding a packaged product"
  },
  {
    "src": "My%20webproject/93f6acf3-2871-4741-8d83-3a9926412819.jpg",
    "category": "details",
    "title": "Tools of the trade",
    "alt": "Close-up photograph of a Canon camera and lens"
  },
  {
    "src": "My%20webproject/A80205CA-D241-47B4-9E25-B251FCF7A930.jpg",
    "category": "portraits",
    "title": "A quiet moment",
    "alt": "Black and white portrait of a man looking down"
  },
  {
    "src": "My%20webproject/C91E4D5E-6317-4AA4-A488-52519999466A_0D74C73E-1919-4D69-A590-583913595ABC.jpg",
    "category": "portraits",
    "title": "Warm tones",
    "alt": "Closer portrait of a woman wearing glasses and a yellow blouse"
  },
  {
    "src": "My%20webproject/daf0821f-de15-413b-b5e6-5dc978b3852a.jpg",
    "category": "portraits",
    "title": "Between the lines",
    "alt": "Young man in a check shirt standing on an outdoor court"
  },
  {
    "src": "My%20webproject/e52f00a6-d8f1-4182-af9c-890aadd79474.JPG",
    "category": "fashion",
    "title": "On the steps",
    "alt": "Two people in black and white outfits posing beside brick steps"
  },
  {
    "src": "My%20webproject/IMG_003816_0.jpg",
    "category": "portraits",
    "title": "A study in pink",
    "alt": "Woman in a pink outfit against a purple studio background"
  },
  {
    "src": "My%20webproject/IMG_0931.JPG",
    "category": "portraits",
    "title": "Stillness",
    "alt": "Black and white seated portrait of a young man"
  },
  {
    "src": "My%20webproject/IMG_1120.jpg",
    "category": "events",
    "title": "Live on stage",
    "alt": "Musician holding a saxophone on a concert stage"
  },
  {
    "src": "My%20webproject/IMG_1130.jpg",
    "category": "events",
    "title": "After dark",
    "alt": "Live performance under purple stage lights"
  },
  {
    "src": "My%20webproject/IMG_190502_0.jpg",
    "category": "portraits",
    "title": "Poise in pink",
    "alt": "Studio portrait of a woman in pink with her hands folded"
  },
  {
    "src": "My%20webproject/IMG_2160.jpg",
    "category": "portraits",
    "title": "Afternoon light",
    "alt": "Woman in a patterned green dress photographed outdoors"
  },
  {
    "src": "My%20webproject/IMG_2170.JPG",
    "category": "portraits",
    "title": "Looking ahead",
    "alt": "Woman in a patterned green dress standing beside a building"
  },
  {
    "src": "My%20webproject/IMG_2171.JPG",
    "category": "portraits",
    "title": "A moment to pause",
    "alt": "Woman in a patterned green dress seated on a veranda"
  },
  {
    "src": "My%20webproject/IMG_2330.jpg",
    "category": "portraits",
    "title": "Soft light",
    "alt": "Outdoor portrait of a woman in a white off-shoulder blouse"
  },
  {
    "src": "My%20webproject/IMG_2346.JPG",
    "category": "portraits",
    "title": "A new chapter",
    "alt": "Studio portrait of a boy in a school uniform"
  },
  {
    "src": "My%20webproject/IMG_2389.jpg",
    "category": "details",
    "title": "Small victories",
    "alt": "Close-up photograph of a hand holding a trophy"
  },
  {
    "src": "My%20webproject/IMG_2768.jpg",
    "category": "details",
    "title": "Behind the frame",
    "alt": "Camera operator filming outdoors with a handheld stabiliser"
  },
  {
    "src": "My%20webproject/IMG_3130.JPG",
    "category": "fashion",
    "title": "Suited",
    "alt": "Full-length studio portrait of a man in a navy suit and hat"
  },
  {
    "src": "My%20webproject/IMG_3658.jpg",
    "category": "portraits",
    "title": "Seeing red",
    "alt": "Woman in red seated on a chair outdoors"
  },
  {
    "src": "My%20webproject/IMG_3664.JPG",
    "category": "portraits",
    "title": "Under the palms",
    "alt": "Woman in a black top and purple skirt standing outdoors"
  },
  {
    "src": "My%20webproject/IMG_3668.jpg",
    "category": "fashion",
    "title": "In the green",
    "alt": "Woman in a black top and patterned trousers seated on grass with a bag"
  },
  {
    "src": "My%20webproject/IMG_3671.jpg",
    "category": "fashion",
    "title": "A closer look",
    "alt": "Fashion portrait of a woman in black and patterned trousers seated outdoors"
  },
  {
    "src": "My%20webproject/IMG_3685.jpg",
    "category": "portraits",
    "title": "Room to breathe",
    "alt": "Full-length outdoor portrait of a woman in a black top and purple skirt"
  },
  {
    "src": "My%20webproject/IMG_3746(1).jpg",
    "category": "portraits",
    "title": "Among the green",
    "alt": "Woman in a green dress seated on a lawn"
  },
  {
    "src": "My%20webproject/IMG_3769.JPG",
    "category": "fashion",
    "title": "In motion",
    "alt": "Full-length fashion portrait of a woman carrying a patterned bag"
  },
  {
    "src": "My%20webproject/IMG_4359.jpg",
    "category": "portraits",
    "title": "At ease",
    "alt": "Casual indoor portrait of a young man wearing sunglasses"
  },
  {
    "src": "My%20webproject/IMG_4588.JPG",
    "category": "portraits",
    "title": "Window light",
    "alt": "Black and white portrait of a young man in glasses beside a window"
  },
  {
    "src": "My%20webproject/IMG_4663.JPG",
    "category": "street",
    "title": "A little company",
    "alt": "Man carrying a teddy bear beside a busy city road"
  },
  {
    "src": "My%20webproject/IMG_4665.JPG",
    "category": "street",
    "title": "Across the city",
    "alt": "Man in a dark outfit standing at a city crossing"
  },
  {
    "src": "My%20webproject/IMG_4670.JPG",
    "category": "street",
    "title": "Waiting here",
    "alt": "Man in glasses holding a teddy bear beside a roadside sign"
  },
  {
    "src": "My%20webproject/IMG_5150.JPG",
    "category": "street",
    "title": "Looking up",
    "alt": "Man in a cap looking at a phone outdoors"
  },
  {
    "src": "My%20webproject/IMG_5152.JPG",
    "category": "street",
    "title": "Working light",
    "alt": "Man wearing a reflective vest beside a construction site"
  },
  {
    "src": "My%20webproject/IMG_5154.jpg",
    "category": "street",
    "title": "Between places",
    "alt": "Full-length portrait of a man in a reflective vest outdoors"
  },
  {
    "src": "My%20webproject/IMG_5179.JPG",
    "category": "street",
    "title": "A new angle",
    "alt": "Man leaning back with a phone in an outdoor street scene"
  },
  {
    "src": "My%20webproject/IMG_5513(1).jpg",
    "category": "portraits",
    "title": "A seat in the sun",
    "alt": "Woman in glasses and a peach outfit seated on a wicker chair"
  },
  {
    "src": "My%20webproject/IMG_9124.jpg",
    "category": "fashion",
    "title": "A quiet silhouette",
    "alt": "Black and white full-length portrait of a woman in a flowing white dress"
  },
  {
    "src": "My%20webproject/IMG_9171.JPG",
    "category": "portraits",
    "title": "In black and white",
    "alt": "Black and white close-up portrait of a woman with braids"
  },
  {
    "src": "My%20webproject/IMG_9396.JPG",
    "category": "fashion",
    "title": "After hours",
    "alt": "Man wearing sunglasses and a pale shirt seated in a dark interior"
  },
  {
    "src": "My%20webproject/IMG_9423.JPG",
    "category": "portraits",
    "title": "By the doorway",
    "alt": "Man in a light blue shirt and jeans leaning beside a doorway"
  },
  {
    "src": "My%20webproject/IMG_9596.jpg",
    "category": "portraits",
    "title": "A little celebration",
    "alt": "Young girl in a red dress standing beside a white car"
  },
  {
    "src": "My%20webproject/IMG_9665.jpg",
    "category": "portraits",
    "title": "Red against white",
    "alt": "Young girl in a red dress posing with outstretched arms beside a white car"
  }
];

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

// Image Error Handling
const allImages = document.querySelectorAll('img');
allImages.forEach(img => {
  img.addEventListener('error', () => {
    if (!img.dataset.failed) { img.dataset.failed = 'true'; img.removeAttribute('srcset'); img.src = 'images/placeholder.svg'; }
  });
});

// Initialize Theme
initializeTheme();



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
  const text = document.createElement('div');
  text.className = 'message-content';
  text.textContent = content;
  messageDiv.appendChild(text);
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
      for (const [className, text] of [['admin-message-time', date], ['admin-message-user', `📨 Customer: ${msg.user}`], ['admin-message-text', `Response: ${msg.bot}`]]) {
        const line = document.createElement('div');
        line.className = className;
        line.textContent = text;
        msgDiv.appendChild(line);
      }
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

// Account navigation is managed by account-menu.js.

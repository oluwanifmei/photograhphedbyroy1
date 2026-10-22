// Global App Configuration
const APP_CONFIG = {
  // Replace this with your actual deployed Render URL after creating your service on Render.com
  // Example: 'https://nifemi-photography-backend.onrender.com'
  RENDER_BACKEND_URL: '',

  // Your phone number for direct WhatsApp booking inquiries (include country code without +, e.g., '2348012345678')
  WHATSAPP_NUMBER: '2349025803917',

  // Your Calendly profile or event link for online scheduling
  // Replace 'nifemi-photography' with your actual Calendly username once created on Calendly.com
  CALENDLY_URL: 'https://calendly.com/nifemi-photography/photography-session',

  // Helper method to get the correct API Base URL
  get API_BASE() {
    // If a custom Render URL is specified, use it when running off file system
    if (this.RENDER_BACKEND_URL) {
      return this.RENDER_BACKEND_URL.replace(/\/$/, '');
    }
    // Default local dev check vs relative path when served over http/https
    return window.location.protocol === 'file:' ? 'http://localhost:3000' : '';
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = APP_CONFIG;
}

if (typeof window !== "undefined") window.APP_CONFIG = APP_CONFIG;

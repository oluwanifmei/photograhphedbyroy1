window.RoyAPI = {
  async request(route, options = {}) {
    if (window.APP_CONFIG.STATIC_HOSTING && !window.APP_CONFIG.RENDER_BACKEND_URL) throw new Error('Online accounts are not available yet. Please contact Roy directly.');
    const response = await fetch(window.APP_CONFIG.API_BASE + route, { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', ...options.headers } });
    const result = await response.json().catch(() => ({ error: 'The server returned an unexpected response.' }));
    if (!response.ok) { const error = new Error(result.error || 'Request failed.'); error.status = response.status; throw error; }
    return result;
  }
};
localStorage.removeItem('token');
localStorage.removeItem('adminToken');

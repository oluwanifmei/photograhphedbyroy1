window.RoyAPI = {
  async request(route, options = {}) {
    const response = await fetch(window.APP_CONFIG.API_BASE + route, { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', ...options.headers } });
    const result = await response.json().catch(() => ({ error: 'The server returned an unexpected response.' }));
    if (!response.ok) { const error = new Error(result.error || 'Request failed.'); error.status = response.status; throw error; }
    return result;
  }
};
localStorage.removeItem('token');
localStorage.removeItem('adminToken');

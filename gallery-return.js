(() => {
  let next = '';
  try {
    const value = new URLSearchParams(location.search).get('next') || '';
    const target = new URL(value, location.origin);
    if (value.startsWith('/') && !value.startsWith('//') && target.origin === location.origin && ['/portfolio','/collections','/collections/khadney-birthday'].includes(target.pathname.replace(/\/$/,''))) next = target.pathname + target.search + (target.hash || (/^#[a-z0-9-]+$/i.test(location.hash || '') ? location.hash : ''));
  } catch {}
  window.RoyGalleryReturn = { next, login: 'login.html' + (next ? '?next=' + encodeURIComponent(next) : '') };
  document.addEventListener('DOMContentLoaded', () => {
    if (!next) return;
    document.querySelectorAll('a[href="signup.html"], a[href="login.html"]').forEach(link => { link.href += '?next=' + encodeURIComponent(next); });
    const notice = document.createElement('p'); notice.className = 'account-availability'; notice.textContent = 'Sign in or create an account to view the gallery. After signing in, you will return to your selected collection.';
    document.querySelector('form')?.before(notice);
    if (document.getElementById('signupForm')) { const link = document.createElement('a'); link.href = window.RoyGalleryReturn.login; link.textContent = 'Already have an account? Sign in'; document.querySelector('form').after(link); }
  });
})();

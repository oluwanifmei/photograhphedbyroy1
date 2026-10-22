document.querySelectorAll('[data-diary-select]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-diary-frame]').forEach(frame => { frame.hidden = frame.dataset.diaryFrame !== button.dataset.diarySelect; });
    document.querySelectorAll('[data-diary-select]').forEach(other => other.setAttribute('aria-pressed', other === button));
  });
});
const requestedCategory = new URLSearchParams(location.search).get('category');
if (requestedCategory) {
  const filter = [...document.querySelectorAll('.filter-btn')].find(button => button.dataset.filter === requestedCategory);
  filter?.click();
}

// A short, camera-inspired entrance; content stays visible without JavaScript.
(() => {
  const home = document.querySelector('#page-home.active');
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!home || preference.matches || !('IntersectionObserver' in window)) return;

  const photo = home.querySelector('.hero-editorial-photo');
  const frame = document.createElement('span');
  frame.className = 'hero-viewfinder';
  frame.setAttribute('aria-hidden', 'true');
  photo?.append(frame);

  const cards = home.querySelectorAll('.selected-work .portfolio-card, .story-cover, .spotlight-card, .experience-step');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('home-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  cards.forEach((card, index) => {
    card.style.setProperty('--reveal-delay', `${index % 3 * 70}ms`);
    card.classList.add('home-reveal');
    observer.observe(card);
  });
  preference.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    cards.forEach(card => card.classList.add('home-revealed'));
    frame.remove();
  });
})();

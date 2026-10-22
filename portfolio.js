(() => {
  const grid = document.getElementById('galleryGrid');
  const count = document.getElementById('galleryCount');
  const filters = [...document.querySelectorAll('.filter-btn')];
  const cards = [...(grid?.querySelectorAll('.portfolio-card') || [])];
  const updateCount = () => { if (count) count.textContent = cards.filter(card => !card.hidden).length + ' photographs'; };
  filters.forEach(button => {
    button.setAttribute('aria-pressed', button.classList.contains('active'));
    button.addEventListener('click', () => {
      filters.forEach(other => { other.classList.toggle('active', other === button); other.setAttribute('aria-pressed', other === button); });
      cards.forEach(card => card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter);
      updateCount();
    });
  });
  updateCount();
  const dialog = document.getElementById('photoViewer');
  if (!dialog) return;
  const image = document.getElementById('viewerImage');
  const caption = document.getElementById('viewerCaption');
  let group = [], current = 0, trigger;
  const show = () => { const button = group[current]; image.src = button.dataset.full; image.alt = button.querySelector('img').alt; caption.textContent = button.dataset.title + ' · ' + (current + 1) + ' / ' + group.length; };
  document.querySelectorAll('.portfolio-open').forEach(button => button.addEventListener('click', () => {
    trigger = button;
    group = [...button.closest('.selected-grid, .gallery-grid').querySelectorAll('.portfolio-card:not([hidden]) .portfolio-open')];
    current = group.indexOf(button); show(); dialog.showModal(); document.body.classList.add('viewer-open');
  }));
  const move = delta => { current = (current + delta + group.length) % group.length; show(); };
  dialog.querySelector('.viewer-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.viewer-prev').addEventListener('click', () => move(-1));
  dialog.querySelector('.viewer-next').addEventListener('click', () => move(1));
  dialog.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); } if (e.key === 'ArrowRight') { e.preventDefault(); move(1); } });
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { document.body.classList.remove('viewer-open'); trigger?.focus(); });
})();

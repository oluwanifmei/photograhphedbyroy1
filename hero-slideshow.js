(() => {
  const root = document.querySelector('#page-home.active #heroSlideshow');
  if (!root) return;
  const slides = [...root.querySelectorAll('.hero-slide')];
  const controls = root.querySelector('#heroSlideControls');
  const buttons = [...root.querySelectorAll('[data-hero-slide]')];
  const pause = root.querySelector('#heroSlidePause');
  const caption = root.querySelector('#heroSlideCaption');
  if (slides.length < 2 || !controls || !pause) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, paused = false, hovering = false, focused = false, visible = true, timer, selection = 0;
  const stop = () => { clearTimeout(timer); timer = null; };
  const canPlay = () => !paused && !hovering && !focused && visible && !document.hidden && !motion.matches;
  const schedule = () => { stop(); if (canPlay()) timer = setTimeout(() => show((current + 1) % slides.length), 6500); };
  function show(index) {
    stop();
    const wanted = ++selection;
    const image = slides[index];
    const apply = () => {
      if (wanted !== selection) return;
      current = index;
      slides.forEach((slide, i) => { slide.classList.toggle('is-active', i === index); slide.setAttribute('aria-hidden', String(i !== index)); });
      buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      caption.textContent = image.dataset.slideCaption;
      schedule();
    };
    if (image.complete && image.naturalWidth > 0) apply();
    else {
      image.loading = 'eager';
      image.addEventListener('load', apply, { once: true });
      image.addEventListener('error', () => { if (wanted === selection) schedule(); }, { once: true });
    }
  }
  function updatePause() {
    pause.disabled = motion.matches;
    pause.textContent = motion.matches ? 'Motion reduced · paused' : paused ? 'Play slideshow' : 'Pause slideshow';
    pause.setAttribute('aria-pressed', String(paused || motion.matches));
    schedule();
  }
  controls.hidden = false;
  buttons.forEach((button, index) => button.addEventListener('click', () => show(index)));
  pause.addEventListener('click', () => { paused = !paused; updatePause(); });
  root.addEventListener('mouseenter', () => { hovering = true; stop(); });
  root.addEventListener('mouseleave', () => { hovering = false; schedule(); });
  root.addEventListener('focusin', () => { focused = true; stop(); });
  root.addEventListener('focusout', event => { if (!root.contains(event.relatedTarget)) { focused = false; schedule(); } });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', updatePause);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, { threshold: .1 }).observe(root);
  updatePause();
})();

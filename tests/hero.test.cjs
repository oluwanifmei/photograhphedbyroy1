const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function setup(reduced = false) {
  const timers = new Map(); let timerId = 0;
  const node = () => ({ events: {}, attrs: {}, addEventListener(name, fn) { this.events[name] = fn; }, setAttribute(name, value) { this.attrs[name] = value; } });
  const slides = [0,1,2].map(i => ({ ...node(), complete: true, naturalWidth: 960, dataset: { slideCaption: 'Frame ' + i }, classList: { toggle(name, active) { this.active = active; } } }));
  const buttons = slides.map(node), controls = { hidden: true }, pause = node(), caption = {};
  const root = { ...node(), querySelectorAll: selector => selector === '.hero-slide' ? slides : buttons, querySelector: selector => ({ '#heroSlideControls': controls, '#heroSlidePause': pause, '#heroSlideCaption': caption })[selector] };
  const motion = { ...node(), matches: reduced };
  const document = { ...node(), hidden: false, querySelector: () => root };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../hero-slideshow.js'), 'utf8'), { document, window: { matchMedia: () => motion }, setTimeout: fn => { const id = ++timerId; timers.set(id, fn); return id; }, clearTimeout: id => timers.delete(id) });
  return { slides, buttons, controls, pause, caption, timers, document, motion };
}
test('hero slideshow pauses, permits manual selection and suspends hidden-page playback', () => {
  const p = setup();
  assert.equal(p.controls.hidden, false); assert.equal(p.timers.size, 1);
  p.pause.events.click(); assert.equal(p.timers.size, 0);
  p.buttons[2].events.click(); assert.equal(p.caption.textContent, 'Frame 2');
  assert.equal(p.slides[2].attrs['aria-hidden'], 'false');
  assert.equal(p.buttons[2].attrs['aria-pressed'], 'true');
  p.pause.events.click(); assert.equal(p.timers.size, 1);
  p.document.hidden = true; p.document.events.visibilitychange(); assert.equal(p.timers.size, 0);
});
test('reduced motion keeps hero still while manual photograph controls work', () => {
  const p = setup(true);
  assert.equal(p.timers.size, 0); assert.equal(p.pause.disabled, true);
  p.buttons[1].events.click(); assert.equal(p.caption.textContent, 'Frame 1');
  assert.equal(p.timers.size, 0);
});

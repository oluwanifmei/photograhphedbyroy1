const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function page(home = false, inline = false, staticHosting = false) {
  let submit;
  let resets = 0;
  const button = { disabled: false };
  const form = { addEventListener: (_, fn) => submit = fn, reportValidity: () => true, querySelector: () => button, reset: () => resets++ };
  const values = home ? { clientName: 'Client', clientEmail: 'client@example.com', shootType: 'Portrait', shootDate: '2026-12-01', shootPriority: 'milestone', shootLocation: 'Lagos' } : { name: 'Client', email: 'client@example.com', service: 'Portrait', date: '2026-12-01' };
  const alerts = [];
  const status = { hidden: true, textContent: '', dataset: {}, focus() {} };
  const calls = [];
  const drafts = [];
  let response = async () => ({ ok: true, json: async () => ({ ok: true }) });
  const context = { window: { APP_CONFIG: { API_BASE: 'https://api.example.com' } }, document: { addEventListener: (_, fn) => fn(), querySelectorAll: () => [], getElementById: id => id === 'bookingForm' ? form : id === 'bookingStatus' && inline ? status : (id in values ? { value: values[id] } : null) }, localStorage: { getItem: () => null, setItem: () => assert.fail('Must not store a failed booking locally') }, alert: message => alerts.push(message), fetch: async (url, options) => { calls.push({ url, options }); return response(); }, AbortController, setTimeout, clearTimeout, crypto: { randomUUID: () => 'test-request-key-123456' }, TypeError };
  context.window.APP_CONFIG.STATIC_HOSTING = staticHosting;
  context.window.APP_CONFIG.WHATSAPP_NUMBER = '2349025803917';
  context.window.open = url => drafts.push(url);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../booking.js'), 'utf8'), context);
  return { submit: () => submit({ preventDefault() {} }), alerts, calls, drafts, button, status, get resets() { return resets; }, respond: fn => response = fn };
}

test('both forms save through the configured API and reset only after acknowledgement', async () => {
  for (const home of [true, false]) {
    const p = page(home);
    await p.submit();
    assert.equal(p.calls[0].url, 'https://api.example.com/api/booking');
    const body = JSON.parse(p.calls[0].options.body);
    assert.equal(body.name, 'Client');
    if (home) { assert.equal(body.priority, 'milestone'); assert.equal(body.location, 'Lagos'); }
    assert.equal(p.resets, 1); assert.equal(p.button.disabled, false);
  }
});

test('inline booking receipts show success and errors without a redirect or alert', async () => {
  const p = page(true, true);
  await p.submit();
  assert.equal(p.status.hidden, false); assert.equal(p.status.dataset.state, 'success');
  assert.match(p.status.textContent, /session is not booked yet/); assert.equal(p.alerts.length, 0);
  p.respond(async () => ({ ok: false, json: async () => ({ error: 'Please try again' }) }));
  await p.submit();
  assert.equal(p.status.dataset.state, 'error'); assert.equal(p.status.textContent, 'Please try again');
});

test('failed requests preserve details and retry with the same request key', async () => {
  const p = page();
  p.respond(async () => { throw new TypeError('Failed to fetch'); });
  await p.submit();
  assert.equal(p.resets, 0); assert.equal(p.button.disabled, false);
  assert.match(p.alerts[0], /could not confirm receipt/);
  p.respond(async () => ({ ok: false, json: async () => ({ error: 'Storage unavailable' }) }));
  await p.submit();
  assert.equal(p.resets, 0); assert.equal(p.alerts[1], 'Storage unavailable');
  assert.equal(p.calls[0].options.headers['Idempotency-Key'], p.calls[1].options.headers['Idempotency-Key']);
});

test('repeated clicks cannot submit while a request is in flight', async () => {
  const p = page();
  let release;
  p.respond(() => new Promise(resolve => release = resolve));
  const pending = p.submit();
  assert.equal(p.button.disabled, true);
  await p.submit();
  assert.equal(p.calls.length, 1);
  release({ ok: true, json: async () => ({ ok: true }) });
  await pending;
});

test('config exposes its backend URL to HTTP hosted pages', () => {
  const context = { window: { location: { protocol: 'https:' } } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../config.js'), 'utf8'), context);
  context.window.APP_CONFIG.RENDER_BACKEND_URL = 'https://api.example.com/';
  assert.equal(context.window.APP_CONFIG.API_BASE, 'https://api.example.com');
});

test('static hosting opens an unsent WhatsApp enquiry and never claims a saved booking', async () => {
  const p = page(true, true, true);
  await p.submit();
  assert.equal(p.calls.length, 0);
  assert.equal(p.resets, 0);
  const draft = new URL(p.drafts[0]);
  assert.equal(draft.origin + draft.pathname, 'https://wa.me/2349025803917');
  assert.match(draft.searchParams.get('text'), /Name: Client/);
  assert.match(draft.searchParams.get('text'), /Service: Portrait/);
  assert.match(p.status.textContent, /press Send/);
  assert.equal(p.status.dataset.state, 'info');
});

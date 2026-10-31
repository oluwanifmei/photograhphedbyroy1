const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
async function menuFor({ staticHosting = false, user = null } = {}) {
  const listeners = {}, attributes = { 'aria-expanded': 'false' };
  let focused = false, active = false, calls = 0;
  const button = { addEventListener: (type, callback) => listeners['button:' + type] = callback, setAttribute: (key, value) => attributes[key] = value, getAttribute: key => attributes[key], focus: () => focused = true };
  const menu = { innerHTML: fs.readFileSync(path.join(root, 'index.html'), 'utf8').split('id="accountMenu"')[1].split('<button class="nav-toggle"')[0], setAttribute: (key, value) => attributes[key] = value, classList: { toggle: (_, value) => active = value }, querySelector: () => null };
  const dropdown = { contains: target => target === button };
  const context = {
    document: { readyState: 'complete', getElementById: id => ({ accountBtn: button, accountMenu: menu, accountDropdown: dropdown }[id]), addEventListener: (type, callback) => listeners[type] = callback },
    window: { APP_CONFIG: { STATIC_HOSTING: staticHosting }, RoyAPI: { request: async () => { calls++; if (!user) throw new Error('Unauthorized'); return user; } } }
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'account-menu.js'), 'utf8'), context);
  await new Promise(setImmediate);
  return { menu, listeners, attributes, get focused() { return focused; }, get active() { return active; }, get calls() { return calls; } };
}
test('public account menu hides owner access and supports Escape and outside clicks', async () => {
  const item = await menuFor({ staticHosting: true });
  for (const label of ['Login', 'Create account']) assert.match(item.menu.innerHTML, new RegExp(label));
  assert.doesNotMatch(item.menu.innerHTML, /Admin dashboard|href="admin.html"/);
  assert.doesNotMatch((await menuFor()).menu.innerHTML, /Admin dashboard|href="admin.html"/);
  assert.equal(item.calls, 0);
  item.listeners['button:click'](); assert.equal(item.active, true); assert.equal(item.attributes['aria-hidden'], 'false');
  item.listeners.keydown({ key: 'Escape' }); assert.equal(item.active, false); assert.equal(item.focused, true);
  item.listeners['button:click'](); item.listeners.click({ target: {} }); assert.equal(item.active, false);
});
test('signed-in clients get their account while verified owners get the booking dashboard', async () => {
  const customer = await menuFor({ user: { isAdmin: false } });
  assert.match(customer.menu.innerHTML, /My account/); assert.doesNotMatch(customer.menu.innerHTML, /Admin dashboard/);
  const owner = await menuFor({ user: { isAdmin: true } });
  assert.match(owner.menu.innerHTML, /Admin dashboard/); assert.match(owner.menu.innerHTML, /Log out/);
});

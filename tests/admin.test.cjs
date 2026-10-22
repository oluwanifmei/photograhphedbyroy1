const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('a slow dashboard request cannot overwrite newer filter results', async () => {
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, { value: '', dataset: {}, listeners: {}, textContent: '', addEventListener(event, callback) { this.listeners[event] = callback; }, replaceChildren() {} });
    return elements.get(id);
  };
  const requests = [];
  const context = {
    document: { addEventListener: (_, callback) => callback(), getElementById: element, querySelector: element },
    RoyAPI: { request: route => new Promise(resolve => requests.push({ route, resolve })) },
    URLSearchParams, setTimeout
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../admin.js'), 'utf8'), context);
  element('bookingSearch').value = 'Latest';
  element('adminFilters').listeners.submit({ preventDefault() {} });
  assert.equal(requests.length, 4);
  requests[2].resolve({ total: 22, pending: 2, confirmed: 20, clients: 10 });
  requests[3].resolve({ total: 2, items: [] });
  await new Promise(setImmediate);
  assert.equal(element('metricTotal').textContent, 22);
  requests[0].resolve({ total: 1, pending: 1, confirmed: 0, clients: 1 });
  requests[1].resolve({ total: 1, items: [] });
  await new Promise(setImmediate);
  assert.equal(element('metricTotal').textContent, 22);
  assert.match(element('bookingPage').textContent, /2 enquiries/);
});

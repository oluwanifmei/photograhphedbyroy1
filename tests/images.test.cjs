const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
test('all rendered local photographs and responsive variants exist', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.equal((html.match(/class="portfolio-card"/g) || []).length, 62);
  for (const match of html.matchAll(/<img [^>]*>/g)) {
    const tag = match[0];
    for (const source of tag.matchAll(/(?:src|data-full)="([^"]+)"/g)) {
      assert.ok(fs.statSync(path.join(root, decodeURIComponent(source[1]))).size > 0, source[1]);
    }
    const srcset = tag.match(/srcset="([^"]+)"/);
    if (srcset) for (const variant of srcset[1].split(', ')) assert.ok(fs.statSync(path.join(root, variant.split(' ')[0])).size > 0);
  }
  assert.equal((html.match(/fetchpriority="high"/g) || []).length, 1);
  assert.doesNotMatch(html, /videos\/cinematic-hero/);
});

test('booking has four required fields and package links preserve the selection', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const form = html.match(/<form class="booking-form simple-booking"[\s\S]*?<\/form>/)[0];
  assert.equal((form.match(/\brequired\b/g) || []).length, 4);
  assert.match(form, /id="bookingStatus"/);
  for (const service of ['portrait','wedding','event','fashion','birthday','graduation']) assert.ok(html.includes('/book?package=' + service));
});


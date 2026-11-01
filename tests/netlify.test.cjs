const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Netlify publishes public pages and photographs while routing private pages to Express', () => {
  const root = path.resolve(__dirname, '..');
  const previousURL = process.env.URL;
  process.env.URL = 'https://roy-test.netlify.app';
  try { require('../tools/build-netlify.cjs'); }
  finally { if (previousURL === undefined) delete process.env.URL; else process.env.URL = previousURL; }
  const output = path.join(root, 'dist-netlify');
  const home = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
  assert(!home.includes('roy-static-hosting'));
  assert(!home.includes('<section id="page-gallery"'));
  for (const name of ['login.html', 'signup.html', 'account.html', 'admin.html', 'portfolio/index.html', 'collections/index.html']) assert(!fs.existsSync(path.join(output, name)), name);
  assert(fs.existsSync(path.join(output, 'images/roy-homepage-preview.jpg')));
  assert(!fs.existsSync(path.join(output, 'server.js')));
  assert(!fs.existsSync(path.join(output, '.env')));
});

test('Netlify refuses requests without persistent database credentials', async () => {
  const { handler } = require('../netlify/functions/studio');
  const previous = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try {
    const result = await handler({}, {});
    assert.equal(result.statusCode, 503);
    assert.equal(result.headers['Cache-Control'], 'no-store');
  } finally { if (previous !== undefined) process.env.DATABASE_URL = previous; }
});

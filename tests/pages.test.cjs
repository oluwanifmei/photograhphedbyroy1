const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildPages } = require('../tools/build-pages.cjs');
const { routes, renderPage } = require('../page-renderer.cjs');
const root = path.resolve(__dirname, '..');
const site = 'https://oluwanifmei.github.io/photograhphedbyroy1/';

test('Pages build preserves photos and resolves every internal page and asset under the repository path', t => {
  const output = path.join(root, '.pages-test');
  assert.ok(output.startsWith(root + path.sep));
  t.after(() => fs.rmSync(output, { recursive: true, force: true }));
  buildPages(site, output);
  const resolve = url => {
    assert.ok(url.pathname.startsWith('/photograhphedbyroy1/'), url.href);
    const file = path.join(output, decodeURIComponent(url.pathname.slice('/photograhphedbyroy1/'.length)));
    assert.ok(fs.existsSync(file), url.href);
    if (fs.statSync(file).isDirectory()) assert.ok(fs.existsSync(path.join(file, 'index.html')), url.href);
  };
  for (const [route, page] of Object.entries(routes)) {
    const file = route === '/' ? 'index.html' : route.slice(1) + '/index.html';
    const html = fs.readFileSync(path.join(output, file), 'utf8');
    assert.match(html, new RegExp(`id="page-${page}" class="page active"`));
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, route);
    assert.match(html, /<base href="\/photograhphedbyroy1\/"/);
    assert.match(html, /name="roy-static-hosting"/);
    assert.doesNotMatch(html, /id="accountDropdown" style="display:none"/);
    assert.match(html, /href="admin.html" class="account-menu-item">Admin dashboard/);
    assert.match(html, /href="signup.html" class="account-menu-item">Create account/);
    for (const match of html.matchAll(/(?:href|src|data-full)="([^"]+)"/g)) {
      const url = new URL(match[1].replace(/&amp;/g, '&'), site);
      if (url.origin === new URL(site).origin) resolve(url);
    }
    for (const match of html.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/g)) {
      for (const variant of match[1].split(',')) resolve(new URL(variant.trim().split(' ')[0], site));
    }
    assert.match(html, /Continue on WhatsApp/);
  }
  for (const name of ['server.js', '.env', 'data.json', 'tests', 'tools', 'node_modules']) assert.ok(!fs.existsSync(path.join(output, name)), name);
  for (const name of ['sitemap.xml', 'robots.txt', '404.html', '.nojekyll']) assert.ok(fs.existsSync(path.join(output, name)));
  for (const name of fs.readdirSync(root).filter(name => /\.(jpe?g|png|heic)$/i.test(name))) assert.deepEqual(fs.readFileSync(path.join(output, name)), fs.readFileSync(path.join(root, name)));
  assert.match(fs.readFileSync(path.join(output, 'login.html'), 'utf8'), /Online account access is not available yet/);
  buildPages(site, output, { backendURL: 'https://roy-api.example.com/' });
  assert.match(fs.readFileSync(path.join(output, 'config.js'), 'utf8'), /RENDER_BACKEND_URL: "https:\/\/roy-api.example.com"/);
  assert.match(fs.readFileSync(path.join(output, 'admin.html'), 'utf8'), /url=https:\/\/roy-api.example.com\/admin.html/);
  const connected = fs.readFileSync(path.join(output, 'book/index.html'), 'utf8');
  assert.match(connected, /Send my request/);
  assert.doesNotMatch(connected, /id="accountDropdown" style="display:none"/);
  assert.throws(() => buildPages(site, output, { backendURL: 'http://unsecured.example.com/' }), /HTTPS server origin/);
  assert.throws(() => buildPages(site, output, { backendURL: 'https://user:password@example.com/' }), /HTTPS server origin/);
});

test('static root domains and nested story anchors retain their own paths', () => {
  const html = renderPage(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), '/stories', 'https://roy.example.com/', { staticHosting: true });
  assert.match(html, /<base href="\/"/);
  assert.match(html, /href="\/stories\/#colour-of-confidence"/);
  assert.match(html, /href="\/book\/\?package=portrait"/);
});

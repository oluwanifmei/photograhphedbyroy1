const fs = require('node:fs');
const path = require('node:path');
const { buildPages } = require('./build-pages.cjs');
const { renderPage, routes } = require('../page-renderer.cjs');
const { isPrivateRoute, stripPrivatePages } = require('../gallery-access.cjs');
const root = path.resolve(__dirname, '..');
const site = process.env.URL || process.env.SITE_URL;
if (!site) throw new Error('Netlify must provide URL, or set SITE_URL.');
const output = path.join(root, 'dist-netlify');
// Only remove a fixed build directory inside this repository.
fs.rmSync(output, { recursive: true, force: true });
buildPages(site, output, { backendURL: site });
const template = stripPrivatePages(fs.readFileSync(path.join(root, 'index.html'), 'utf8'));
for (const route of Object.keys(routes)) {
  const target = path.join(output, route === '/' ? 'index.html' : route.slice(1) + '/index.html');
  if (isPrivateRoute(route)) fs.rmSync(target, { force: true });
  else fs.writeFileSync(target, renderPage(template, route, site));
}
// These pages must pass through Express so gallery access and cookies stay intact.
for (const name of ['login.html', 'signup.html', 'account.html', 'admin.html', 'robots.txt', 'sitemap.xml']) fs.rmSync(path.join(output, name), { force: true });
fs.copyFileSync(path.join(root, 'config.js'), path.join(output, 'config.js'));
console.log('Built Netlify public pages; private routes and API use the studio function.');

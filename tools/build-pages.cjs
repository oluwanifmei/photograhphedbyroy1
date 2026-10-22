const fs = require('node:fs');
const path = require('node:path');
const { renderPage, routes } = require('../page-renderer.cjs');
const root = path.resolve(__dirname, '..');

function buildPages(siteURL, destination = path.join(root, 'dist'), { backendURL = process.env.BACKEND_URL || '' } = {}) {
  if (backendURL) {
    const backend = new URL(backendURL);
    if ((backend.protocol !== 'https:' && !(backend.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(backend.hostname))) || backend.username || backend.password || backend.search || backend.hash || backend.pathname !== '/') throw new Error('BACKEND_URL must be an HTTPS server origin without credentials or a path.');
    backendURL = backend.origin;
  }
  const site = new URL(siteURL.endsWith('/') ? siteURL : siteURL + '/');
  if (!['http:', 'https:'].includes(site.protocol)) throw new Error('SITE_URL must be an HTTP(S) URL.');
  const output = path.resolve(destination);
  if (output === root || !output.startsWith(root + path.sep)) throw new Error('Build output must be a directory inside the repository.');
  fs.mkdirSync(output, { recursive: true });
  const write = (name, content) => {
    const file = path.join(output, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  };
  const template = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const route of Object.keys(routes)) {
    write(route === '/' ? 'index.html' : route.slice(1) + '/index.html', renderPage(template, route, site.href, { staticHosting: true, backendURL }));
  }
  const publicFiles = ['styles.css', 'styles-new.css', 'forms.css', 'refinements.css', 'script.js', 'booking.js', 'config.js', 'auth.js', 'portfolio.js', 'stories.js'];
  for (const name of publicFiles) fs.copyFileSync(path.join(root, name), path.join(output, name));
  write('config.js', fs.readFileSync(path.join(root, 'config.js'), 'utf8').replace("RENDER_BACKEND_URL: '',", 'RENDER_BACKEND_URL: ' + JSON.stringify(backendURL) + ','));
  // Publish photographs and video only; never copy server code, secrets or customer records.
  for (const folder of ['', 'images', 'My webproject', 'videos']) {
    const directory = path.join(root, folder);
    if (!fs.existsSync(directory)) continue;
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      if (!item.isFile() || !/\.(?:jpe?g|png|webp|gif|svg|heic|mp4|webm|ico)$/i.test(item.name)) continue;
      const name = path.join(folder, item.name);
      fs.mkdirSync(path.dirname(path.join(output, name)), { recursive: true });
      fs.copyFileSync(path.join(root, name), path.join(output, name));
    }
  }
  const home = site.pathname;
  const booking = home + 'book/';
  write('booking.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${booking}"><title>Book with Roy</title></head><body><a href="${booking}">Continue to booking</a></body></html>`);
  const accountNotice = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><base href="${home}"><title>Contact Roy | Photographed by Roy</title><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="forms.css"></head><body><main class="form-page"><h1>Let's plan your session.</h1><p>Online account access is not available yet. You can enquire about a session directly with Roy—no account needed.</p><p><a class="button button-primary" href="${booking}">Plan your session</a></p><p><a href="${home}">← Return to the photographs</a></p></main></body></html>`;
  for (const name of ['login.html', 'signup.html', 'account.html', 'admin.html']) {
    const redirect = backendURL && `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${backendURL}/${name}"><meta name="robots" content="noindex"><title>Roy's studio</title></head><body><a href="${backendURL}/${name}">Continue to Roy's studio</a></body></html>`;
    write(name, redirect || accountNotice);
  }
  write('404.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Find your way back | Roy</title></head><body><h1>Let's get you back to the photographs.</h1><a href="${home}portfolio/">Explore the gallery</a> · <a href="${home}">Home</a></body></html>`);
  write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + Object.keys(routes).map(route => `<url><loc>${site.href + (route === '/' ? '' : route.slice(1) + '/')}</loc></url>`).join('') + '</urlset>');
  write('robots.txt', `User-agent: *\nAllow: ${home}\nDisallow: ${home}admin.html\nDisallow: ${home}account.html\nSitemap: ${site.href}sitemap.xml\n`);
  write('.nojekyll', '');
  write('deployment.json', JSON.stringify({ commit: process.env.GITHUB_SHA || null, site: site.href, mode: 'static-pages', backend: backendURL || null }));
  return output;
}
if (require.main === module) {
  if (!process.env.SITE_URL) throw new Error('Set SITE_URL to the full public website URL, including its repository path.');
  console.log('Built GitHub Pages site:', buildPages(process.env.SITE_URL));
}
module.exports = { buildPages };

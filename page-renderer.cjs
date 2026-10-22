const fs = require('fs');
const path = require('path');
const routes = { '/': 'home', '/portfolio': 'gallery', '/services': 'services', '/before-after': 'before-after', '/stories': 'blog', '/book': 'booking', '/about': 'about', '/contact': 'contact' };
const titles = { home: 'Portrait & Event Photographer in Lagos & Ibadan', gallery: 'Photography Portfolio', services: 'Photography Sessions & Packages', 'before-after': 'The Editing Process', blog: 'Photography Stories', booking: 'Request a Photography Session', about: 'Meet Oluwanifemi Roy', contact: 'Contact Roy in Lagos & Ibadan' };
const escape = value => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
module.exports = function pages(req, res, next) {
  const origin = new URL(process.env.SITE_URL || process.env.FRONTEND_URL || process.env.RENDER_EXTERNAL_URL || `${req.protocol}://${req.get('host')}`).origin;
  if (req.path === '/robots.txt') return res.type('text').send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin.html\nDisallow: /account.html\nDisallow: /login.html\nDisallow: /signup.html\nSitemap: ${origin}/sitemap.xml\n`);
  if (req.path === '/sitemap.xml') return res.type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + Object.keys(routes).map(route => `<url><loc>${escape(origin + route)}</loc></url>`).join('') + '</urlset>');
  if (!['GET', 'HEAD'].includes(req.method)) return next();
  const route = req.path === '/index.html' ? '/' : req.path;
  const page = routes[route];
  if (!page) return next();
  let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  html = html.replace('<body id="top">', `<body id="top" data-initial-page="${page}">`)
    .replace(/(<section id="page-([^"]+)" class=")page(?: active)?"/g, (_, prefix, id) => prefix + 'page' + (id === page ? ' active' : '') + '"')
    .replace(/<title>[^<]*<\/title>/, `<title>${titles[page]} | Photographed by Roy</title>`)
    .replace('</head>', `<link rel="canonical" href="${escape(origin + route)}" />\n<meta property="og:url" content="${escape(origin + route)}" />\n</head>`)
    .replace('content="images/hero-1600.webp"', `content="${escape(origin)}/images/hero-1600.webp"`)
    .replace(/<meta property="og:title"[^>]+>/, `<meta property="og:title" content="${titles[page]} | Photographed by Roy" />`);
  html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (_, json) => {
    const business = JSON.parse(json);
    business.url = origin;
    business.image = origin + '/images/hero-1600.webp';
    business.contactPoint.telephone = '+2349025803917';
    return '<script type="application/ld+json">' + JSON.stringify(business).replace(/</g, '\\u003c') + '</script>';
  });
  if (page !== 'home') {
    html = html.replace('<h1 id="heroTitle">', '<h2 id="heroTitle">').replace('</h1>', '</h2>');
    const sectionStart = html.indexOf(`<section id="page-${page}"`);
    html = html.slice(0, sectionStart) + html.slice(sectionStart).replace('<h2>', '<h1>').replace('</h2>', '</h1>');
  }
  res.type('html').send(html);
};

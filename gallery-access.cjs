const privatePages = new Set(['gallery', 'collections', 'khadneycollection']);
function isPrivateRoute(route) { return /^\/(portfolio|collections)(\/|$)/.test(route); }
function stripPrivatePages(html) {
  for (const id of privatePages) {
    const start = html.indexOf('<section id="page-' + id + '"');
    if (start < 0) continue;
    const tags = /<\/?section\b[^>]*>/g; tags.lastIndex = start; let depth = 0, match, end;
    while ((match = tags.exec(html))) { depth += match[0].startsWith('</') ? -1 : 1; if (!depth) { end = tags.lastIndex; break; } }
    if (!end) throw new Error('Invalid gallery section.');
    html = html.slice(0,start) + html.slice(end);
  }
  return html;
}
function collectionGate(route, backendURL) {
  const next = encodeURIComponent(route);
  const destination = backendURL ? backendURL + '/login.html?next=' + next : '';
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">' + (destination ? '<meta http-equiv="refresh" content="0;url=' + destination + '">' : '') + '<title>Sign in to view the gallery | Photographed by Roy</title></head><body><main><h1>Sign in to view the gallery</h1><p>Create an account or sign in to explore the full gallery and collections.</p>' + (destination ? '<a href="' + destination + '">Sign in</a> · <a href="' + backendURL + '/signup.html?next=' + next + '">Create an account</a>' : '<p>Online gallery access is not connected yet. Please contact Roy.</p>') + '</main></body></html>';
}
module.exports = { isPrivateRoute, stripPrivatePages, collectionGate };

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

async function start(t, overrides = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'roy-test-'));
  const dataFile = path.join(dir, 'records.json');
  const previous = { ...process.env };
  Object.assign(process.env, { DATA_FILE: dataFile, JWT_SECRET: 'test-only-secret-at-least-32-characters-long', ADMIN_EMAIL: 'owner@example.com', SMTP_HOST: '', ...overrides });
  delete require.cache[require.resolve('../server.js')];
  const app = require('../server.js');
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); process.env = previous; fs.rmSync(dir, { recursive: true, force: true }); });
  return { base: `http://127.0.0.1:${server.address().port}`, dataFile, dir };
}
const booking = { name: 'Test Customer', email: 'client@example.com', service: 'Portrait', date: '2026-12-01', time: '10:00' };
async function request(base, route, body, token, extra = {}) {
  return fetch(base + route, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...extra }, ...(body ? { body: JSON.stringify(body) } : {}) });
}

test('startup, customer privacy, booking validation, ownership, admin lists, and retry deduplication', async t => {
  const { base, dataFile } = await start(t);
  for (const route of ['/data.json', '/server.js', '/package.json', '/.env', '/.git/config', '/tests/api.test.cjs', '/api/..%2fserver.js']) assert.equal((await fetch(base + route)).status, 404, route);
  for (const route of ['/api/signups','/api/bookings','/api/admin/bookings']) assert.equal((await request(base, route)).status, 401);
  assert.equal((await request(base, '/api/booking', {})).status, 400);
  assert.equal((await request(base, '/api/booking', { ...booking, date: '2026-02-30' })).status, 400);
  assert.equal((await request(base, '/api/booking', { ...booking, name: { bad: true } })).status, 400);
  assert.equal((await request(base, '/api/booking', booking, 'mock_token_for_client@example.com')).status, 401);
  for (const email of ['client@example.com','owner@example.com','other@example.com']) {
    assert.equal((await request(base, '/api/register', { name: 'Test', email, password: 'test-password-123' })).status, 200);
  }
  // Public signup alone must never grant owner access.
  const records = JSON.parse(fs.readFileSync(dataFile));
  records.users.find(user => user.email === 'owner@example.com').adminApproved = true;
  fs.writeFileSync(dataFile, JSON.stringify(records));
  const login = async email => (await (await request(base, '/api/login', { email, password: 'test-password-123' })).json()).token;
  const client = await login('client@example.com');
  const owner = await login('owner@example.com');
  const other = await login('other@example.com');
  assert.equal((await request(base, '/api/admin/bookings', null, client)).status, 403);
  assert.equal((await request(base, '/api/booking', { ...booking, id: 'forged', status: 'confirmed', userId: 'forged' }, client, { 'Idempotency-Key': 'test-request-key-123456789' })).status, 201);
  assert.equal((await request(base, '/api/booking', booking, client, { 'Idempotency-Key': 'test-request-key-123456789' })).status, 200);
  const mine = await (await request(base, '/api/me', null, client)).json();
  assert.equal(mine.bookings.length, 1);
  assert.equal(mine.bookings[0].status, 'pending');
  assert.notEqual(mine.bookings[0].id, 'forged');
  assert.equal((await (await request(base, '/api/me', null, other)).json()).bookings.length, 0);
  const list = await (await request(base, '/api/admin/bookings', null, owner)).json();
  assert.equal(list.total, 1); assert.equal(list.items.length, 1);
  assert.equal((await request(base, '/api/admin/booking/' + list.items[0].id + '/status', { status: 'confirmed' }, owner)).status, 200);
  const summary = await (await request(base, '/api/admin/summary', null, owner)).json();
  assert.equal(summary.confirmed, 1); assert.equal(summary.pending, 0);
  assert.equal((await (await request(base, '/api/admin/bookings?status=pending', null, owner)).json()).total, 0);
  assert.equal((await request(base, '/api/admin/bookings?limit=1000', null, owner)).status, 400);
  assert.equal((await request(base, '/api/admin/booking/' + list.items[0].id + '/status', { status: 'invented' }, owner)).status, 400);
  assert.equal((await request(base, '/api/admin/export/bookings?status=confirmed', null, owner)).status, 200);
  assert.equal((await request(base, '/api/bookings', null, owner)).status, 200);
  assert.equal((await fetch(base + '/data.json')).status, 404);
  assert.equal(JSON.parse(fs.readFileSync(dataFile)).bookings.length, 1);
  assert.equal((await request(base, '/api/booking', booking)).status, 201);
  assert.equal((await request(base, '/api/register', { email: 'weak@example.com', name: 'Test', password: 'x' })).status, 400);
});

test('claiming the owner email without verification cannot grant admin access', async t => {
  const { base } = await start(t);
  const credentials = { name: 'Unverified', email: 'owner@example.com', password: 'test-password-123' };
  await request(base, '/api/register', credentials);
  const token = (await (await request(base, '/api/login', credentials)).json()).token;
  assert.equal((await request(base, '/api/admin/summary', null, token)).status, 403);
  assert.equal((await (await request(base, '/api/me', null, token)).json()).isAdmin, false);
});

test('storage failures return errors and preserve existing records', async t => {
  const { base, dataFile } = await start(t);
  assert.equal((await request(base, '/api/booking', booking)).status, 201);
  const original = fs.readFileSync(dataFile, 'utf8');
  fs.mkdirSync(dataFile + '.tmp');
  assert.equal((await request(base, '/api/booking', booking)).status, 500);
  assert.equal(fs.readFileSync(dataFile, 'utf8'), original);
  fs.rmSync(dataFile + '.tmp', { recursive: true });
  fs.writeFileSync(dataFile, 'corrupt');
  assert.equal((await request(base, '/api/booking', booking)).status, 500);
  assert.equal(fs.readFileSync(dataFile, 'utf8'), 'corrupt');
});

test('cookie sessions, origin protection, password changes and session revocation', async t => {
  const { base } = await start(t);
  const credentials = { name: 'Client', email: 'cookie@example.com', password: 'test-password-123' };
  await request(base, '/api/register', credentials);
  const login = await request(base, '/api/login', credentials);
  const cookie = login.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/i); assert.match(cookie, /SameSite=Lax/i);
  const oldToken = (await login.json()).token;
  assert.equal((await request(base, '/api/me', null, null, { Cookie: cookie.split(';')[0] })).status, 200);
  assert.equal((await request(base, '/api/booking', booking, null, { Origin: 'https://attacker.example' })).status, 403);
  const update = body => fetch(base + '/api/me', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + oldToken }, body: JSON.stringify(body) });
  assert.equal((await update({ password: 'changed-password-123' })).status, 400);
  const changed = await update({ password: 'changed-password-123', currentPassword: credentials.password });
  assert.equal(changed.status, 200);
  assert.equal((await request(base, '/api/me', null, oldToken)).status, 401);
  assert.equal((await request(base, '/api/me', null, null, { Cookie: changed.headers.get('set-cookie').split(';')[0] })).status, 200);
  const logout = await request(base, '/api/logout', {});
  assert.match(logout.headers.get('set-cookie'), /Expires=Thu, 01 Jan 1970/);
});

test('login attempts are throttled', async t => {
  const { base } = await start(t);
  for (let i = 0; i < 15; i++) assert.equal((await request(base, '/api/login', { email: 'missing@example.com', password: 'wrong' })).status, 400);
  const response = await request(base, '/api/login', { email: 'missing@example.com', password: 'wrong' });
  assert.equal(response.status, 429); assert.ok(response.headers.get('retry-after'));
});

test('production sessions use Secure cookies and explicitly allowed cross-site origins', async t => {
  const { base } = await start(t, { NODE_ENV: 'production', CROSS_SITE_COOKIES: 'true', FRONTEND_URL: 'https://frontend.example.com' });
  const credentials = { name: 'Client', email: 'secure@example.com', password: 'test-password-123' };
  await request(base, '/api/register', credentials);
  const response = await request(base, '/api/login', credentials, null, { Origin: 'https://frontend.example.com' });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('set-cookie'), /Secure/);
  assert.match(response.headers.get('set-cookie'), /SameSite=None/);
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://frontend.example.com');
  assert.equal(response.headers.get('access-control-allow-credentials'), 'true');
});

test('public pages have crawlable portfolio markup, canonical links and sitemap', async t => {
  const { base } = await start(t, { SITE_URL: 'https://roy.example.com' });
  const html = await (await fetch(base + '/portfolio')).text();
  assert.match(html, /data-initial-page="gallery"/);
  assert.match(html, /rel="canonical" href="https:\/\/roy.example.com\/portfolio"/);
  assert.match(html, /id="page-gallery" class="page active"/);
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
  assert.match(html, /class="portfolio-open"/);
  assert.match(await (await fetch(base + '/sitemap.xml')).text(), /https:\/\/roy.example.com\/portfolio/);
  assert.match(await (await fetch(base + '/robots.txt')).text(), /Disallow: \/api\//);
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { randomUUID, randomBytes, createHash } = require('crypto');
const { createStorage } = require('./storage.cjs');

const app = express();
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL && !process.env.DATABASE_FILE && !process.env.DATA_FILE) throw new Error('Set DATABASE_URL or a path on persistent storage before starting production.');
const storage = createStorage();
app.locals.storage = storage;
const asyncRoute = handler => async (req, res, next) => {
  for (let attempt = 0; attempt < 20; attempt++) {
    try { return await handler(req, res, next); }
    catch (error) {
      if (!error.storageConflict || attempt === 19 || res.headersSent) return next(error);
      await new Promise(resolve => setTimeout(resolve, 5 + Math.floor(Math.random() * 20)));
    }
  }
};

app.disable('x-powered-by');
if (process.env.RENDER || process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);
const allowedOrigins = new Set([process.env.FRONTEND_URL, process.env.PUBLIC_URL, process.env.RENDER_EXTERNAL_URL].filter(Boolean).map(url => new URL(url).origin));
app.use(cors({ origin: (origin, callback) => callback(null, allowedOrigins.has(origin)), credentials: true }));
app.use(express.json({ limit: '32kb' }));
app.use(asyncRoute(async (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.headers.origin && req.headers.origin !== req.protocol + '://' + req.get('host') && !allowedOrigins.has(req.headers.origin)) return res.status(403).json({ error: 'Request origin not allowed.' });
  if (!req.headers.authorization) {
    const session = (req.headers.cookie || '').split(';').map(part => part.trim()).find(part => part.startsWith('roy_session='));
    if (session) {
      const token = session.slice('roy_session='.length);
      if (await verifyToken(token)) req.headers.authorization = 'Bearer ' + token;
      else res.clearCookie('roy_session', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.CROSS_SITE_COOKIES === 'true' ? 'none' : 'lax', path: '/' });
    }
  }
  next();
}));
const attempts = new Map();
function throttle(req, res, next) {
  const now = Date.now();
  for (const [key, record] of attempts) if (record.until <= now) attempts.delete(key);
  const key = req.ip + ':' + req.path;
  let record = attempts.get(key);
  if (!record) {
    if (attempts.size >= 10000) return res.status(429).json({ error: 'Please try again later.' });
    record = { count: 0, until: now + 15 * 60 * 1000 }; attempts.set(key, record);
  }
  if (++record.count > 15) { res.setHeader('Retry-After', Math.ceil((record.until - now) / 1000)); return res.status(429).json({ error: 'Too many attempts. Please try again in 15 minutes.' }); }
  next();
}
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.CROSS_SITE_COOKIES === 'true' ? 'none' : 'lax', path: '/', maxAge: 7 * 86400000 };
if (cookieOptions.sameSite === 'none' && !cookieOptions.secure) throw new Error('Cross-site cookies require production HTTPS.');
function sessionResponse(res, user) {
  const token = createToken({ id: user.id, version: user.tokenVersion || 0 });
  res.cookie('roy_session', token, cookieOptions);
  return token;
}
function isOwner(user) {
  return !!user && !!process.env.ADMIN_EMAIL && user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase() && !!(user.adminApproved || user.emailVerifiedAt);
}
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.use(require('./page-renderer.cjs'));

// Serve static files
const publicFiles = new Set(['index.html', 'booking.html', 'signup.html', 'login.html', 'account.html', 'admin.html', 'styles.css', 'styles-new.css', 'forms.css', 'script.js', 'booking.js', 'signup.js', 'login.js', 'account.js', 'admin.js', 'config.js', 'refinements.css', 'portfolio.js', 'auth.js', 'robots.txt']);
publicFiles.add('stories.js');
publicFiles.add('account-menu.js');
const servePublic = express.static(__dirname, { dotfiles: 'deny' });
app.use((req, res, next) => {
  let name;
  try { name = decodeURIComponent(req.path).slice(1); } catch { return res.sendStatus(400); }
  const asset = /^(?:My webproject\/|images\/|videos\/)?[^/]+\.(?:jpe?g|png|webp|svg|mp4|webm|ico)$/i.test(name);
  if (req.path === '/' || publicFiles.has(name) || asset) return servePublic(req, res, next);
  if (req.path.startsWith('/api/')) return next();
  return res.sendStatus(404);
});

const loadData = () => storage.read();
const saveData = data => storage.write(data);

// Nodemailer transporter (uses env vars)
function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

function sendConfirmationEmail(user, token) {
  const transporter = getTransporter();
  if (!transporter) return Promise.resolve();
  const frontend = process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || process.env.FRONTEND_URL || `http://localhost:${PORT}`;
  const confirmUrl = `${frontend}/api/confirm?token=${token}`;
  const mail = {
    from: process.env.SMTP_FROM || 'no-reply@example.com',
    to: user.email,
    subject: 'Confirm your email',
    text: `Hi ${user.name || ''},\n\nPlease confirm your email by visiting: ${confirmUrl}`,
    // Plain text avoids treating customer input as email markup.
  };
  return transporter.sendMail(mail);
}

// Auth helpers
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32 || JWT_SECRET === 'replace_with_a_strong_secret') {
  throw new Error('Set JWT_SECRET to a random secret of at least 32 characters.');
}

function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

async function verifyToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    const user = ((await loadData()).users || []).find(user => user.id === payload.id);
    if (!user || (payload.version || 0) !== (user.tokenVersion || 0)) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

// Public endpoints
app.get('/api/health', asyncRoute(async (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
}));
app.get('/api/ready', asyncRoute(async (req, res) => {
  try { await storage.ready(); res.json({ status: 'ready', storage: storage.engine }); }
  catch (error) { console.error('Storage readiness failed:', error.message); res.status(503).json({ status: 'unavailable' }); }
}));

app.get('/api/signups', adminAuth, asyncRoute(async (req, res) => {
  const data = await loadData();
  res.json(data.signups || []);
}));

app.get('/api/bookings', adminAuth, asyncRoute(async (req, res) => {
  const data = await loadData();
  res.json(data.bookings || []);
}));

// Registration with password -> creates a user and signup entry
app.post('/api/register', throttle, asyncRoute(async (req, res) => {
  const { name, email, phone, password } = req.body || {};
  if (typeof name !== 'string' || !name.trim() || name.length > 200 || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72 || (phone != null && (typeof phone !== 'string' || phone.length > 50))) return res.status(400).json({ error: 'Provide a name, valid email, and password of 8–72 bytes.' });
  const hashed = await bcrypt.hash(password, 10);
  const data = await loadData();
  const existing = (data.users || []).find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) return res.status(400).json({ error: 'User already exists' });

  const token = randomBytes(32).toString('hex');
  const hasSMTP = !!process.env.SMTP_HOST;
  const user = { id: 'u_' + randomUUID(), name, email, phone, password: hashed, emailConfirmed: !hasSMTP, confirmToken: token, confirmExpires: Date.now() + 86400000, tokenVersion: 0, isAdmin: false };
  data.users = data.users || [];
  data.users.push(user);

  // Also keep a lightweight signup record for compatibility
  data.signups = data.signups || [];
  data.signups.push({ id: 's_' + randomUUID(), name, email, phone, createdAt: new Date().toISOString() });

  await saveData(data);

  // Send confirmation email if SMTP configured
  let msg = 'Registered. Please confirm your email.';
  if (hasSMTP) {
    try { await sendConfirmationEmail(user, token); } catch (err) {
      console.warn('Confirmation email delivery failed:', err.message);
      msg = 'Account created, but we could not send the verification email. Use Resend verification email on the login page.';
    }
  } else {
    msg = 'Account created. You can now log in.';
  }

  res.json({ ok: true, message: msg });
}));

app.get('/api/confirm', asyncRoute(async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send('Token required');
  const data = await loadData();
  const user = (data.users || []).find(u => u.confirmToken === token);
  if (!user || !user.confirmExpires || user.confirmExpires < Date.now()) return res.status(400).send('Invalid or expired link. Please resend verification from the login page.');
  user.emailConfirmed = true;
  user.emailVerifiedAt = new Date().toISOString();
  user.confirmToken = null;
  await saveData(data);
  res.send('Email confirmed. You can now log in.');
}));

app.post('/api/login', throttle, asyncRoute(async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) return res.status(400).json({ error: 'Email and password required' });
  const data = await loadData();
  const user = (data.users || []).find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  if (!user.emailConfirmed) return res.status(403).json({ error: 'Email not confirmed' });
  const ok = user.password ? await bcrypt.compare(password, user.password) : false;
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

  const token = sessionResponse(res, user);
  res.json({ ok: true, token });
}));

app.post('/api/logout', asyncRoute(async (req, res) => {
  res.clearCookie('roy_session', { ...cookieOptions, maxAge: undefined });
  res.json({ ok: true });
}));

app.post('/api/resend-confirmation', throttle, asyncRoute(async (req, res) => {
  const email = req.body?.email;
  if (typeof email !== 'string' || email.length > 254) return res.status(400).json({ error: 'Enter your email address.' });
  const data = await loadData();
  const user = data.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  if (user && !user.emailConfirmed && process.env.SMTP_HOST) {
    user.confirmToken = randomBytes(32).toString('hex'); user.confirmExpires = Date.now() + 86400000; await saveData(data);
    try { await sendConfirmationEmail(user, user.confirmToken); } catch (err) { console.warn('Confirmation delivery failed:', err.message); return res.status(503).json({ error: 'Email delivery is temporarily unavailable. Please try again later.' }); }
  }
  res.json({ ok: true, message: 'If this account needs verification, a new link has been sent.' });
}));

// Booking endpoint (public)
app.post('/api/booking', throttle, asyncRoute(async (req, res) => {
  const data = await loadData();
  const input = req.body || {};
  const limits = { name: 200, email: 254, phone: 50, service: 100, date: 10, time: 5, message: 5000, location: 500, priority: 100 };
  for (const [key, limit] of Object.entries(limits)) {
    if (input[key] != null && (typeof input[key] !== 'string' || input[key].length > limit)) return res.status(400).json({ error: 'Invalid ' + key });
  }
  if (!input.name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email || '') || !input.service?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(input.date || '') || !Number.isFinite(Date.parse(input.date)) || new Date(input.date).toISOString().slice(0,10) !== input.date || (input.time && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(input.time))) return res.status(400).json({ error: 'Provide a name, valid email, service, date and valid time.' });
  const entry = Object.fromEntries(Object.keys(limits).map(key => [key, (input[key] || '').trim()]));
  entry.id = 'b_' + randomUUID();
  entry.createdAt = new Date().toISOString();
  entry.status = 'pending';
  if (req.headers.authorization) {
    const [scheme, token] = req.headers.authorization.split(' ');
    const payload = scheme === 'Bearer' && await verifyToken(token);
    if (!payload || !(data.users || []).some(u => u.id === payload.id)) return res.status(401).json({ error: 'Your session expired. Please log in again.' });
    entry.userId = payload.id;
  }
  const requestKey = req.get('Idempotency-Key');
  const requestDigest = createHash('sha256').update(JSON.stringify({ ...Object.fromEntries(Object.keys(limits).map(key => [key, entry[key]])), userId: entry.userId || null })).digest('hex');
  if (requestKey && !/^[a-zA-Z0-9-]{16,100}$/.test(requestKey)) return res.status(400).json({ error: 'Invalid request key' });
  if (requestKey) {
    const existing = (data.bookings || []).find(b => b.requestKey === requestKey);
    if (existing) {
      const existingDigest = existing.requestDigest || createHash('sha256').update(JSON.stringify({ ...Object.fromEntries(Object.keys(limits).map(key => [key, existing[key] || ''])), userId: existing.userId || null })).digest('hex');
      if (existingDigest !== requestDigest) return res.status(409).json({ error: 'This request key belongs to different booking details. Please submit a new request.' });
      return res.json({ ok: true, reference: existing.id });
    }
    entry.requestKey = requestKey;
    entry.requestDigest = requestDigest;
  }
  data.bookings = data.bookings || [];
  data.bookings.push(entry);
  await saveData(data);
  res.status(201).json({ ok: true, reference: entry.id });
}));

// Return current user profile (protected)
app.get('/api/me', asyncRoute(async (req, res) => {
  const auth = (req.headers.authorization || '').split(' ');
  if (auth.length !== 2 || auth[0] !== 'Bearer') return res.status(401).json({ error: 'Unauthorized' });
  const payload = await verifyToken(auth[1]);
  if (!payload || !payload.id) return res.status(401).json({ error: 'Unauthorized' });
  const data = await loadData();
  const user = (data.users || []).find(u => u.id === payload.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  // return basic profile and user's bookings
  const bookings = (data.bookings || []).filter(b => b.userId === user.id);
  res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, emailConfirmed: !!user.emailConfirmed, isAdmin: isOwner(user), bookings });
}));

// Update current user profile (protected)
app.put('/api/me', asyncRoute(async (req, res) => {
  const auth = (req.headers.authorization || '').split(' ');
  if (auth.length !== 2 || auth[0] !== 'Bearer') return res.status(401).json({ error: 'Unauthorized' });
  const payload = await verifyToken(auth[1]);
  if (!payload || !payload.id) return res.status(401).json({ error: 'Unauthorized' });
  const { name, phone, password, currentPassword } = req.body || {};
  const newHash = password && typeof password === 'string' && password.length >= 8 && Buffer.byteLength(password) <= 72 ? await bcrypt.hash(password, 10) : null;
  const data = await loadData();
  const user = (data.users || []).find(u => u.id === payload.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (password && (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72)) return res.status(400).json({ error: 'Password must be at least 8 characters and at most 72 bytes.' });
  if ((name != null && (typeof name !== 'string' || name.length > 200)) || (phone != null && (typeof phone !== 'string' || phone.length > 50))) return res.status(400).json({ error: 'Invalid profile fields' });
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if ((payload.version || 0) !== (user.tokenVersion || 0)) return res.status(401).json({ error: 'Please log in again.' });
  if (password) {
    if (typeof currentPassword !== 'string' || !bcrypt.compareSync(currentPassword, user.password)) return res.status(400).json({ error: 'Enter your current password to change it.' });
    user.password = newHash; user.tokenVersion = (user.tokenVersion || 0) + 1;
  }
  await saveData(data);
  sessionResponse(res, user);
  res.json({ ok: true });
}));

// Middleware: protect admin routes
function adminAuth(req, res, next) {
  return asyncRoute(async (req, res, next) => {
  const auth = req.headers.authorization || '';
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Unauthorized' });
  const payload = await verifyToken(parts[1]);
  const user = payload && ((await loadData()).users || []).find(u => u.id === payload.id);
  if (!user || !user.emailConfirmed || !isOwner(user)) return res.status(403).json({ error: 'Forbidden' });
  req.user = payload;
  next();
  })(req, res, next);
}

// Protected admin endpoints
app.get('/api/admin/summary', adminAuth, asyncRoute(async (req, res) => {
  const data = await loadData();
  const bookings = data.bookings || [];
  res.json({ total: bookings.length, pending: bookings.filter(b => b.status === 'pending').length, confirmed: bookings.filter(b => b.status === 'confirmed').length, clients: (data.users || []).length });
}));

app.use('/api/admin', (req, res, next) => {
  for (const value of Object.values(req.query)) if (typeof value !== 'string') return res.status(400).json({ error: 'Invalid filter' });
  next();
});
app.get('/api/admin/signups', adminAuth, asyncRoute(async (req, res) => {
  const data = await loadData();
  res.json(data.signups || []);
}));

app.get('/api/admin/bookings', adminAuth, asyncRoute(async (req, res) => {
  const data = await loadData();
  let list = data.bookings || [];
  const { search, status, page = 1, limit = 20, start, end } = req.query;
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(b => (b.email && b.email.toLowerCase().includes(q)) || (b.name && b.name.toLowerCase().includes(q)) || (b.service && b.service.toLowerCase().includes(q)) || (b.message && b.message.toLowerCase().includes(q)));
  }
  if (status) {
    list = list.filter(b => b.status === status);
  }
  // Date range filter (createdAt or date field)
  if (start || end) {
    const s = start ? new Date(start) : null;
    const e = end ? new Date(end) : null;
    list = list.filter(b => {
      const t = b.createdAt ? new Date(b.createdAt) : (b.date ? new Date(b.date) : null);
      if (!t) return false;
      if (s && t < s) return false;
      if (e && t > e) return false;
      return true;
    });
  }
  // sort by createdAt desc
  list = list.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  const p = Number(page);
  const l = Number(limit);
  if (!Number.isInteger(p) || p < 1 || !Number.isInteger(l) || l < 1 || l > 100) return res.status(400).json({ error: 'Invalid page or limit. Limit must be between 1 and 100.' });
  const offset = (p-1)*l;
  const paged = list.slice(offset, offset + l);
  res.json({ total: list.length, page: p, limit: l, items: paged });
}));

// Bulk actions for bookings: change status or delete
app.post('/api/admin/bookings/bulk', adminAuth, asyncRoute(async (req, res) => {
  const { ids, action, status } = req.body || {};
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids required' });
  if (ids.length > 100 || ids.some(id => typeof id !== 'string')) return res.status(400).json({ error: 'Provide at most 100 booking IDs.' });
  const data = await loadData();
  if (action === 'delete') {
    const before = (data.bookings || []).length;
    data.bookings = (data.bookings || []).filter(b => !ids.includes(b.id));
    await saveData(data);
    return res.json({ ok: true, deleted: before - data.bookings.length });
  }
  if (action === 'status') {
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) return res.status(400).json({ error: 'Invalid booking status' });
    let updated = 0;
    (data.bookings || []).forEach(b => {
      if (ids.includes(b.id)) { b.status = status || b.status; updated++; }
    });
    await saveData(data);
    return res.json({ ok: true, updated });
  }
  res.status(400).json({ error: 'Invalid action' });
}));

// Export CSV for filtered bookings
app.get('/api/admin/export/bookings', adminAuth, asyncRoute(async (req, res) => {
  const data = await loadData();
  let list = data.bookings || [];
  const { search, status, start, end } = req.query;
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(b => (b.email && b.email.toLowerCase().includes(q)) || (b.name && b.name.toLowerCase().includes(q)) || (b.service && b.service.toLowerCase().includes(q)) || (b.message && b.message.toLowerCase().includes(q)));
  }
  if (status) list = list.filter(b => b.status === status);
  if (start || end) {
    const s = start ? new Date(start) : null;
    const e = end ? new Date(end) : null;
    list = list.filter(b => {
      const t = b.createdAt ? new Date(b.createdAt) : (b.date ? new Date(b.date) : null);
      if (!t) return false;
      if (s && t < s) return false;
      if (e && t > e) return false;
      return true;
    });
  }
  // build CSV
  const keys = ['id','name','email','phone','service','date','time','status','message','createdAt'];
  const rows = [keys.join(',')];
  list.forEach(it => {
    rows.push(keys.map(k => {
      let value = (it[k] || '').toString();
      if (/^[\s]*[=+@-]/.test(value)) value = "'" + value;
      return '"' + value.replace(/"/g, '""') + '"';
    }).join(','));
  });
  const csv = rows.join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="bookings-export.csv"');
  res.send(csv);
}));

// Get user details and their bookings
app.get('/api/admin/user/:id', adminAuth, asyncRoute(async (req, res) => {
  const id = req.params.id;
  const data = await loadData();
  const user = (data.users || []).find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const bookings = (data.bookings || []).filter(b => b.userId === user.id);
  res.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, emailConfirmed: !!user.emailConfirmed, isAdmin: !!user.isAdmin }, bookings });
}));

// Update booking status
app.post('/api/admin/booking/:id/status', adminAuth, asyncRoute(async (req, res) => {
  const id = req.params.id;
  const { status } = req.body || {};
  if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) return res.status(400).json({ error: 'Invalid booking status' });
  const data = await loadData();
  const bookings = data.bookings || [];
  const b = bookings.find(x => x.id === id);
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  b.status = status || b.status;
  await saveData(data);
  res.json({ ok: true, booking: b });
}));

// Delete booking
app.delete('/api/admin/booking/:id', adminAuth, asyncRoute(async (req, res) => {
  const id = req.params.id;
  const data = await loadData();
  data.bookings = (data.bookings || []).filter(x => x.id !== id);
  await saveData(data);
  res.json({ ok: true });
}));

// Delete signup
app.delete('/api/admin/signup/:id', adminAuth, asyncRoute(async (req, res) => {
  const id = req.params.id;
  const data = await loadData();
  data.signups = (data.signups || []).filter(x => x.id !== id);
  await saveData(data);
  res.json({ ok: true });
}));

app.use('/api', (req, res) => res.status(404).json({ error: 'API endpoint not found.' }));
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status([400, 409, 413].includes(err.status) ? err.status : 500).json({ error: err.status === 400 ? 'Invalid request body.' : err.status === 409 ? err.message : 'Unable to save or load your request. Please try again.' });
});

if (require.main === module) {
  (async () => {
  await storage.ready();
  if (await require('./bootstrap-owner.cjs').bootstrapOwner(storage)) console.log('Private owner account initialized. Remove ADMIN_BOOTSTRAP_PASSWORD after verifying access.');
  const listener = app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
  const shutdown = () => {
    listener.close(async () => { await storage.close(); process.exit(0); });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
  })().catch(async error => { console.error('Backend startup failed:', error.message); await storage.close(); process.exitCode = 1; });
}
module.exports = app;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

const DATA_FILE = path.join(__dirname, 'data.json');

function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initial = { users: [], signups: [], bookings: [] };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load data file:', err);
    return { users: [], signups: [], bookings: [] };
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to save data file:', err);
  }
}

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
  const frontend = process.env.FRONTEND_URL || `http://localhost:${PORT}`;
  const confirmUrl = `${frontend}/api/confirm?token=${token}`;
  const mail = {
    from: process.env.SMTP_FROM || 'no-reply@example.com',
    to: user.email,
    subject: 'Confirm your email',
    text: `Hi ${user.name || ''},\n\nPlease confirm your email by visiting: ${confirmUrl}`,
    html: `<p>Hi ${user.name || ''},</p><p>Please confirm your email by clicking <a href="${confirmUrl}">Confirm Email</a></p>`
  };
  return transporter.sendMail(mail);
}

// Auth helpers
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

// Public endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get('/api/signups', (req, res) => {
  const data = loadData();
  res.json(data.signups || []);
});

app.get('/api/bookings', (req, res) => {
  const data = loadData();
  res.json(data.bookings || []);
});

// Registration with password -> creates a user and signup entry
app.post('/api/register', async (req, res) => {
  const { name, email, phone, password } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email required' });
  const data = loadData();
  const existing = (data.users || []).find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) return res.status(400).json({ error: 'User already exists' });

  const hashed = password ? await bcrypt.hash(password, 10) : null;
  const token = Math.random().toString(36).substr(2, 20) + Date.now();
  const hasSMTP = !!process.env.SMTP_HOST;
  const user = { id: 'u_' + Date.now(), name, email, phone, password: hashed, emailConfirmed: !hasSMTP, confirmToken: token, isAdmin: false };
  data.users = data.users || [];
  data.users.push(user);

  // Also keep a lightweight signup record for compatibility
  data.signups = data.signups || [];
  data.signups.push({ id: 's_' + Date.now(), name, email, phone, createdAt: new Date().toISOString() });

  saveData(data);

  // Send confirmation email if SMTP configured
  let msg = 'Registered. Please confirm your email.';
  if (hasSMTP) {
    try {
      await sendConfirmationEmail(user, token);
    } catch (err) {
      console.warn('Failed to send confirmation email:', err && err.message);
    }
  } else {
    msg = 'Registered and auto-confirmed (local mode). You can now log in.';
  }

  res.json({ ok: true, message: msg });
});

app.get('/api/confirm', (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send('Token required');
  const data = loadData();
  const user = (data.users || []).find(u => u.confirmToken === token);
  if (!user) return res.status(400).send('Invalid token');
  user.emailConfirmed = true;
  user.confirmToken = null;
  saveData(data);
  res.send('Email confirmed. You can now log in.');
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const data = loadData();
  const user = (data.users || []).find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  if (!user.emailConfirmed) return res.status(403).json({ error: 'Email not confirmed' });
  const ok = user.password ? await bcrypt.compare(password, user.password) : false;
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

  // mark admin if matches ADMIN_EMAIL
  if (process.env.ADMIN_EMAIL && user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()) {
    user.isAdmin = true;
    saveData(data);
  }

  const token = createToken({ id: user.id, email: user.email, isAdmin: !!user.isAdmin });
  res.json({ ok: true, token });
});

// Booking endpoint (public)
app.post('/api/booking', (req, res) => {
  const data = loadData();
  const entry = req.body;
  entry.id = entry.id || ('b_' + Date.now());
  entry.createdAt = entry.createdAt || new Date().toISOString();
  entry.status = entry.status || 'pending';
  // If Authorization header provided and valid, attach userId
  const auth = (req.headers.authorization || '').split(' ');
  if (auth.length === 2 && auth[0] === 'Bearer') {
    const payload = verifyToken(auth[1]);
    if (payload && payload.id) entry.userId = payload.id;
  }
  data.bookings = data.bookings || [];
  data.bookings.push(entry);
  saveData(data);
  res.json({ ok: true, entry });
});

// Return current user profile (protected)
app.get('/api/me', (req, res) => {
  const auth = (req.headers.authorization || '').split(' ');
  if (auth.length !== 2 || auth[0] !== 'Bearer') return res.status(401).json({ error: 'Unauthorized' });
  const payload = verifyToken(auth[1]);
  if (!payload || !payload.id) return res.status(401).json({ error: 'Unauthorized' });
  const data = loadData();
  const user = (data.users || []).find(u => u.id === payload.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  // return basic profile and user's bookings
  const bookings = (data.bookings || []).filter(b => b.userId === user.id);
  res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, emailConfirmed: !!user.emailConfirmed, bookings });
});

// Update current user profile (protected)
app.put('/api/me', async (req, res) => {
  const auth = (req.headers.authorization || '').split(' ');
  if (auth.length !== 2 || auth[0] !== 'Bearer') return res.status(401).json({ error: 'Unauthorized' });
  const payload = verifyToken(auth[1]);
  if (!payload || !payload.id) return res.status(401).json({ error: 'Unauthorized' });
  const { name, phone, password } = req.body || {};
  const data = loadData();
  const user = (data.users || []).find(u => u.id === payload.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (password) user.password = await bcrypt.hash(password, 10);
  saveData(data);
  res.json({ ok: true });
});

// Middleware: protect admin routes
function adminAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Unauthorized' });
  const payload = verifyToken(parts[1]);
  if (!payload || !payload.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  req.user = payload;
  next();
}

// Protected admin endpoints
app.get('/api/admin/signups', adminAuth, (req, res) => {
  const data = loadData();
  res.json(data.signups || []);
});

app.get('/api/admin/bookings', adminAuth, (req, res) => {
  const data = loadData();
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
  const p = Math.max(1, parseInt(page,10));
  const l = Math.max(1, parseInt(limit,10));
  const start = (p-1)*l;
  const paged = list.slice(start, start + l);
  res.json({ total: list.length, page: p, limit: l, items: paged });
});

// Bulk actions for bookings: change status or delete
app.post('/api/admin/bookings/bulk', adminAuth, (req, res) => {
  const { ids, action, status } = req.body || {};
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids required' });
  const data = loadData();
  if (action === 'delete') {
    const before = (data.bookings || []).length;
    data.bookings = (data.bookings || []).filter(b => !ids.includes(b.id));
    saveData(data);
    return res.json({ ok: true, deleted: before - data.bookings.length });
  }
  if (action === 'status') {
    let updated = 0;
    (data.bookings || []).forEach(b => {
      if (ids.includes(b.id)) { b.status = status || b.status; updated++; }
    });
    saveData(data);
    return res.json({ ok: true, updated });
  }
  res.status(400).json({ error: 'Invalid action' });
});

// Export CSV for filtered bookings
app.get('/api/admin/export/bookings', adminAuth, (req, res) => {
  const data = loadData();
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
    rows.push(keys.map(k => '"' + ((it[k] || '').toString().replace(/"/g,'""')) + '"').join(','));
  });
  const csv = rows.join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="bookings-export.csv"');
  res.send(csv);
});

// Get user details and their bookings
app.get('/api/admin/user/:id', adminAuth, (req, res) => {
  const id = req.params.id;
  const data = loadData();
  const user = (data.users || []).find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const bookings = (data.bookings || []).filter(b => b.userId === user.id);
  res.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, emailConfirmed: !!user.emailConfirmed, isAdmin: !!user.isAdmin }, bookings });
});

// Update booking status
app.post('/api/admin/booking/:id/status', adminAuth, (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  const data = loadData();
  const bookings = data.bookings || [];
  const b = bookings.find(x => x.id === id);
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  b.status = status || b.status;
  saveData(data);
  res.json({ ok: true, booking: b });
});

// Delete booking
app.delete('/api/admin/booking/:id', adminAuth, (req, res) => {
  const id = req.params.id;
  const data = loadData();
  data.bookings = (data.bookings || []).filter(x => x.id !== id);
  saveData(data);
  res.json({ ok: true });
});

// Delete signup
app.delete('/api/admin/signup/:id', adminAuth, (req, res) => {
  const id = req.params.id;
  const data = loadData();
  data.signups = (data.signups || []).filter(x => x.id !== id);
  saveData(data);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Secrets are supplied only through environment variables. Stop the server for legacy JSON mode.
require('dotenv').config();
const { createStorage } = require('../storage.cjs');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 12 || Buffer.byteLength(password) > 72) {
  console.error('Set ADMIN_EMAIL and a private ADMIN_PASSWORD of at least 12 characters and at most 72 bytes. Stop the server if using legacy JSON storage.');
  process.exit(1);
}
const storage = createStorage();
const data = storage.read();
if (data.users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
  console.error('This email already has an account. Verify it through SMTP or review the existing account before provisioning an administrator.');
  storage.close();
  process.exit(1);
}
data.users.push({ id: 'u_' + randomUUID(), name: 'Roy', email, password: bcrypt.hashSync(password, 12), emailConfirmed: true, adminApproved: true, tokenVersion: 0 });
storage.write(data);
storage.close();
console.log('Administrator created. Remove ADMIN_PASSWORD from the environment after setup.');

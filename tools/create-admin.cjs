// Run with the server stopped. Secrets are supplied only through environment variables.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 12 || Buffer.byteLength(password) > 72) {
  console.error('Set ADMIN_EMAIL and a private ADMIN_PASSWORD of at least 12 characters and at most 72 bytes. Stop the server before running this command.');
  process.exit(1);
}
const file = process.env.DATA_FILE || path.join(__dirname, '..', 'data.json');
const data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { users: [], signups: [], bookings: [] };
if (data.users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
  console.error('This email already has an account. Verify it through SMTP or review the existing account before provisioning an administrator.');
  process.exit(1);
}
data.users.push({ id: 'u_' + randomUUID(), name: 'Roy', email, password: bcrypt.hashSync(password, 12), emailConfirmed: true, adminApproved: true, tokenVersion: 0 });
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file + '.tmp', JSON.stringify(data, null, 2));
fs.renameSync(file + '.tmp', file);
console.log('Administrator created. Remove ADMIN_PASSWORD from the environment after setup.');

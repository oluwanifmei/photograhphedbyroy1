const bcrypt = require('bcryptjs');
const { randomUUID } = require('node:crypto');
async function bootstrapOwner(storage, { email = process.env.ADMIN_EMAIL, password = process.env.ADMIN_BOOTSTRAP_PASSWORD } = {}) {
  if (!password) return false;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12 || Buffer.byteLength(password) > 72) throw new Error('Owner setup requires ADMIN_EMAIL and a private password of 12 characters to 72 bytes.');
  const hash = await bcrypt.hash(password, 12);
  for (let attempt = 0; attempt < 20; attempt++) {
    const records = await storage.read();
    const existing = records.users.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      if (!existing.adminApproved && !existing.emailVerifiedAt) throw new Error('Owner email already exists without verification. Review the existing account before owner setup.');
      return false;
    }
    records.users.push({ id: 'u_' + randomUUID(), name: 'Roy', email, password: hash, emailConfirmed: true, adminApproved: true, tokenVersion: 0 });
    try { await storage.write(records); return true; }
    catch (error) { if (!error.storageConflict || attempt === 19) throw error; }
  }
}
module.exports = { bootstrapOwner };

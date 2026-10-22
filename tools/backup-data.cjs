require('dotenv').config();
const { createStorage } = require('../storage.cjs');
if (!process.env.BACKUP_FILE) throw new Error('Set BACKUP_FILE to a new private backup filename outside the website.');
(async () => {
const storage = createStorage();
try {
  await storage.ready();
  console.log('Customer database backup created:', await storage.backup(process.env.BACKUP_FILE));
} finally { await storage.close(); }

})().catch(error => { console.error(error.message); process.exitCode = 1; });

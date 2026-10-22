require('dotenv').config();
const { createStorage } = require('../storage.cjs');
if (!process.env.BACKUP_FILE) throw new Error('Set BACKUP_FILE to a new private backup filename outside the website.');
const storage = createStorage();
try {
  storage.ready();
  console.log('Customer database backup created:', storage.backup(process.env.BACKUP_FILE));
} finally { storage.close(); }

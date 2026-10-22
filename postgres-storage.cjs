const fs = require('node:fs');
const path = require('node:path');
const { revision, validate, conflict } = require('./storage.cjs');
function poolOptions(databaseURL) {
  const url = new URL(databaseURL);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('DATABASE_URL must be a PostgreSQL connection string.');
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  for (const key of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert', 'channel_binding']) url.searchParams.delete(key);
  return { connectionString: url.href, ssl: local ? false : { rejectUnauthorized: true }, enableChannelBinding: true, max: 3, idleTimeoutMillis: 10000, connectionTimeoutMillis: 15000, statement_timeout: 15000, application_name: 'photographed-by-roy' };
}
function createPostgresStorage({ databaseURL, pool: suppliedPool, dataFile } = {}) {
  const pool = suppliedPool || new (require('pg').Pool)(poolOptions(databaseURL));
  pool.on?.('error', error => console.error('Database pool unavailable:', error.code || 'connection error'));
  let initialized;
  function initialize() {
    if (!initialized) initialized = (async () => {
      await pool.query('CREATE TABLE IF NOT EXISTS roy_app_state (id INTEGER PRIMARY KEY CHECK (id = 1), revision BIGINT NOT NULL, content JSONB NOT NULL)');
      const existing = await pool.query('SELECT id FROM roy_app_state WHERE id = 1');
      if (!existing.rowCount) {
        const legacy = dataFile || process.env.DATA_FILE || path.join(__dirname, 'data.json');
        const seed = fs.existsSync(legacy) ? validate(JSON.parse(fs.readFileSync(legacy, 'utf8'))) : { users: [], signups: [], bookings: [] };
        await pool.query('INSERT INTO roy_app_state (id, revision, content) VALUES (1, 0, $1::jsonb) ON CONFLICT (id) DO NOTHING', [JSON.stringify(seed)]);
      }
    })().catch(error => { initialized = null; throw error; });
    return initialized;
  }
  async function read() {
    await initialize();
    const result = await pool.query('SELECT revision, content FROM roy_app_state WHERE id = 1');
    const row = result.rows[0];
    if (!row) throw new Error('Customer database state is missing.');
    const data = validate(row.content);
    Object.defineProperty(data, revision, { value: row.revision, writable: true });
    return data;
  }
  async function write(data) {
    validate(data);
    if (data[revision] == null) throw new Error('Read the latest records before saving.');
    await initialize();
    const result = await pool.query('UPDATE roy_app_state SET content = $1::jsonb, revision = revision + 1 WHERE id = 1 AND revision = $2 RETURNING revision', [JSON.stringify(data), data[revision]]);
    if (result.rowCount !== 1) throw conflict();
    data[revision] = result.rows[0].revision;
  }
  return { read, write, engine: 'postgres', async ready() { await read(); return true; }, async close() { await pool.end(); }, async backup(destination) {
    const target = path.resolve(destination);
    const data = await read();
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(data, null, 2), { flag: 'wx', mode: 0o600 });
    return target;
  } };
}
module.exports = { createPostgresStorage, poolOptions };

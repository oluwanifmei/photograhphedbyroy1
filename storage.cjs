const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const revision = Symbol('storageRevision');
const empty = () => ({ users: [], signups: [], bookings: [] });
function validate(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid customer database.');
  for (const key of ['users', 'signups', 'bookings']) {
    if (data[key] == null) data[key] = [];
    if (!Array.isArray(data[key])) throw new Error('Invalid customer database collection: ' + key);
  }
  return data;
}
function conflict() {
  return Object.assign(new Error('Records changed during this request. Please retry.'), { status: 409, storageConflict: true });
}

function createStorage(options = {}) {
  const databaseURL = options.databaseURL || (!options.databaseFile && !options.dataFile && process.env.DATABASE_URL);
  if (databaseURL) return require('./postgres-storage.cjs').createPostgresStorage({ ...options, databaseURL });
  const databaseFile = options.databaseFile || process.env.DATABASE_FILE;
  const legacyFile = options.dataFile || process.env.DATA_FILE || path.join(__dirname, 'data.json');
  // An explicitly configured DATA_FILE retains compatibility with existing JSON installations.
  const jsonMode = !databaseFile && !!(options.dataFile || process.env.DATA_FILE);
  const file = path.resolve(jsonMode ? legacyFile : databaseFile || path.join(__dirname, 'data', 'roy.sqlite'));
  let db;
  function connect() {
    if (db) return db;
    const { DatabaseSync } = require('node:sqlite');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const connection = new DatabaseSync(file, { timeout: 5000 });
    try {
      connection.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK (id = 1), revision INTEGER NOT NULL, content TEXT NOT NULL CHECK (json_valid(content)));');
      connection.exec('BEGIN IMMEDIATE');
      if (!connection.prepare('SELECT id FROM app_state WHERE id = 1').get()) {
        const seed = fs.existsSync(legacyFile) ? validate(JSON.parse(fs.readFileSync(legacyFile, 'utf8'))) : empty();
        connection.prepare('INSERT INTO app_state (id, revision, content) VALUES (1, 0, ?)').run(JSON.stringify(seed));
      }
      connection.exec('COMMIT');
      db = connection;
      return db;
    } catch (error) {
      if (connection.isTransaction) connection.exec('ROLLBACK');
      connection.close();
      throw error;
    }
  }
  function read() {
    let data, version;
    if (jsonMode) {
      if (!fs.existsSync(file)) {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        // Exclusive creation cannot replace a database created by another process.
        try { fs.writeFileSync(file, JSON.stringify(empty()), { flag: 'wx', mode: 0o600 }); }
        catch (error) { if (error.code !== 'EEXIST') throw error; }
      }
      const raw = fs.readFileSync(file, 'utf8');
      data = validate(JSON.parse(raw)); version = createHash('sha256').update(raw).digest('hex');
    } else {
      const record = connect().prepare('SELECT revision, content FROM app_state WHERE id = 1').get();
      if (!record) throw new Error('Customer database state is missing.');
      data = validate(JSON.parse(record.content)); version = record.revision;
    }
    Object.defineProperty(data, revision, { value: version, writable: true });
    return data;
  }
  function write(data) {
    validate(data);
    if (data[revision] == null) throw new Error('Read the latest records before saving.');
    const content = JSON.stringify(data);
    if (jsonMode) {
      const current = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
      if (current !== data[revision]) throw conflict();
      const descriptor = fs.openSync(file + '.tmp', 'w', 0o600);
      try { fs.writeFileSync(descriptor, content); fs.fsyncSync(descriptor); }
      finally { fs.closeSync(descriptor); }
      fs.renameSync(file + '.tmp', file);
      data[revision] = createHash('sha256').update(content).digest('hex');
    } else {
      const result = connect().prepare('UPDATE app_state SET content = ?, revision = revision + 1 WHERE id = 1 AND revision = ?').run(content, data[revision]);
      if (result.changes !== 1) throw conflict();
      data[revision]++;
    }
  }
  return {
    read, write, engine: jsonMode ? 'json' : 'sqlite',
    ready() { read(); return true; },
    close() { if (db) { db.close(); db = null; } },
    backup(destination) {
      const target = path.resolve(destination);
      if (target === file || fs.existsSync(target)) throw new Error('Choose a new backup filename.');
      fs.mkdirSync(path.dirname(target), { recursive: true });
      if (jsonMode) fs.copyFileSync(file, target, fs.constants.COPYFILE_EXCL);
      else connect().prepare('VACUUM INTO ?').run(target);
      return target;
    }
  };
}
module.exports = { createStorage, revision, validate, conflict };

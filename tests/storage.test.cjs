const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createStorage } = require('../storage.cjs');

test('SQLite preserves legacy records, detects stale writes and creates a consistent backup', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'roy-sqlite-'));
  const legacy = path.join(directory, 'legacy.json');
  const original = JSON.stringify({ users: [{ id: 'existing', email: 'owner@example.com', password: 'retained-hash' }], signups: [], bookings: [{ id: 'old-booking', status: 'confirmed' }] });
  fs.writeFileSync(legacy, original);
  const databaseFile = path.join(directory, 'roy.sqlite');
  const first = createStorage({ databaseFile, dataFile: legacy });
  const second = createStorage({ databaseFile, dataFile: legacy });
  let restored;
  t.after(() => { first.close(); second.close(); restored?.close(); fs.rmSync(directory, { recursive: true, force: true }); });
  const one = first.read(), stale = second.read();
  one.bookings.push({ id: 'new-booking', status: 'pending' }); first.write(one);
  stale.bookings.push({ id: 'stale-booking' });
  assert.throws(() => second.write(stale), error => error.status === 409);
  assert.equal(second.read().bookings.length, 2);
  assert.equal(fs.readFileSync(legacy, 'utf8'), original);
  const backup = path.join(directory, 'backup.sqlite'); first.backup(backup);
  assert.throws(() => first.backup(backup), /new backup filename/);
  first.close(); second.close();
  restored = createStorage({ databaseFile: backup, dataFile: legacy });
  assert.deepEqual(restored.read().bookings.map(booking => booking.id), ['old-booking', 'new-booking']);
  assert.equal(restored.read().users[0].password, 'retained-hash');
  // Reopening an initialized database never imports the old JSON again.
  fs.writeFileSync(legacy, 'corrupt');
  assert.equal(first.read().bookings.length, 2);
});

test('corrupt legacy data is never replaced with an empty SQLite database', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'roy-corrupt-'));
  const legacy = path.join(directory, 'legacy.json'); fs.writeFileSync(legacy, 'corrupt');
  const storage = createStorage({ databaseFile: path.join(directory, 'roy.sqlite'), dataFile: legacy });
  t.after(() => { storage.close(); fs.rmSync(directory, { recursive: true, force: true }); });
  assert.throws(() => storage.read());
  assert.throws(() => storage.ready());
  assert.equal(fs.readFileSync(legacy, 'utf8'), 'corrupt');
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createPostgresStorage, poolOptions } = require('../postgres-storage.cjs');
const { bootstrapOwner } = require('../bootstrap-owner.cjs');
class TestPool {
  constructor() { this.record = null; this.closed = false; }
  async query(sql, values = []) {
    await new Promise(setImmediate);
    if (sql.startsWith('CREATE TABLE')) return { rows: [], rowCount: 0 };
    if (sql.startsWith('INSERT')) { this.record ||= { revision: '0', content: JSON.parse(values[0]) }; return { rows: [], rowCount: 1 }; }
    if (sql.startsWith('SELECT')) return { rows: this.record ? [structuredClone(this.record)] : [], rowCount: this.record ? 1 : 0 };
    if (sql.startsWith('UPDATE')) {
      if (this.record.revision !== String(values[1])) return { rows: [], rowCount: 0 };
      this.record = { revision: String(Number(this.record.revision) + 1), content: JSON.parse(values[0]) };
      return { rows: [{ revision: this.record.revision }], rowCount: 1 };
    }
    throw new Error('Unexpected query');
  }
  async end() { this.closed = true; }
}
test('Postgres adapter uses async versioned writes and refuses stale updates', async () => {
  const pool = new TestPool(); const store = createPostgresStorage({ pool });
  const first = await store.read(), stale = await store.read();
  first.bookings.push({ id: 'retained', name: 'Sample' }); await store.write(first);
  stale.bookings.push({ id: 'overwriting' });
  await assert.rejects(store.write(stale), error => error.storageConflict && error.status === 409);
  assert.deepEqual((await store.read()).bookings.map(item => item.id), ['retained']);
  assert.equal(await store.ready(), true); await store.close(); assert.equal(pool.closed, true);
});
test('Postgres connections verify certificates even if URI asks to disable SSL', () => {
  const options = poolOptions('postgresql://user:password@sample.neon.tech/roy?sslmode=disable&channel_binding=require');
  assert.equal(options.ssl.rejectUnauthorized, true); assert.equal(options.enableChannelBinding, true);
  assert.doesNotMatch(options.connectionString, /sslmode|channel_binding/);
  assert.throws(() => poolOptions('https://example.com/'), /PostgreSQL/);
});
test('owner bootstrap hashes its secret and cannot overwrite or elevate an existing unverified account', async () => {
  const store = createPostgresStorage({ pool: new TestPool() });
  const settings = { email: 'owner@example.com', password: 'private-test-password-123' };
  assert.equal(await bootstrapOwner(store, settings), true);
  const original = (await store.read()).users[0];
  assert.equal(original.adminApproved, true); assert.notEqual(original.password, settings.password);
  assert.equal(await bootstrapOwner(store, { ...settings, password: 'different-test-password-456' }), false);
  assert.equal((await store.read()).users[0].password, original.password);
  const records = await store.read(); records.users.push({ email: 'unverified@example.com', password: 'existing-hash' }); await store.write(records);
  await assert.rejects(bootstrapOwner(store, { ...settings, email: 'unverified@example.com' }), /without verification/);
  await store.close();
});

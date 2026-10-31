const path = require('node:path');
const fs = require('node:fs');
function createAnalytics(options = {}) {
  const url = options.databaseURL ?? process.env.DATABASE_URL;
  let pool, db, ready;
  async function query(sql, values = []) {
    if (url) {
      if (!pool) { pool = new (require('pg').Pool)(require('./postgres-storage.cjs').poolOptions(url)); pool.on('error', () => {}); }
      let index = 0;
      return (await pool.query(sql.replace(/\?/g, () => '$' + (++index)), values)).rows;
    }
    if (!db) {
      const file = options.file || path.join(path.dirname(process.env.DATABASE_FILE || process.env.DATA_FILE || path.join(__dirname, 'data', 'roy.sqlite')), 'analytics.sqlite');
      fs.mkdirSync(path.dirname(file), { recursive: true });
      db = new (require('node:sqlite').DatabaseSync)(file, { timeout: 5000 });
      db.exec('PRAGMA journal_mode=WAL;');
    }
    return db.prepare(sql).all(...values);
  }
  function initialize() {
    if (!ready) ready = (async () => {
      await query('CREATE TABLE IF NOT EXISTS roy_visits (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, occurred_at TEXT NOT NULL, day TEXT NOT NULL, page TEXT NOT NULL, kind TEXT NOT NULL, device TEXT NOT NULL, source TEXT NOT NULL)');
      await query('CREATE INDEX IF NOT EXISTS roy_visits_day ON roy_visits(day)');
    })().catch(error => { ready = null; throw error; });
    return ready;
  }
  return {
    async record(event) {
      await initialize();
      await query('INSERT INTO roy_visits (id, session_id, occurred_at, day, page, kind, device, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING', [event.id,event.session,event.at,event.at.slice(0,10),event.page,event.kind,event.device,event.source]);
    },
    async report(days = 30, now = new Date()) {
      await initialize();
      const from = new Date(now); from.setUTCDate(from.getUTCDate() - days + 1); const start = from.toISOString().slice(0,10);
      const [totals, daily, pages, actions, devices, sources, first] = await Promise.all([
        query("SELECT COUNT(*) AS views, COUNT(DISTINCT session_id) AS visits FROM roy_visits WHERE day >= ? AND kind = 'pageview'", [start]),
        query("SELECT day, COUNT(*) AS views, COUNT(DISTINCT session_id) AS visits FROM roy_visits WHERE day >= ? AND kind = 'pageview' GROUP BY day ORDER BY day DESC", [start]),
        query("SELECT page, COUNT(*) AS count FROM roy_visits WHERE day >= ? AND kind = 'pageview' GROUP BY page ORDER BY count DESC", [start]),
        query("SELECT kind, COUNT(*) AS count FROM roy_visits WHERE day >= ? AND kind <> 'pageview' GROUP BY kind ORDER BY count DESC", [start]),
        query("SELECT device, COUNT(*) AS count FROM roy_visits WHERE day >= ? AND kind = 'pageview' GROUP BY device ORDER BY count DESC", [start]),
        query("SELECT source, COUNT(*) AS count FROM roy_visits WHERE day >= ? AND kind = 'pageview' GROUP BY source ORDER BY count DESC", [start]),
        query("SELECT MIN(occurred_at) AS first, COUNT(CASE WHEN kind = 'pageview' THEN 1 END) AS views, COUNT(DISTINCT CASE WHEN kind = 'pageview' THEN session_id END) AS visits FROM roy_visits")
      ]);
      const numeric = rows => rows.map(row => Object.fromEntries(Object.entries(row).map(([key,value]) => [key,['count','views','visits'].includes(key) ? Number(value) : value])));
      return { days, start, startedAt: first[0].first, lifetimeViews: Number(first[0].views), lifetimeVisits: Number(first[0].visits), ...numeric(totals)[0], daily: numeric(daily), pages: numeric(pages), actions: numeric(actions), devices: numeric(devices), sources: numeric(sources) };
    },
    async close() { if (pool) await pool.end(); if (db) db.close(); }
  };
}
module.exports = { createAnalytics };

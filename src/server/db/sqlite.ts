// SQLite storage for the Node server (Node 22.13+ built-in `node:sqlite`, no native build).
// The services keep working on the in-memory repository; after every change the server
// writes users, problems and swipes to the database, and loads them back on start-up.
// File location: DB_FILE (default ./data/shymkent-swipe.db).
// Not used by the GitHub Pages demo, which runs the API in the browser.
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { dbRepository } from './repository';

const file = process.env.DB_FILE || path.resolve('data', 'shymkent-swipe.db');
fs.mkdirSync(path.dirname(file), { recursive: true });
const db = new DatabaseSync(file);

db.exec(`
  CREATE TABLE IF NOT EXISTS users    (id TEXT PRIMARY KEY, data TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS problems (id TEXT PRIMARY KEY, data TEXT NOT NULL,
                                       district TEXT, status TEXT, criticality REAL, created_at TEXT);
  CREATE TABLE IF NOT EXISTS swipes   (id TEXT PRIMARY KEY, data TEXT NOT NULL,
                                       user_id TEXT, problem_id TEXT, created_at TEXT,
                                       UNIQUE (user_id, problem_id));
  CREATE INDEX IF NOT EXISTS idx_problems_status_crit ON problems (status, criticality DESC);
  CREATE INDEX IF NOT EXISTS idx_problems_district    ON problems (district, status);
`);

const rows = (table: string) =>
  (db.prepare(`SELECT data FROM ${table}`).all() as { data: string }[]).map((r) => JSON.parse(r.data));

/** Load saved data into the repository, or save the seed data on first run. */
export function loadOrSeed() {
  const users = rows('users');
  if (users.length) {
    dbRepository.importState({ users, problems: rows('problems'), swipes: rows('swipes') });
    console.log(`[db] loaded ${users.length} users from ${file}`);
  } else {
    saveAll();
    console.log(`[db] created ${file} with seed data`);
  }
}

/** Write the whole state in one transaction (the dataset is small: hundreds of rows). */
export function saveAll() {
  const { users, problems, swipes } = dbRepository.exportState();
  const putUser = db.prepare('INSERT OR REPLACE INTO users (id, data) VALUES (?, ?)');
  const putProblem = db.prepare(
    'INSERT OR REPLACE INTO problems (id, data, district, status, criticality, created_at) VALUES (?, ?, ?, ?, ?, ?)',
  );
  const putSwipe = db.prepare(
    'INSERT OR REPLACE INTO swipes (id, data, user_id, problem_id, created_at) VALUES (?, ?, ?, ?, ?)',
  );
  db.exec('BEGIN');
  try {
    db.exec('DELETE FROM swipes; DELETE FROM problems; DELETE FROM users;');
    for (const u of users) putUser.run(u.id, JSON.stringify(u));
    for (const p of problems)
      putProblem.run(p.id, JSON.stringify(p), String(p.district), String(p.status), Number(p.criticalityIndex) || 0, String(p.createdAt ?? ''));
    for (const s of swipes) putSwipe.run(s.id, JSON.stringify(s), s.userId, s.problemId, String(s.createdAt ?? ''));
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

// Aide au diagnostic : affiche les tables, colonnes et un echantillon d'une
// base SQLite QUL (layout ou mots).
//
//   node scripts/inspect-db.mjs scripts/data-src/qpc-v2.db
//   node scripts/inspect-db.mjs scripts/data-src/words.db

import { DatabaseSync } from 'node:sqlite';

const path = process.argv[2];
if (!path) {
  console.error('usage: node scripts/inspect-db.mjs <fichier.db>');
  process.exit(1);
}

const db = new DatabaseSync(path, { readOnly: true });
const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type IN ('table','view')`).all();

for (const { name } of tables) {
  const cols = db.prepare(`PRAGMA table_info("${name}")`).all().map((c) => c.name);
  let count = 0;
  try {
    count = db.prepare(`SELECT COUNT(*) c FROM "${name}"`).get().c;
  } catch {
    /* vue non comptable */
  }
  console.log(`\n== ${name}  (${count} lignes)`);
  console.log('   colonnes :', cols.join(', '));
  try {
    for (const row of db.prepare(`SELECT * FROM "${name}" LIMIT 3`).all()) {
      console.log('   ', JSON.stringify(row));
    }
  } catch {
    /* ignore */
  }
}

db.close();

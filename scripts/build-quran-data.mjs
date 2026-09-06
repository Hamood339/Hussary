// -----------------------------------------------------------------------------
// build-quran-data.mjs
//
// Genere les donnees du Mushaf consommees par l'app :
//   public/quran/meta.json
//   public/quran/pages/001.json .. 604.json
//
// A LANCER UNE SEULE FOIS (puis a chaque mise a jour de la source), et a
// committer le resultat — comme src/data/surahs.ts.
//
//   node scripts/build-quran-data.mjs
//
// ENTREES (voir scripts/README.md) :
//   scripts/data-src/qpc-v2.db     SQLite "KFGQPC V2 layout" de https://qul.tarteel.ai
//                                  (obligatoire — structure des 604 pages / 15 lignes)
//
//   Glyphes des mots (code_v2), au choix :
//   a) scripts/data-src/words.db   SQLite QUL "QPC V2 / mots" (recommande, hors ligne)
//   b) sinon, recuperation automatique via https://api.quran.com/api/v4 (reseau requis)
//
// Le script auto-detecte les noms de tables/colonnes. Ajuste CONFIG si besoin.
// -----------------------------------------------------------------------------

import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const LAYOUT_DB = resolve(__dirname, 'data-src/qpc-v2.db');
const WORDS_DB_CANDIDATES = [
  resolve(__dirname, 'data-src/words.db'),
  resolve(__dirname, 'data-src/qpc-v2-words.db'),
  resolve(__dirname, 'data-src/qpc-words.db'),
];
const OUT_DIR = resolve(ROOT, 'public/quran');
const TOTAL_PAGES = 604;
const META_VERSION = 1;
const API_BASE = 'https://api.quran.com/api/v4';

const CONFIG = {
  layoutTable: ['pages', 'layout', 'mushaf_pages'],
  wordsTable: ['words', 'word', 'qpc_v2_words', 'mushaf_words'],
  layout: {
    page: ['page_number', 'page'],
    line: ['line_number', 'line'],
    type: ['line_type', 'type'],
    centered: ['is_centered', 'centered'],
    firstWord: ['first_word_id', 'first_word', 'from_word_id'],
    lastWord: ['last_word_id', 'last_word', 'to_word_id'],
    surah: ['surah_number', 'sura_number', 'surah', 'sura'],
  },
  word: {
    id: ['id', 'word_id', 'word_index', 'position_id'],
    location: ['location', 'word_key', 'key'],
    surah: ['surah', 'sura', 'surah_number'],
    ayah: ['ayah', 'aya', 'ayah_number', 'verse_number'],
    position: ['word', 'position', 'word_number'],
    glyph: ['code_v2', 'text', 'qpc_v2', 'code', 'glyph'],
    plain: ['text_uthmani', 'uthmani', 'text_imlaei', 'text_plain', 'text_indopak'],
    charType: ['char_type_name', 'char_type'],
  },
};

// --- utilitaires -------------------------------------------------------------
function die(msg) {
  console.error(`\n  ✖ ${msg}\n`);
  process.exit(1);
}
const isBlank = (v) => v === null || v === undefined || v === '';
const toInt = (v) => (isBlank(v) ? null : Number(v));

function openDb(path) {
  return new DatabaseSync(path, { readOnly: true });
}
function tableNames(db) {
  return db.prepare(`SELECT name FROM sqlite_master WHERE type IN ('table','view')`).all().map((r) => r.name);
}
function pickTable(db, candidates) {
  const lower = new Map(tableNames(db).map((n) => [n.toLowerCase(), n]));
  for (const c of candidates) if (lower.has(c)) return lower.get(c);
  return null;
}
function columnsOf(db, table) {
  return db.prepare(`PRAGMA table_info("${table}")`).all().map((r) => r.name);
}
function pickCol(cols, candidates) {
  const lower = new Map(cols.map((n) => [n.toLowerCase(), n]));
  for (const c of candidates) if (lower.has(c)) return lower.get(c);
  return null;
}
function parseLocation(loc) {
  if (typeof loc !== 'string') return null;
  const m = loc.match(/(\d+)\D+(\d+)\D+(\d+)/);
  return m ? { surah: +m[1], ayah: +m[2], position: +m[3] } : null;
}
const isEndType = (t) => {
  const s = String(t ?? '').toLowerCase();
  return s === 'end' || s === 'ayah' || s.includes('ayah-number') || s.includes('end_ayah');
};

// --- 1. Layout -------------------------------------------------------------
if (!existsSync(LAYOUT_DB)) {
  die(
    `Fichier introuvable : scripts/data-src/qpc-v2.db\n` +
      `    Telecharge le layout "KFGQPC V2" depuis https://qul.tarteel.ai/resources/mushaf-layout`
  );
}
const layoutDb = openDb(LAYOUT_DB);
const LT = pickTable(layoutDb, CONFIG.layoutTable) || die(`Table de layout introuvable (${tableNames(layoutDb).join(', ')})`);
const lc = columnsOf(layoutDb, LT);
const L = {
  page: pickCol(lc, CONFIG.layout.page) || die(`Colonne page_number introuvable (${lc.join(', ')})`),
  line: pickCol(lc, CONFIG.layout.line) || die(`Colonne line_number introuvable (${lc.join(', ')})`),
  type: pickCol(lc, CONFIG.layout.type) || die(`Colonne line_type introuvable (${lc.join(', ')})`),
  centered: pickCol(lc, CONFIG.layout.centered),
  firstWord: pickCol(lc, CONFIG.layout.firstWord) || die(`Colonne first_word_id introuvable (${lc.join(', ')})`),
  lastWord: pickCol(lc, CONFIG.layout.lastWord) || die(`Colonne last_word_id introuvable (${lc.join(', ')})`),
  surah: pickCol(lc, CONFIG.layout.surah),
};
const layoutRows = layoutDb
  .prepare(`SELECT * FROM "${LT}" ORDER BY "${L.page}", "${L.line}"`)
  .all()
  .map((r) => ({
    page: Number(r[L.page]),
    line: Number(r[L.line]),
    type: String(r[L.type] ?? 'ayah').toLowerCase(),
    centered: L.centered ? Boolean(toInt(r[L.centered])) : null,
    first: toInt(r[L.firstWord]),
    last: toInt(r[L.lastWord]),
    surah: L.surah ? toInt(r[L.surah]) : null,
  }));
layoutDb.close();

const maxWordId = layoutRows.reduce((m, r) => Math.max(m, r.last ?? 0), 0);
console.log(`  layout : ${LT} — ${layoutRows.length} lignes, ${new Set(layoutRows.map((r) => r.page)).size} pages, ${maxWordId} mots attendus`);

// --- 2. Mots (glyphes) --------------------------------------------------------
function wordMapFromDb(path, table) {
  const db = openDb(path);
  const t = table || pickTable(db, CONFIG.wordsTable) || die(`Table de mots introuvable dans ${path}`);
  const cols = columnsOf(db, t);
  const W = {
    id: pickCol(cols, CONFIG.word.id) || die(`Colonne id introuvable dans ${t} (${cols.join(', ')})`),
    location: pickCol(cols, CONFIG.word.location),
    surah: pickCol(cols, CONFIG.word.surah),
    ayah: pickCol(cols, CONFIG.word.ayah),
    position: pickCol(cols, CONFIG.word.position),
    glyph: pickCol(cols, CONFIG.word.glyph) || die(`Colonne glyphe (code_v2 / text) introuvable dans ${t} (${cols.join(', ')})`),
    plain: pickCol(cols, CONFIG.word.plain),
    charType: pickCol(cols, CONFIG.word.charType),
  };
  const map = new Map();
  for (const row of db.prepare(`SELECT * FROM "${t}"`).all()) {
    const loc = W.location ? parseLocation(row[W.location]) : null;
    map.set(Number(row[W.id]), {
      code: String(row[W.glyph] ?? ''),
      text: W.plain ? String(row[W.plain] ?? '') : '',
      surah: toInt(row[W.surah]) ?? loc?.surah ?? 0,
      ayah: toInt(row[W.ayah]) ?? loc?.ayah ?? 0,
      position: toInt(row[W.position]) ?? loc?.position ?? 0,
      isEnd: W.charType ? isEndType(row[W.charType]) : false,
    });
  }
  db.close();

  // Pas de colonne char_type : le marqueur de fin d'ayah est le dernier
  // glyphe (id le plus grand) de chaque ayah.
  if (!W.charType) {
    const lastIdByAyah = new Map();
    for (const [id, w] of map) {
      const k = `${w.surah}:${w.ayah}`;
      if (id > (lastIdByAyah.get(k) ?? 0)) lastIdByAyah.set(k, id);
    }
    let ends = 0;
    for (const [id, w] of map) {
      if (lastIdByAyah.get(`${w.surah}:${w.ayah}`) === id) {
        w.isEnd = true;
        w.text = '';
        ends += 1;
      }
    }
    console.log(`  mots   : ${path.split(/[/\\]/).pop()} — ${map.size} entrees, ${ends} fins d'ayah`);
  } else {
    console.log(`  mots   : ${path.split(/[/\\]/).pop()} — ${map.size} entrees`);
  }
  return map;
}

async function fetchRetry(url, tries = 4) {
  for (let i = 1; i <= tries; i += 1) {
    try {
      const r = await fetch(url, { headers: { accept: 'application/json' } });
      if (r.ok) return r;
      if (r.status === 429 || r.status >= 500) throw new Error(`HTTP ${r.status}`);
      throw Object.assign(new Error(`HTTP ${r.status}`), { fatal: true });
    } catch (e) {
      if (e.fatal || i === tries) throw e;
      await new Promise((res) => setTimeout(res, 400 * i));
    }
  }
  throw new Error('unreachable');
}

async function wordMapFromApi() {
  console.log('  mots   : aucune base locale — recuperation via api.quran.com …');
  const map = new Map();
  const apiCountByPage = new Map();
  let gid = 0;
  for (let page = 1; page <= TOTAL_PAGES; page += 1) {
    const url =
      `${API_BASE}/verses/by_page/${page}` +
      `?words=true&per_page=300&word_fields=code_v2,text_uthmani,char_type_name`;
    const json = await (await fetchRetry(url)).json();
    if (json.pagination && json.pagination.total_pages > 1) {
      die(`Page ${page} : reponse paginee inattendue (augmente per_page).`);
    }
    let n = 0;
    for (const v of json.verses) {
      const [s, a] = String(v.verse_key).split(':').map(Number);
      let pos = 0;
      for (const w of v.words) {
        gid += 1;
        n += 1;
        const isEnd = isEndType(w.char_type_name);
        if (!isEnd) pos += 1;
        map.set(gid, {
          code: w.code_v2 ?? w.text ?? '',
          text: isEnd ? '' : (w.text_uthmani ?? ''),
          surah: s,
          ayah: a,
          position: isEnd ? 0 : pos,
          isEnd,
        });
      }
    }
    apiCountByPage.set(page, n);
    if (page % 40 === 0 || page === TOTAL_PAGES) console.log(`    …${page}/${TOTAL_PAGES}`);
  }
  return { map, apiCountByPage };
}

let wordMap;
let apiCountByPage = null;
const wordsDbPath = WORDS_DB_CANDIDATES.find(existsSync);
const inlineWordsTable = (() => {
  const db = openDb(LAYOUT_DB);
  const t = pickTable(db, CONFIG.wordsTable);
  db.close();
  return t;
})();

if (wordsDbPath) {
  wordMap = wordMapFromDb(wordsDbPath);
} else if (inlineWordsTable) {
  wordMap = wordMapFromDb(LAYOUT_DB, inlineWordsTable);
} else {
  ({ map: wordMap, apiCountByPage } = await wordMapFromApi());
}

if (wordMap.size < maxWordId) {
  console.warn(
    `  ⚠ ${wordMap.size} mots recuperes pour ${maxWordId} attendus — des pages seront incompletes.`
  );
}

// --- 3. Noms de sourates (reutilise src/data/surahs.ts) ---------------------
function loadSurahNames() {
  const src = readFileSync(resolve(ROOT, 'src/data/surahs.ts'), 'utf8');
  const names = new Map();
  const re = /number:\s*(\d+)[\s\S]*?arabicName:\s*"([^"]+)"[\s\S]*?englishName:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(src))) names.set(+m[1], { arabic: m[2], name: m[3] });
  if (names.size !== 114) die(`Parsing de src/data/surahs.ts : ${names.size} sourates au lieu de 114`);
  return names;
}
const SURAH_NAMES = loadSurahNames();

const JUZ_START_PAGE = [
  1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282, 302, 322,
  342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582,
];
const juzForPage = (page) => {
  let j = 1;
  for (let i = 0; i < JUZ_START_PAGE.length; i += 1) if (page >= JUZ_START_PAGE[i]) j = i + 1;
  return j;
};

// --- 4. Ecriture des pages -------------------------------------------------
mkdirSync(resolve(OUT_DIR, 'pages'), { recursive: true });

const linesByPage = new Map();
for (const row of layoutRows) {
  if (!linesByPage.has(row.page)) linesByPage.set(row.page, []);
  linesByPage.get(row.page).push(row);
}

const surahStartPage = new Map();
const pageIndex = [];
let mismatchPages = 0;
let emptyPages = 0;

for (let page = 1; page <= TOTAL_PAGES; page += 1) {
  const rows = linesByPage.get(page) ?? [];
  if (rows.length === 0) emptyPages += 1;
  const juz = juzForPage(page);
  const surahsOnPage = new Set();
  const lines = [];
  let qulWordCount = 0;

  for (const row of rows) {
    const type =
      row.type.includes('surah') || row.type.includes('sura') || row.type.includes('name')
        ? 'surah_name'
        : row.type.includes('basm') || row.type.includes('bism')
          ? 'basmallah'
          : 'ayah';
    const centered = row.centered ?? type !== 'ayah';
    const line = { line: row.line, type, centered };

    if (type === 'surah_name' && row.surah) {
      line.surah = row.surah;
      surahsOnPage.add(row.surah);
      if (!surahStartPage.has(row.surah)) surahStartPage.set(row.surah, page);
    } else if (type === 'ayah' && row.first != null && row.last != null) {
      const words = [];
      for (let id = row.first; id <= row.last; id += 1) {
        qulWordCount += 1;
        const w = wordMap.get(id);
        if (!w) continue;
        words.push({
          code: w.code,
          text: w.text,
          key: w.isEnd ? undefined : `${w.surah}:${w.ayah}:${w.position}`,
          surah: w.surah,
          ayah: w.ayah,
          ...(w.isEnd ? { isEnd: true } : {}),
        });
        if (w.surah) surahsOnPage.add(w.surah);
      }
      line.words = words;
    } else if (type === 'ayah') {
      line.words = [];
    }
    lines.push(line);
  }

  if (apiCountByPage && apiCountByPage.get(page) !== qulWordCount) {
    mismatchPages += 1;
    if (mismatchPages <= 10) {
      console.warn(`  ⚠ page ${page} : ${qulWordCount} mots (layout) vs ${apiCountByPage.get(page)} (api)`);
    }
  }

  writeFileSync(
    resolve(OUT_DIR, 'pages', `${String(page).padStart(3, '0')}.json`),
    JSON.stringify({ page, juz, lines })
  );
  pageIndex.push({ page, juz, surahs: [...surahsOnPage].sort((a, b) => a - b) });
}

if (emptyPages) console.warn(`  ⚠ ${emptyPages} page(s) sans layout.`);
if (mismatchPages) console.warn(`  ⚠ ${mismatchPages} page(s) avec un nombre de mots divergent — a verifier a l'oeil.`);

// --- 5. meta.json -------------------------------------------------------
writeFileSync(
  resolve(OUT_DIR, 'meta.json'),
  JSON.stringify({
    version: META_VERSION,
    totalPages: TOTAL_PAGES,
    pages: pageIndex,
    surahs: [...SURAH_NAMES.entries()]
      .map(([number, v]) => ({
        number,
        arabicName: v.arabic,
        name: v.name,
        startPage: surahStartPage.get(number) ?? 1,
      }))
      .sort((a, b) => a.number - b.number),
    juz: JUZ_START_PAGE.map((startPage, i) => ({ number: i + 1, startPage })),
  })
);

console.log(`\n  ✓ ${TOTAL_PAGES} pages -> public/quran/pages/`);
console.log(`  ✓ public/quran/meta.json`);
console.log(`  → Polices QCF v2 attendues dans public/quran/fonts/v2/ (QCF2001.woff2 … QCF2604.woff2).\n`);

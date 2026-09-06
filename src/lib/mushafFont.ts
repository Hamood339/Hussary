// Chargement des polices QCF v2 : une police par page (les memes points de code
// PUA designent des glyphes differents d'une page a l'autre), plus les polices
// des bandeaux de sourate et de la basmala.
//
// Si tes fichiers woff2 ont d'autres noms, ajuste fontUrlForPage / *_FONT ici.

const FONT_BASE = '/quran/fonts/v2';

export const SURAH_NAME_FONT = 'QCF-SurahName';
export const BASMALLAH_FONT = 'QCF-Basmallah';

export function fontFamilyForPage(page: number): string {
  return `QCF2P${page}`;
}

// Fichiers du paquet QUL "QCF V2" : p1.woff2 .. p604.woff2
function fontUrlForPage(page: number): string {
  return `${FONT_BASE}/p${page}.woff2`;
}

const injected = new Set<string>();
const loading = new Map<string, Promise<void>>();

function injectFace(family: string, url: string, display: 'block' | 'swap') {
  if (injected.has(family)) return;
  injected.add(family);
  const style = document.createElement('style');
  style.dataset.font = family;
  style.textContent =
    `@font-face{font-family:'${family}';` +
    `src:url('${url}') format('woff2');` +
    `font-display:${display};font-weight:400;font-style:normal;}`;
  document.head.appendChild(style);
}

/**
 * Garantit que la police de la page est injectee ET chargee.
 * Resout quand le texte peut etre rendu sans "tofu" ; ne rejette jamais
 * (en cas d'echec on laisse le navigateur retenter / afficher le fallback).
 */
export function ensurePageFont(page: number): Promise<void> {
  const family = fontFamilyForPage(page);
  const url = fontUrlForPage(page);
  injectFace(family, url, 'block');

  let p = loading.get(family);
  if (!p) {
    p = (async () => {
      if (!('fonts' in document)) return;
      try {
        await document.fonts.load(`400 24px '${family}'`);
        await document.fonts.ready;
      } catch {
        /* on n'empeche pas l'affichage */
      }
    })();
    loading.set(family, p);
  }
  return p;
}

/** Injecte (sans attendre) la police d'une page a venir. */
export function preloadPageFont(page: number): void {
  if (page < 1 || page > 604) return;
  injectFace(fontFamilyForPage(page), fontUrlForPage(page), 'block');
  if ('fonts' in document) {
    document.fonts.load(`400 24px '${fontFamilyForPage(page)}'`).catch(() => {});
  }
}

/** Polices ornementales (chargees une fois). */
export function ensureOrnamentFonts(): void {
  injectFace(SURAH_NAME_FONT, `${FONT_BASE}/surah-name.woff2`, 'swap');
  injectFace(BASMALLAH_FONT, `${FONT_BASE}/basmallah.woff2`, 'swap');
}

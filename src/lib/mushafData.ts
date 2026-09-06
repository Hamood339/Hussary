import type { MushafMeta, MushafPageData } from '@/types/mushaf';
import { MUSHAF_TOTAL_PAGES } from '@/types/mushaf';

// Chargement paresseux des donnees du Mushaf depuis public/quran/.
// Tout est mis en cache memoire ; le service worker s'occupe du hors ligne.

const BASE = '/quran';

let metaPromise: Promise<MushafMeta | null> | null = null;
const pageCache = new Map<number, Promise<MushafPageData | null>>();

export function clampPage(page: number): number {
  if (!Number.isFinite(page)) return 1;
  return Math.min(MUSHAF_TOTAL_PAGES, Math.max(1, Math.round(page)));
}

export function loadMushafMeta(): Promise<MushafMeta | null> {
  if (!metaPromise) {
    metaPromise = fetch(`${BASE}/meta.json`)
      .then((r) => (r.ok ? (r.json() as Promise<MushafMeta>) : null))
      .catch(() => null);
  }
  return metaPromise;
}

export function loadMushafPage(page: number): Promise<MushafPageData | null> {
  const n = clampPage(page);
  let entry = pageCache.get(n);
  if (!entry) {
    entry = fetch(`${BASE}/pages/${String(n).padStart(3, '0')}.json`)
      .then((r) => (r.ok ? (r.json() as Promise<MushafPageData>) : null))
      .catch(() => null);
    pageCache.set(n, entry);
  }
  return entry;
}

/** Precharge quelques pages autour de `page` (donnees uniquement). */
export function prefetchAround(page: number, radius = 2): void {
  for (let d = -radius; d <= radius; d += 1) {
    const n = page + d;
    if (n >= 1 && n <= MUSHAF_TOTAL_PAGES) void loadMushafPage(n);
  }
}

/** Reconstitue le texte Uthmani lisible d'une ligne (aria-label, presse-papier). */
export function linePlainText(words: { text: string; isEnd?: boolean }[] | undefined): string {
  if (!words) return '';
  return words
    .filter((w) => !w.isEnd && w.text)
    .map((w) => w.text)
    .join(' ')
    .trim();
}

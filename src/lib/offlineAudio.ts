// Gestion explicite du cache audio hors ligne.
//
// Le service worker (vite-plugin-pwa / Workbox) met les MP3 en cache "au fil de
// l'eau" (CacheFirst) : une sourate jamais ecoutee en ligne n'est pas dispo hors
// ligne. Ce module permet de telecharger volontairement les fichiers COMPLETS
// dans le meme cache, pour une lecture fiable et sans coupure meme sans reseau.

const AUDIO_CACHE = 'quran-audio-cache-v2';

/** Le navigateur supporte-t-il la mise en cache hors ligne ? */
export function offlineSupported(): boolean {
  return typeof caches !== 'undefined' && 'serviceWorker' in navigator;
}

/** Un fichier audio donne est-il deja present dans le cache ? */
export async function isCached(src: string): Promise<boolean> {
  if (!offlineSupported()) return false;
  try {
    const cache = await caches.open(AUDIO_CACHE);
    return Boolean(await cache.match(src));
  } catch {
    return false;
  }
}

/** Combien des `srcs` fournis sont deja en cache. */
export async function getCachedCount(srcs: string[]): Promise<number> {
  if (!offlineSupported()) return 0;
  try {
    const cache = await caches.open(AUDIO_CACHE);
    const hits = await Promise.all(srcs.map((s) => cache.match(s)));
    return hits.filter(Boolean).length;
  } catch {
    return 0;
  }
}

/**
 * Telecharge un fichier COMPLET (GET sans en-tete Range) et le stocke.
 * Le fait de recuperer le fichier entier garantit que les futures requetes
 * Range (avance/retour rapide) seront servies proprement depuis le cache.
 */
export async function downloadSurah(src: string, signal?: AbortSignal): Promise<void> {
  const cache = await caches.open(AUDIO_CACHE);
  if (await cache.match(src)) return;
  const res = await fetch(src, { cache: 'reload', signal });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${src}`);
  await cache.put(src, res.clone());
}

export interface DownloadProgress {
  done: number;
  total: number;
  failed: number;
}

/**
 * Telecharge une liste de fichiers, sequentiellement (pas 114 requetes en
 * parallele). Ne s'interrompt pas sur un echec isole ; s'arrete proprement si
 * `signal` est avorte. Retourne le bilan final.
 */
export async function downloadAll(
  srcs: string[],
  onProgress: (p: DownloadProgress) => void,
  signal?: AbortSignal,
): Promise<DownloadProgress> {
  let done = 0;
  let failed = 0;
  for (const src of srcs) {
    if (signal?.aborted) break;
    try {
      await downloadSurah(src, signal);
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') break;
      failed += 1;
    }
    done += 1;
    onProgress({ done, total: srcs.length, failed });
  }
  return { done, total: srcs.length, failed };
}

/** Vide entierement le cache audio. */
export async function clearAudioCache(): Promise<void> {
  if (!offlineSupported()) return;
  try {
    await caches.delete(AUDIO_CACHE);
  } catch {
    /* ignore */
  }
}

/**
 * Demande au navigateur de ne PAS evincer le stockage sous pression (sinon
 * iOS/Android peuvent supprimer les fichiers telecharges au bout de quelques
 * jours). Sans effet si l'API n'existe pas.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

import { useEffect, useRef, useState } from 'react';
import { Check, CloudDownload, Trash2, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SURAHS } from '@/data/surahs';
import {
  clearAudioCache,
  downloadAll,
  getCachedCount,
  offlineSupported,
  requestPersistentStorage,
  type DownloadProgress,
} from '@/lib/offlineAudio';

const SRCS = SURAHS.map((s) => s.audioSrc);

export function OfflineDownloadCard() {
  const [supported] = useState(offlineSupported);
  const [cachedCount, setCachedCount] = useState<number | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function refresh() {
    setCachedCount(await getCachedCount(SRCS));
  }

  useEffect(() => {
    if (!supported) return;
    void refresh();
    navigator.storage?.persisted?.().then(setPersisted).catch(() => {});
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    setProgress({ done: 0, total: SRCS.length, failed: 0 });
    setPersisted(await requestPersistentStorage());
    const controller = new AbortController();
    abortRef.current = controller;
    const result = await downloadAll(SRCS, setProgress, controller.signal);
    setProgress(result);
    setDownloading(false);
    abortRef.current = null;
    await refresh();
  }

  async function handleClear() {
    await clearAudioCache();
    setProgress(null);
    await refresh();
  }

  if (!supported) {
    return (
      <Card className="mt-4 p-5">
        <div className="flex items-center gap-2.5">
          <CloudDownload className="h-4.5 w-4.5 text-emerald-700 dark:text-gold-300" />
          <h2 className="font-display text-base font-semibold text-ink-950 dark:text-white">Écoute hors ligne</h2>
        </div>
        <p className="mt-2 text-xs text-ink-900/50 dark:text-white/45">
          Ce navigateur ne permet pas la mise en cache hors ligne.
        </p>
      </Card>
    );
  }

  const allCached = cachedCount === SURAHS.length;
  const pct = progress && progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <Card className="mt-4 p-5">
      <div className="flex items-center gap-2.5">
        <CloudDownload className="h-4.5 w-4.5 text-emerald-700 dark:text-gold-300" />
        <h2 className="font-display text-base font-semibold text-ink-950 dark:text-white">Écoute hors ligne</h2>
      </div>
      <p className="mt-2 text-xs text-ink-900/50 dark:text-white/45">
        Téléchargez les 114 sourates sur cet appareil pour les écouter sans connexion et sans coupure.
      </p>

      <div className="mt-4 text-sm">
        {allCached ? (
          <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
            <Check className="h-4 w-4" /> Les 114 sourates sont disponibles hors ligne
          </span>
        ) : (
          <span className="text-ink-900/60 dark:text-white/55">
            {cachedCount ?? '…'} / {SURAHS.length} sourates téléchargées
          </span>
        )}
      </div>

      {(downloading || (progress != null && progress.done > 0 && !allCached)) && (
        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded-full bg-ink-900/8 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-gold-400 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-ink-900/50 dark:text-white/45">
            {progress?.done ?? 0} / {progress?.total ?? SURAHS.length}
            {progress && progress.failed > 0
              ? ` · ${progress.failed} échec${progress.failed > 1 ? 's' : ''}`
              : ''}
            {downloading ? ' · téléchargement en cours…' : ''}
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {downloading ? (
          <Button variant="outline" size="sm" onClick={() => abortRef.current?.abort()}>
            <X className="h-3.5 w-3.5" /> Annuler
          </Button>
        ) : (
          <Button size="sm" onClick={handleDownload} disabled={allCached}>
            <CloudDownload className="h-3.5 w-3.5" />
            {allCached
              ? 'Tout est téléchargé'
              : (cachedCount ?? 0) > 0
                ? 'Reprendre le téléchargement'
                : 'Tout télécharger'}
          </Button>
        )}
        {!downloading && (cachedCount ?? 0) > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:bg-red-500/8"
            onClick={handleClear}
          >
            <Trash2 className="h-3.5 w-3.5" /> Supprimer les fichiers
          </Button>
        )}
      </div>

      {persisted === false && (
        <p className="mt-3 text-xs text-ink-900/45 dark:text-white/40">
          Astuce : installez l’application sur l’écran d’accueil pour que le système ne supprime pas
          les fichiers téléchargés.
        </p>
      )}
    </Card>
  );
}

import { Play } from 'lucide-react';
import { SURAHS } from '@/data/surahs';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import { SurahArtwork } from '@/components/surah/SurahArtwork';
import { formatTime } from '@/lib/utils';

export function ContinueListeningCard() {
  const record = useLibraryStore((s) => s.continueListening);
  const playSurah = usePlayerStore((s) => s.playSurah);

  if (!record) return null;
  const surah = SURAHS.find((s) => s.number === record.surahNumber);
  if (!surah) return null;

  const progress = Math.min(100, (record.position / surah.estimatedDuration) * 100);

  return (
    <button
      onClick={() => playSurah(surah, record.position)}
      className="group flex w-full items-center gap-4 rounded-2xl border border-ink-900/6 bg-white p-3 pr-5 text-left shadow-soft transition-shadow hover:shadow-lifted dark:border-white/8 dark:bg-ink-900"
    >
      <SurahArtwork surah={surah} className="h-16 w-16 shrink-0" rounded="rounded-xl" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-700 dark:text-gold-300">
          Reprendre l’écoute
        </p>
        <p className="font-display truncate text-base font-semibold text-ink-950 dark:text-white">
          {surah.number}. {surah.frenchName}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-ink-900/8 dark:bg-white/12">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-gold-400" style={{ width: `${progress}%` }} />
          </div>
          <span className="shrink-0 text-[11px] tabular-nums text-ink-900/45 dark:text-white/40">
            {formatTime(record.position)}
          </span>
        </div>
      </div>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white transition-transform group-hover:scale-105 dark:bg-emerald-500 dark:text-emerald-950">
        <Play className="ml-0.5 h-4.5 w-4.5 fill-current" />
      </span>
    </button>
  );
}

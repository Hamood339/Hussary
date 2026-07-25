import { motion } from 'framer-motion';
import { Heart, Pause, Play } from 'lucide-react';
import type { Surah } from '@/types';
import { SurahArtwork } from '@/components/surah/SurahArtwork';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import { cn, formatDuration } from '@/lib/utils';

interface SurahListItemProps {
  surah: Surah;
  index?: number;
}

export function SurahListItem({ surah, index }: SurahListItemProps) {
  const currentSurah = usePlayerStore((s) => s.currentSurah);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playSurah = usePlayerStore((s) => s.playSurah);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const isFavorite = useLibraryStore((s) => s.favorites.has(surah.number));
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);

  const isActive = currentSurah?.number === surah.number;

  function handlePlay() {
    if (isActive) togglePlay();
    else playSurah(surah);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: (index ?? 0) * 0.02 }}
      className={cn(
        'group flex items-center gap-3.5 rounded-2xl border border-transparent p-2.5 pr-3 transition-colors hover:border-ink-900/8 hover:bg-white dark:hover:border-white/8 dark:hover:bg-white/5',
        isActive && 'border-gold-300/60 bg-gold-50/60 dark:bg-gold-400/10'
      )}
    >
      <button
        onClick={handlePlay}
        className="relative h-14 w-14 shrink-0"
        aria-label={isActive && isPlaying ? 'Mettre en pause' : 'Lire'}
      >
        <SurahArtwork surah={surah} className="h-full w-full" rounded="rounded-xl" />
        <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 opacity-0 transition-all group-hover:bg-black/35 group-hover:opacity-100">
          {isActive && isPlaying ? (
            <Pause className="h-5 w-5 fill-white text-white" />
          ) : (
            <Play className="h-5 w-5 fill-white text-white" />
          )}
        </span>
        {isActive && isPlaying && (
          <span className="absolute bottom-1 right-1 flex h-2 w-2">
            <span className="absolute h-full w-full animate-ping rounded-full bg-gold-300 opacity-75" />
            <span className="relative h-2 w-2 rounded-full bg-gold-300" />
          </span>
        )}
      </button>

      <button onClick={handlePlay} className="min-w-0 flex-1 text-left">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-medium tabular-nums text-ink-900/40 dark:text-white/35">
            {String(surah.number).padStart(3, '0')}
          </span>
          <p
            className={cn(
              'truncate font-display text-[15px] font-semibold text-ink-950 dark:text-white',
              isActive && 'text-emerald-700 dark:text-gold-300'
            )}
          >
            {surah.frenchName}
          </p>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-900/50 dark:text-white/45">
          <span>{surah.englishName}</span>
          <span className="h-0.5 w-0.5 rounded-full bg-current opacity-50" />
          <span>{surah.verses} versets</span>
          <span className="h-0.5 w-0.5 rounded-full bg-current opacity-50" />
          <span>{surah.revelationType === 'Meccan' ? 'Mecquoise' : 'Médinoise'}</span>
        </div>
      </button>

      <span className="hidden shrink-0 text-xs tabular-nums text-ink-900/40 dark:text-white/40 sm:block">
        {formatDuration(surah.estimatedDuration)}
      </span>

      <button
        onClick={() => toggleFavorite(surah.number)}
        aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        className="shrink-0 rounded-full p-2 text-ink-900/30 transition-colors hover:bg-ink-900/5 hover:text-gold-500 dark:text-white/30 dark:hover:bg-white/10"
      >
        <Heart className={cn('h-4.5 w-4.5', isFavorite && 'fill-gold-400 text-gold-400')} />
      </button>

      <span className="font-arabic hidden shrink-0 text-lg text-emerald-800/70 dark:text-emerald-200/60 md:block">
        {surah.arabicName}
      </span>
    </motion.div>
  );
}

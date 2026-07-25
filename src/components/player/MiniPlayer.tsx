import { motion } from 'framer-motion';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { SurahArtwork } from '@/components/surah/SurahArtwork';
import { formatTime } from '@/lib/utils';

export function MiniPlayer() {
  const currentSurah = usePlayerStore((s) => s.currentSurah);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const playNext = usePlayerStore((s) => s.playNext);
  const playPrevious = usePlayerStore((s) => s.playPrevious);
  const setExpanded = usePlayerStore((s) => s.setExpanded);

  if (!currentSurah) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 26, stiffness: 260 }}
      className="fixed inset-x-3 bottom-[76px] z-30 sm:inset-x-auto sm:bottom-4 sm:left-[calc(16rem+1rem)] sm:right-4"
    >
      <button
        onClick={() => setExpanded(true)}
        className="glass relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-ink-900/8 px-3 py-2.5 text-left shadow-lifted dark:border-white/10"
      >
        <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-ink-900/8 dark:bg-white/10">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-gold-400" style={{ width: `${progress}%` }} />
        </div>
        <SurahArtwork surah={currentSurah} className="h-11 w-11 shrink-0" rounded="rounded-lg" />
        <div className="min-w-0 flex-1">
          <p className="font-display truncate text-sm font-semibold text-ink-950 dark:text-white">
            {currentSurah.number}. {currentSurah.frenchName}
          </p>
          <p className="truncate text-[11px] text-ink-900/50 dark:text-white/45">
            {formatTime(currentTime)} · {formatTime(duration || currentSurah.estimatedDuration)}
          </p>
        </div>
        <span
          onClick={(e) => {
            e.stopPropagation();
            playPrevious();
          }}
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-900/60 hover:bg-ink-900/5 dark:text-white/60 dark:hover:bg-white/10 sm:flex"
        >
          <SkipBack className="h-4 w-4 fill-current" />
        </span>
        <span
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white shadow-soft dark:bg-emerald-500 dark:text-emerald-950"
        >
          {isPlaying ? <Pause className="h-4.5 w-4.5 fill-current" /> : <Play className="ml-0.5 h-4.5 w-4.5 fill-current" />}
        </span>
        <span
          onClick={(e) => {
            e.stopPropagation();
            playNext();
          }}
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-900/60 hover:bg-ink-900/5 dark:text-white/60 dark:hover:bg-white/10 sm:flex"
        >
          <SkipForward className="h-4 w-4 fill-current" />
        </span>
      </button>
    </motion.div>
  );
}

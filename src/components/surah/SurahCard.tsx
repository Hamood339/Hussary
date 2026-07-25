import { Play } from 'lucide-react';
import type { Surah } from '@/types';
import { SurahArtwork } from '@/components/surah/SurahArtwork';
import { usePlayerStore } from '@/store/playerStore';
import { cn } from '@/lib/utils';

interface SurahCardProps {
  surah: Surah;
  subtitle?: string;
  className?: string;
}

export function SurahCard({ surah, subtitle, className }: SurahCardProps) {
  const playSurah = usePlayerStore((s) => s.playSurah);
  const currentSurah = usePlayerStore((s) => s.currentSurah);
  const isActive = currentSurah?.number === surah.number;

  return (
    <button
      onClick={() => playSurah(surah)}
      className={cn('group w-[132px] shrink-0 text-left sm:w-[152px]', className)}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-soft transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-lifted">
        <SurahArtwork surah={surah} className="h-full w-full" rounded="rounded-2xl" />
        <div className="absolute bottom-2 right-2 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-gold-300 opacity-0 shadow-glow-gold transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Play className="h-4 w-4 fill-ink-950 text-ink-950" />
        </div>
      </div>
      <p
        className={cn(
          'mt-2.5 truncate font-display text-sm font-semibold text-ink-950 dark:text-white',
          isActive && 'text-emerald-700 dark:text-gold-300'
        )}
      >
        {surah.number}. {surah.frenchName}
      </p>
      <p className="truncate text-xs text-ink-900/50 dark:text-white/45">{subtitle ?? surah.englishName}</p>
    </button>
  );
}

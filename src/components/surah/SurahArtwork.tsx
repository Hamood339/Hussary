import type { Surah } from '@/types';
import { cn } from '@/lib/utils';
import { IslamicPattern } from '@/components/common/IslamicPattern';

interface SurahArtworkProps {
  surah: Surah;
  className?: string;
  rounded?: string;
  arabicClassName?: string;
}

const GRADIENTS = [
  'from-emerald-600 via-emerald-800 to-ink-950',
  'from-emerald-500 via-emerald-800 to-ink-900',
  'from-gold-500 via-emerald-800 to-ink-950',
  'from-emerald-700 via-ink-900 to-ink-950',
];

/**
 * Every surah gets a deterministic, distinctive "cover" derived from its
 * number — a gradient, the Islamic star pattern, and the Arabic name in
 * large display type. Stands in for album art the recitation doesn't have.
 * Sized with container queries so the same markup looks right whether it's
 * a 44px mini-player thumbnail or the full-bleed expanded-player artwork.
 */
export function SurahArtwork({ surah, className, rounded = 'rounded-2xl', arabicClassName }: SurahArtworkProps) {
  const gradient = GRADIENTS[surah.number % GRADIENTS.length];
  return (
    <div
      className={cn(
        '@container relative flex items-center justify-center overflow-hidden bg-gradient-to-br shadow-soft',
        gradient,
        rounded,
        className
      )}
    >
      <IslamicPattern className="absolute inset-0 text-gold-200" opacity={0.16} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5" />
      <span
        className={cn(
          'font-arabic relative select-none px-[8%] text-center leading-none text-gold-100/90 [font-size:22cqw]',
          arabicClassName
        )}
      >
        {surah.arabicName}
      </span>
    </div>
  );
}

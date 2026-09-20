import type { MushafLine } from '@/types/mushaf';
import { linePlainText } from '@/lib/mushafData';
import { cn } from '@/lib/utils';
import { SurahBanner } from '@/components/mushaf/SurahBanner';

// Basmala en orthographe Uthmani — repli si la source QUL ne fournit pas les
// glyphes de la ligne "basmallah". Phrase identique dans tous les mushafs.
const BASMALA_FALLBACK = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

interface Props {
  line: MushafLine;
  pageFontFamily: string;
  surahName?: string;
  /** Numero d'ayah actuellement lue (pour le futur surlignage audio). */
  activeAyah?: { surah: number; ayah: number } | null;
}

export function MushafLineView({ line, pageFontFamily, surahName, activeAyah }: Props) {
  if (line.type === 'surah_name') {
    return <SurahBanner name={surahName} number={line.surah} />;
  }

  if (line.type === 'basmallah') {
    const glyphWords = line.words ?? [];
    const hasGlyphs = glyphWords.length > 0;
    return (
      <div className="mushaf-line justify-center" aria-label="Basmala">
        <span
          className={cn(
            'leading-none text-emerald-800/90 dark:text-gold-200/90',
            !hasGlyphs && 'font-arabic',
          )}
          style={
            hasGlyphs
              ? { fontFamily: pageFontFamily, fontSize: 'calc(var(--mushaf-fs) * 0.92)' }
              : { fontSize: 'calc(var(--mushaf-fs) * 0.82)' }
          }
        >
          {hasGlyphs ? glyphWords.map((w) => w.code).join('') : BASMALA_FALLBACK}
        </span>
      </div>
    );
  }

  // Ligne d'ayah = une ligne imprimée du mushaf : mots étirés bord à bord.
  const words = line.words ?? [];
  const plain = linePlainText(words);

  return (
    <div
      className={cn('mushaf-line mushaf-ayah-line', line.centered && 'is-centered')}
      lang="ar"
      aria-label={plain || undefined}
    >
      <span
        className="mushaf-line-text text-ink-950 dark:text-[#f4f1e8]"
        style={{ fontFamily: pageFontFamily }}
      >
        {words.map((w, i) => {
          const active =
            activeAyah && !w.isEnd && w.surah === activeAyah.surah && w.ayah === activeAyah.ayah;
          return (
            <span
              key={w.key ?? `${w.surah}:${w.ayah}:end:${i}`}
              data-ayah={w.isEnd ? undefined : `${w.surah}:${w.ayah}`}
              className={cn(
                w.isEnd && 'text-gold-500 dark:text-gold-300/90',
                active && 'rounded bg-gold-300/30 dark:bg-gold-300/20',
              )}
            >
              {w.code}
            </span>
          );
        })}
      </span>
    </div>
  );
}

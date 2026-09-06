import type { MushafLine } from '@/types/mushaf';
import { linePlainText } from '@/lib/mushafData';
import { cn } from '@/lib/utils';

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
    return (
      <div className="mushaf-line justify-center">
        <div className="flex w-full max-w-[82%] items-center justify-center gap-3 rounded-xl border border-gold-300/40 bg-gradient-to-b from-gold-50 to-transparent px-4 py-1 dark:border-gold-400/20 dark:from-gold-400/8 dark:to-transparent">
          <span className="h-px flex-1 bg-gold-400/30" />
          <span
            className="font-arabic leading-none text-emerald-800 dark:text-gold-200"
            style={{ fontSize: 'calc(var(--mushaf-fs) * 0.92)' }}
          >
            {surahName ? `سورة ${surahName}` : `سورة ${line.surah ?? ''}`}
          </span>
          <span className="h-px flex-1 bg-gold-400/30" />
        </div>
      </div>
    );
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
              className={active ? 'rounded bg-gold-300/30 dark:bg-gold-300/20' : undefined}
            >
              {w.code}
            </span>
          );
        })}
      </span>
    </div>
  );
}

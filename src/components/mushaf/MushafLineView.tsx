import type { MushafLine } from '@/types/mushaf';
import { linePlainText } from '@/lib/mushafData';
import { cn } from '@/lib/utils';

// Basmala en orthographe Uthmani — utilisee uniquement en repli si la source
// QUL ne fournit pas les glyphes de la ligne "basmallah". Phrase identique dans
// tous les mushafs.
const BASMALA_FALLBACK = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

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
      <div className="mushaf-line flex items-center justify-center">
        <div className="relative flex w-full max-w-[78%] items-center justify-center rounded-md border border-gold-500/50 bg-gold-100/40 px-4 py-1 dark:border-gold-300/30 dark:bg-gold-300/5">
          <span className="pointer-events-none absolute inset-x-2 -top-px h-px bg-gold-500/40" />
          <span className="font-arabic text-[length:var(--mushaf-fs)] leading-none text-emerald-800 dark:text-gold-200">
            {surahName ? `سورة ${surahName}` : `سورة ${line.surah ?? ''}`}
          </span>
        </div>
      </div>
    );
  }

  if (line.type === 'basmallah') {
    const glyphWords = line.words ?? [];
    const hasGlyphs = glyphWords.length > 0;
    return (
      <div className="mushaf-line flex items-center justify-center" aria-label="Basmala">
        <span
          className={cn('leading-none text-ink-950 dark:text-[#f3ead6]', !hasGlyphs && 'font-arabic')}
          style={
            hasGlyphs
              ? { fontFamily: pageFontFamily, fontSize: 'var(--mushaf-fs)' }
              : { fontSize: 'calc(var(--mushaf-fs) * 0.85)' }
          }
        >
          {hasGlyphs ? glyphWords.map((w) => w.code).join('') : BASMALA_FALLBACK}
        </span>
      </div>
    );
  }

  // Ligne d'ayah : mots etires bord a bord comme dans le mushaf imprime.
  const words = line.words ?? [];
  const plain = linePlainText(words);

  return (
    <div
      className={cn(
        'mushaf-line mushaf-ayah-line',
        line.centered ? 'is-centered' : 'is-justified',
      )}
      lang="ar"
      aria-label={plain || undefined}
    >
      <span
        className="mushaf-ayah-text text-ink-950 dark:text-[#f3ead6]"
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

import { useEffect, useState, type CSSProperties } from 'react';
import type { MushafMeta, MushafPageData } from '@/types/mushaf';
import { loadMushafPage } from '@/lib/mushafData';
import { ensurePageFont, fontFamilyForPage } from '@/lib/mushafFont';
import { MushafLineView } from '@/components/mushaf/MushafLineView';
import { Skeleton } from '@/components/ui/Skeleton';

interface Props {
  page: number;
  meta: MushafMeta | null;
  fontScale: number;
  onData?: (data: MushafPageData) => void;
}

export function MushafPageView({ page, meta, fontScale, onData }: Props) {
  const [data, setData] = useState<MushafPageData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setData(null);

    Promise.all([loadMushafPage(page), ensurePageFont(page)]).then(([pageData]) => {
      if (cancelled) return;
      setData(pageData);
      if (pageData) onData?.(pageData);
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
    // onData volontairement hors deps (identite non garantie)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const surahName = (n?: number) =>
    n ? meta?.surahs.find((s) => s.number === n)?.arabicName : undefined;

  const fontFamily = fontFamilyForPage(page);

  return (
    <div className="mushaf-paper" style={{ '--mushaf-scale': fontScale } as CSSProperties}>
      <div className="mushaf-frame">
        {!ready ? (
          <div className="mushaf-lines">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="mushaf-line justify-center">
                <div style={{ width: `${70 + ((i * 37) % 26)}%` }}>
                  <Skeleton className="h-[0.9em] w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : !data ? (
          <div className="flex flex-1 items-center justify-center px-6 text-center">
            <p className="text-sm text-ink-900/50 dark:text-white/45">
              Page {page} indisponible. Lancez <code>node scripts/build-quran-data.mjs</code>.
            </p>
          </div>
        ) : (
          <div className="mushaf-lines">
            {data.lines.map((line) => (
              <MushafLineView
                key={line.line}
                line={line}
                pageFontFamily={fontFamily}
                surahName={surahName(line.surah)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

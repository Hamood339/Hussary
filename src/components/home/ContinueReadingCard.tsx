import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import type { MushafMeta } from '@/types/mushaf';
import { MUSHAF_TOTAL_PAGES } from '@/types/mushaf';
import { dbApi } from '@/lib/db';
import { loadMushafMeta } from '@/lib/mushafData';

export function ContinueReadingCard() {
  const navigate = useNavigate();
  const [page, setPage] = useState<number | null>(null);
  const [meta, setMeta] = useState<MushafMeta | null>(null);

  useEffect(() => {
    void dbApi.getReadingPosition().then((rec) => {
      if (rec && rec.page > 1) setPage(rec.page);
    });
    void loadMushafMeta().then(setMeta);
  }, []);

  if (page == null) return null;

  const info = meta?.pages[page - 1];
  const surahName = info?.surahs
    .map((n) => meta?.surahs.find((s) => s.number === n)?.name ?? `Sourate ${n}`)
    .join(' · ');
  const progress = (page / MUSHAF_TOTAL_PAGES) * 100;

  return (
    <section className="mt-8">
      <h2 className="font-display mb-3.5 px-1 text-xl font-semibold tracking-tight text-ink-950 dark:text-white">
        Reprendre la lecture
      </h2>
      <button
        onClick={() => navigate('/mushaf')}
        className="group flex w-full items-center gap-4 rounded-2xl border border-ink-900/6 bg-white p-3 pr-5 text-left shadow-soft transition-shadow hover:shadow-lifted dark:border-white/8 dark:bg-ink-900"
      >
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-700 to-ink-950 text-gold-200">
          <BookOpen className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-700 dark:text-gold-300">
            Mushaf
          </p>
          <p className="font-display truncate text-base font-semibold text-ink-950 dark:text-white">
            {surahName || `Page ${page}`}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-ink-900/8 dark:bg-white/12">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-gold-400"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="shrink-0 text-[11px] tabular-nums text-ink-900/45 dark:text-white/40">
              p. {page} / {MUSHAF_TOTAL_PAGES}
            </span>
          </div>
        </div>
      </button>
    </section>
  );
}

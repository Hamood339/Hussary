import { useMemo } from 'react';
import { History } from 'lucide-react';
import { SurahListItem } from '@/components/surah/SurahListItem';
import { EmptyState } from '@/components/common/EmptyState';
import { useLibraryStore } from '@/store/libraryStore';
import { SURAHS } from '@/data/surahs';

export function RecentPage() {
  const history = useLibraryStore((s) => s.history);
  const list = useMemo(
    () =>
      history
        .map((h) => SURAHS.find((s) => s.number === h.surahNumber))
        .filter((s): s is (typeof SURAHS)[number] => Boolean(s)),
    [history]
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-950 dark:text-white sm:text-3xl">
        Écoutées récemment
      </h1>
      <p className="mt-1 text-sm text-ink-900/55 dark:text-white/50">Les 30 dernières sourates écoutées, les plus récentes d’abord.</p>

      <div className="mt-6 flex flex-col gap-1">
        {list.length === 0 ? (
          <EmptyState
            icon={History}
            title="Rien à afficher pour l’instant"
            description="Les sourates que vous écoutez apparaîtront ici automatiquement."
          />
        ) : (
          list.map((s, i) => <SurahListItem key={s.number} surah={s} index={i} />)
        )}
      </div>
    </div>
  );
}

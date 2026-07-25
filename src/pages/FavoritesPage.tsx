import { useMemo } from 'react';
import { Heart } from 'lucide-react';
import { SurahListItem } from '@/components/surah/SurahListItem';
import { EmptyState } from '@/components/common/EmptyState';
import { useLibraryStore } from '@/store/libraryStore';
import { SURAHS } from '@/data/surahs';

export function FavoritesPage() {
  const favorites = useLibraryStore((s) => s.favorites);
  const list = useMemo(() => SURAHS.filter((s) => favorites.has(s.number)), [favorites]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-950 dark:text-white sm:text-3xl">Favoris</h1>
      <p className="mt-1 text-sm text-ink-900/55 dark:text-white/50">
        {list.length > 0 ? `${list.length} sourate${list.length > 1 ? 's' : ''} enregistrée${list.length > 1 ? 's' : ''}` : 'Vos sourates préférées, toujours à portée de main.'}
      </p>

      <div className="mt-6 flex flex-col gap-1">
        {list.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Aucun favori pour l’instant"
            description="Appuyez sur le cœur d’une sourate pour l’ajouter ici."
          />
        ) : (
          list.map((s, i) => <SurahListItem key={s.number} surah={s} index={i} />)
        )}
      </div>
    </div>
  );
}

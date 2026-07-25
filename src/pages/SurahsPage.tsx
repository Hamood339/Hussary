import { useMemo, useState } from 'react';
import { ArrowUpDown, SearchX } from 'lucide-react';
import { SearchBar } from '@/components/common/SearchBar';
import { SurahListItem } from '@/components/surah/SurahListItem';
import { EmptyState } from '@/components/common/EmptyState';
import { SURAHS } from '@/data/surahs';
import { normalizeSearch, cn } from '@/lib/utils';
import type { SortOption } from '@/types';

const SORT_LABELS: Record<SortOption, string> = {
  number: 'Numéro',
  alphabetical: 'Alphabétique',
  revelation: 'Révélation',
};

export function SurahsPage() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('number');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const results = useMemo(() => {
    const q = normalizeSearch(query);
    let list = SURAHS;
    if (q) {
      list = SURAHS.filter((s) => {
        return (
          normalizeSearch(s.frenchName).includes(q) ||
          normalizeSearch(s.englishName).includes(q) ||
          s.arabicName.includes(query) ||
          String(s.number).includes(q)
        );
      });
    }
    const sorted = [...list];
    if (sort === 'alphabetical') sorted.sort((a, b) => a.frenchName.localeCompare(b.frenchName, 'fr'));
    else if (sort === 'revelation')
      sorted.sort((a, b) => a.revelationType.localeCompare(b.revelationType) || a.number - b.number);
    else sorted.sort((a, b) => a.number - b.number);
    return sorted;
  }, [query, sort]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-950 dark:text-white sm:text-3xl">Les sourates</h1>
      <p className="mt-1 text-sm text-ink-900/55 dark:text-white/50">114 sourates récitées par le Cheikh Al-Hussary.</p>

      <div className="mt-5 flex items-center gap-2.5">
        <SearchBar value={query} onChange={setQuery} className="flex-1" />
        <div className="relative shrink-0">
          <button
            onClick={() => setShowSortMenu((v) => !v)}
            className="flex h-12 items-center gap-2 rounded-full border border-ink-900/8 bg-white/80 px-4 text-sm font-medium text-ink-900/70 shadow-soft dark:border-white/10 dark:bg-white/6 dark:text-white/70"
          >
            <ArrowUpDown className="h-4 w-4" />
            <span className="hidden sm:inline">{SORT_LABELS[sort]}</span>
          </button>
          {showSortMenu && (
            <div className="absolute right-0 top-full z-10 mt-2 w-44 rounded-2xl border border-ink-900/8 bg-white p-1.5 shadow-lifted dark:border-white/10 dark:bg-ink-800">
              {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setSort(opt);
                    setShowSortMenu(false);
                  }}
                  className={cn(
                    'block w-full rounded-xl px-3 py-2 text-left text-sm',
                    sort === opt
                      ? 'bg-emerald-900/8 text-emerald-700 dark:bg-white/10 dark:text-gold-300'
                      : 'text-ink-900/70 hover:bg-ink-900/5 dark:text-white/60 dark:hover:bg-white/8'
                  )}
                >
                  {SORT_LABELS[opt]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-1">
        {results.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Aucune sourate trouvée"
            description="Essayez un autre nom, en arabe, en français, en anglais, ou un numéro."
          />
        ) : (
          results.map((s, i) => <SurahListItem key={s.number} surah={s} index={i} />)
        )}
      </div>
    </div>
  );
}

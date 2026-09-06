import { useMemo } from 'react';
import { Hero } from '@/components/home/Hero';
import { StatsGrid } from '@/components/home/StatsGrid';
import { SectionRow } from '@/components/home/SectionRow';
import { ContinueListeningCard } from '@/components/home/ContinueListeningCard';
import { ContinueReadingCard } from '@/components/home/ContinueReadingCard';
import { SurahCard } from '@/components/surah/SurahCard';
import { SearchBar } from '@/components/common/SearchBar';
import { useLibraryStore } from '@/store/libraryStore';
import { SURAHS } from '@/data/surahs';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();
  const favorites = useLibraryStore((s) => s.favorites);
  const history = useLibraryStore((s) => s.history);
  const continueListening = useLibraryStore((s) => s.continueListening);

  const favoriteSurahs = useMemo(
    () => SURAHS.filter((s) => favorites.has(s.number)).slice(0, 10),
    [favorites]
  );
  const recentSurahs = useMemo(
    () =>
      history
        .map((h) => SURAHS.find((s) => s.number === h.surahNumber))
        .filter((s): s is (typeof SURAHS)[number] => Boolean(s))
        .slice(0, 10),
    [history]
  );
  const quickAccess = useMemo(() => SURAHS.slice(0, 12), []);

  return (
    <div className="pb-4">
      <Hero />

      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate('/surahs')}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/surahs')}
        className="mt-6 cursor-text sm:hidden [&_input]:pointer-events-none"
      >
        <SearchBar value="" onChange={() => {}} placeholder="Rechercher une sourate…" />
      </div>

      <div className="mt-8">
        <StatsGrid />
      </div>

      {continueListening && (
        <section className="mt-8">
          <h2 className="font-display mb-3.5 px-1 text-xl font-semibold tracking-tight text-ink-950 dark:text-white">
            Reprendre
          </h2>
          <ContinueListeningCard />
        </section>
      )}

      <ContinueReadingCard />

      {favoriteSurahs.length > 0 && (
        <SectionRow title="Favoris" viewAllHref="/favorites">
          {favoriteSurahs.map((s) => (
            <SurahCard key={s.number} surah={s} />
          ))}
        </SectionRow>
      )}

      {recentSurahs.length > 0 && (
        <SectionRow title="Écoutées récemment" viewAllHref="/recent">
          {recentSurahs.map((s) => (
            <SurahCard key={s.number} surah={s} />
          ))}
        </SectionRow>
      )}

      <SectionRow title="Accès rapide" viewAllHref="/surahs">
        {quickAccess.map((s) => (
          <SurahCard key={s.number} surah={s} />
        ))}
      </SectionRow>
    </div>
  );
}

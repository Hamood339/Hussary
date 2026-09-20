interface Props {
  name?: string;
  number?: number;
}

/**
 * Bandeau de début de sourate. Meme style que les pastilles actives ailleurs
 * dans l'app (ex. onglets de MushafIndex) : pas d'ornement invente, la
 * palette emerald/gold deja utilisee partout dans l'interface.
 */
export function SurahBanner({ name, number }: Props) {
  const label = name ? `سُورَةُ ${name}` : `سورة ${number ?? ''}`;

  return (
    <div className="mushaf-line justify-center">
      <div className="mushaf-surah-banner w-full max-w-[92%]">
        <span className="mushaf-surah-banner-text">{label}</span>
      </div>
    </div>
  );
}

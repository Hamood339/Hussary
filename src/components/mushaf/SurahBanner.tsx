interface Props {
  name?: string;
  number?: number;
}

/**
 * Bandeau ornemental de début de sourate : double filet, extrémités texturées
 * et deux médaillons — dans la palette de l'app (or / émeraude) au lieu du noir
 * traditionnel. Pour l'ornement imprimé exact, il faut la police "Surah Names"
 * de QUL (voir scripts/README.md).
 */
export function SurahBanner({ name, number }: Props) {
  const label = name ? `سُورَةُ ${name}` : `سورة ${number ?? ''}`;

  return (
    <div className="mushaf-line justify-center">
      <div className="relative flex h-[86%] w-full max-w-[94%] items-center justify-center text-gold-500 dark:text-gold-300">
        {/* double cadre */}
        <span className="pointer-events-none absolute inset-0 rounded-lg border-2 border-current opacity-70" />
        <span className="pointer-events-none absolute inset-[4px] rounded border border-current opacity-40" />

        {/* extrémités texturées */}
        <span className="mushaf-banner-fill pointer-events-none absolute inset-y-[6px] left-[6px] w-[15%] opacity-55 [mask-image:linear-gradient(to_right,black,transparent)]" />
        <span className="mushaf-banner-fill pointer-events-none absolute inset-y-[6px] right-[6px] w-[15%] opacity-55 [mask-image:linear-gradient(to_left,black,transparent)]" />

        {/* médaillons */}
        <span className="pointer-events-none absolute left-[19%] top-1/2 h-[44%] -translate-y-1/2 aspect-square rounded-full border border-current opacity-60" />
        <span className="pointer-events-none absolute right-[19%] top-1/2 h-[44%] -translate-y-1/2 aspect-square rounded-full border border-current opacity-60" />

        {/* nom de la sourate */}
        <span
          className="font-arabic relative z-10 max-w-[52%] truncate leading-none text-emerald-800 dark:text-gold-200"
          style={{ fontSize: 'calc(var(--mushaf-fs) * 0.9)' }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

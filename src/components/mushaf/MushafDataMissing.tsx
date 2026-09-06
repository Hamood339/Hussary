import { BookOpen } from 'lucide-react';

export function MushafDataMissing() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border border-dashed border-ink-900/12 bg-ink-900/[0.02] px-6 py-14 text-center dark:border-white/12 dark:bg-white/[0.02]">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-900/8 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
        <BookOpen className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <h3 className="font-display text-lg font-semibold text-ink-950 dark:text-white">
        Données du Mushaf absentes
      </h3>
      <p className="text-sm text-ink-900/55 dark:text-white/50">
        Le texte n’a pas encore été généré. Depuis la racine du projet :
      </p>
      <pre className="w-full overflow-x-auto rounded-xl bg-ink-950 px-4 py-3 text-left text-xs text-emerald-100">
        <code>
          {'# 1. voir scripts/README.md pour récupérer la source QUL\n'}
          {'node scripts/build-quran-data.mjs'}
        </code>
      </pre>
      <p className="text-xs text-ink-900/45 dark:text-white/40">
        Les fichiers atterrissent dans <code>public/quran/</code> puis sont à committer.
      </p>
    </div>
  );
}

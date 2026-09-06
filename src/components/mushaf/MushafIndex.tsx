import { useState } from 'react';
import type { MushafMeta } from '@/types/mushaf';
import { MUSHAF_TOTAL_PAGES } from '@/types/mushaf';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { cn } from '@/lib/utils';

type Tab = 'surah' | 'juz' | 'page';

interface Props {
  open: boolean;
  onClose: () => void;
  meta: MushafMeta | null;
  currentPage: number;
  onSelect: (page: number) => void;
}

export function MushafIndex({ open, onClose, meta, currentPage, onSelect }: Props) {
  const [tab, setTab] = useState<Tab>('surah');
  const [pageInput, setPageInput] = useState('');

  function pick(page: number) {
    onSelect(page);
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex max-h-[80dvh] flex-col">
        <div className="flex gap-1 p-4 pb-2">
          {(['surah', 'juz', 'page'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors',
                tab === t
                  ? 'bg-emerald-900/8 text-emerald-700 dark:bg-white/10 dark:text-gold-300'
                  : 'text-ink-900/55 hover:bg-ink-900/5 dark:text-white/50 dark:hover:bg-white/8',
              )}
            >
              {t === 'surah' ? 'Sourate' : t === 'juz' ? 'Juz' : 'Page'}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-6">
          {tab === 'surah' && (
            <ul className="flex flex-col">
              {(meta?.surahs ?? []).map((s) => (
                <li key={s.number}>
                  <button
                    onClick={() => pick(s.startPage)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-ink-900/5 dark:hover:bg-white/5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-900/8 text-xs font-medium text-emerald-700 dark:bg-white/8 dark:text-gold-300">
                      {s.number}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-ink-950 dark:text-white">
                      {s.name}
                    </span>
                    <span className="font-arabic shrink-0 text-base text-emerald-800/80 dark:text-emerald-200/70">
                      {s.arabicName}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-ink-900/40 dark:text-white/40">
                      p.{s.startPage}
                    </span>
                  </button>
                </li>
              ))}
              {!meta && <p className="px-3 py-6 text-sm text-ink-900/50 dark:text-white/45">Index indisponible.</p>}
            </ul>
          )}

          {tab === 'juz' && (
            <div className="grid grid-cols-3 gap-2 p-2 sm:grid-cols-5">
              {(meta?.juz ?? Array.from({ length: 30 }, (_, i) => ({ number: i + 1, startPage: 1 }))).map(
                (j) => (
                  <button
                    key={j.number}
                    onClick={() => pick(j.startPage)}
                    className="rounded-xl border border-ink-900/8 px-2 py-3 text-center text-sm font-medium text-ink-900/70 hover:bg-ink-900/5 dark:border-white/10 dark:text-white/65 dark:hover:bg-white/8"
                  >
                    Juz {j.number}
                    <span className="mt-0.5 block text-[11px] font-normal text-ink-900/40 dark:text-white/40">
                      p.{j.startPage}
                    </span>
                  </button>
                ),
              )}
            </div>
          )}

          {tab === 'page' && (
            <form
              className="flex flex-col gap-3 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                const n = parseInt(pageInput, 10);
                if (Number.isFinite(n)) pick(n);
              }}
            >
              <label className="text-sm text-ink-900/60 dark:text-white/55">
                Aller à la page (1 – {MUSHAF_TOTAL_PAGES})
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  max={MUSHAF_TOTAL_PAGES}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  placeholder={String(currentPage)}
                  className="h-11 flex-1 rounded-xl border border-ink-900/10 bg-transparent px-3 text-sm text-ink-950 focus:border-emerald-600/40 focus:outline-none dark:border-white/12 dark:text-white"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white dark:bg-emerald-500 dark:text-emerald-950"
                >
                  Aller
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}

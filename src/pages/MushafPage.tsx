import { useEffect, useState } from 'react';
import { AnimatePresence, motion, MotionConfig, type PanInfo, type Variants } from 'framer-motion';
import { ChevronLeft, ChevronRight, List, Minus, Plus } from 'lucide-react';
import type { MushafMeta } from '@/types/mushaf';
import { MUSHAF_TOTAL_PAGES } from '@/types/mushaf';
import { loadMushafMeta, prefetchAround } from '@/lib/mushafData';
import { preloadPageFont } from '@/lib/mushafFont';
import { useMushafStore, FONT_SCALE_MIN, FONT_SCALE_MAX } from '@/store/mushafStore';
import { MushafPageView } from '@/components/mushaf/MushafPageView';
import { MushafIndex } from '@/components/mushaf/MushafIndex';
import { MushafDataMissing } from '@/components/mushaf/MushafDataMissing';

type Dir = 'next' | 'prev';

// Comme un vrai livre en RTL : on va vers la page suivante en faisant
// glisser la page vers la DROITE ; la nouvelle page arrive par la gauche.
const variants: Variants = {
  enter: (dir: Dir) => ({ x: dir === 'next' ? '-100%' : '100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: Dir) => ({ x: dir === 'next' ? '100%' : '-100%', opacity: 0 }),
};

export function MushafPage() {
  const currentPage = useMushafStore((s) => s.currentPage);
  const fontScale = useMushafStore((s) => s.fontScale);
  const isLoaded = useMushafStore((s) => s.isLoaded);
  const setPage = useMushafStore((s) => s.setPage);
  const goToPage = useMushafStore((s) => s.goToPage);
  const adjustFontScale = useMushafStore((s) => s.adjustFontScale);

  const [meta, setMeta] = useState<MushafMeta | null>(null);
  const [metaState, setMetaState] = useState<'loading' | 'ok' | 'missing'>('loading');
  const [dir, setDir] = useState<Dir>('next');
  const [showIndex, setShowIndex] = useState(false);
  const [immersive, setImmersive] = useState(false);

  useEffect(() => {
    loadMushafMeta().then((m) => {
      setMeta(m);
      setMetaState(m ? 'ok' : 'missing');
    });
  }, []);

  // En RTL, "avancer" dans le livre = aller vers la gauche.
  function turn(delta: number) {
    setDir(delta > 0 ? 'next' : 'prev');
    setPage(currentPage + delta);
  }

  useEffect(() => {
    prefetchAround(currentPage, 2);
    preloadPageFont(currentPage + 1);
    preloadPageFont(currentPage - 1);
  }, [currentPage]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (showIndex) return;
      if (e.key === 'ArrowLeft' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        turn(1);
      } else if (e.key === 'ArrowRight' || e.key === 'PageUp') {
        e.preventDefault();
        turn(-1);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, showIndex]);

  function onDragEnd(_e: unknown, info: PanInfo) {
    const dx = info.offset.x;
    const vx = info.velocity.x;
    // Glissement vers la DROITE -> page suivante (comme tourner la page d'un livre arabe).
    if (dx > 55 || vx > 450) turn(1);
    else if (dx < -55 || vx < -450) turn(-1);
  }

  if (metaState === 'missing') {
    return (
      <div className="pt-4">
        <MushafDataMissing />
      </div>
    );
  }

  const pageInfo = meta?.pages[currentPage - 1];
  const surahLabel = pageInfo
    ? pageInfo.surahs
        .map((n) => meta?.surahs.find((s) => s.number === n)?.name ?? `Sourate ${n}`)
        .join(' · ')
    : '';
  const juzLabel = pageInfo ? `Juz ${pageInfo.juz}` : '';
  const progress = (currentPage / MUSHAF_TOTAL_PAGES) * 100;

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto flex h-[calc(100dvh-11rem)] max-w-[460px] flex-col">
        {/* En-tete */}
        <motion.div
          animate={{ opacity: immersive ? 0 : 1, y: immersive ? -8 : 0 }}
          className="flex items-center justify-between gap-2 px-1 pb-2"
          style={{ pointerEvents: immersive ? 'none' : 'auto' }}
        >
          <button
            onClick={() => setShowIndex(true)}
            className="flex min-w-0 items-center gap-2 rounded-full px-2 py-1 text-left hover:bg-ink-900/5 dark:hover:bg-white/5"
          >
            <List className="h-4 w-4 shrink-0 text-ink-900/45 dark:text-white/45" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-ink-950 dark:text-white">
                {surahLabel || 'Mushaf'}
              </span>
              <span className="block text-[11px] text-ink-900/45 dark:text-white/40">{juzLabel}</span>
            </span>
          </button>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => adjustFontScale(-1)}
              disabled={fontScale <= FONT_SCALE_MIN + 0.001}
              aria-label="Réduire le texte"
              className="rounded-full p-2 text-ink-900/50 hover:bg-ink-900/5 disabled:opacity-30 dark:text-white/50 dark:hover:bg-white/10"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              onClick={() => adjustFontScale(1)}
              disabled={fontScale >= FONT_SCALE_MAX - 0.001}
              aria-label="Agrandir le texte"
              className="rounded-full p-2 text-ink-900/50 hover:bg-ink-900/5 disabled:opacity-30 dark:text-white/50 dark:hover:bg-white/10"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        {/* Zone de lecture — conteneur de taille : sert de référence à la
            police (cqh) pour que 15 lignes tiennent sans défiler au zoom 1. */}
        <div className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto [container-type:size]">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={currentPage}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: 'spring', stiffness: 320, damping: 34 }, opacity: { duration: 0.15 } }}
              drag={isLoaded ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={onDragEnd}
              onClick={() => setImmersive((v) => !v)}
              className="flex min-h-full w-full items-start justify-center px-1"
            >
              <MushafPageView page={currentPage} meta={meta} fontScale={fontScale} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pied : navigation facon livre (gauche = avancer) */}
        <motion.div
          animate={{ opacity: immersive ? 0 : 1, y: immersive ? 8 : 0 }}
          style={{ pointerEvents: immersive ? 'none' : 'auto' }}
          className="pt-2"
        >
          <div className="mb-2 h-0.5 overflow-hidden rounded-full bg-ink-900/8 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-gold-400"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => turn(1)}
              disabled={currentPage >= MUSHAF_TOTAL_PAGES}
              aria-label="Page suivante"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-900/60 hover:bg-ink-900/5 disabled:opacity-30 dark:text-white/60 dark:hover:bg-white/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowIndex(true)}
              className="rounded-full bg-emerald-900/8 px-3 py-1 text-xs font-medium tabular-nums text-emerald-700 dark:bg-white/8 dark:text-gold-300"
            >
              {currentPage} / {MUSHAF_TOTAL_PAGES}
            </button>
            <button
              onClick={() => turn(-1)}
              disabled={currentPage <= 1}
              aria-label="Page précédente"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-900/60 hover:bg-ink-900/5 disabled:opacity-30 dark:text-white/60 dark:hover:bg-white/10"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </div>

      <MushafIndex
        open={showIndex}
        onClose={() => setShowIndex(false)}
        meta={meta}
        currentPage={currentPage}
        onSelect={(p) => {
          setDir(p > currentPage ? 'next' : 'prev');
          goToPage(p);
        }}
      />
    </MotionConfig>
  );
}

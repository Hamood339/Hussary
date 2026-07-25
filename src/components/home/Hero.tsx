import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { IslamicPattern } from '@/components/common/IslamicPattern';
import { SurahArtwork } from '@/components/surah/SurahArtwork';
import { usePlayerStore } from '@/store/playerStore';
import { SURAHS } from '@/data/surahs';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'Bonne nuit';
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

export function Hero() {
  const currentSurah = usePlayerStore((s) => s.currentSurah);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playSurah = usePlayerStore((s) => s.playSurah);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const setExpanded = usePlayerStore((s) => s.setExpanded);

  const highlighted = currentSurah ?? SURAHS[0];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-ink-950 shadow-lifted">
      <IslamicPattern className="absolute inset-0 text-gold-200" opacity={0.08} />
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-400/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl" />

      <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-medium text-gold-200/80"
          >
            {getGreeting()}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-display mt-1 max-w-md text-3xl font-semibold leading-tight text-white sm:text-4xl"
          >
            La récitation du <span className="text-gold-300">Cheikh Al-Hussary</span>, hors ligne, à tout moment.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-3 max-w-sm text-sm text-emerald-100/70"
          >
            114 sourates. Zéro connexion requise. Une écoute apaisée, jour après jour.
          </motion.p>
        </div>

        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          onClick={() => (currentSurah ? setExpanded(true) : playSurah(highlighted))}
          className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/8 p-3 pr-5 text-left backdrop-blur-md transition-colors hover:bg-white/12 sm:w-72"
        >
          <SurahArtwork surah={highlighted} className="h-16 w-16 shrink-0" rounded="rounded-xl" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gold-200/70">
              {currentSurah ? (isPlaying ? 'En cours de lecture' : 'En pause') : 'Commencer l’écoute'}
            </p>
            <p className="font-display truncate text-base font-semibold text-white">
              {highlighted.number}. {highlighted.frenchName}
            </p>
            <p className="truncate text-xs text-emerald-100/60">{highlighted.englishName}</p>
          </div>
          <span
            onClick={(e) => {
              e.stopPropagation();
              if (currentSurah) togglePlay();
              else playSurah(highlighted);
            }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-300 text-ink-950 shadow-glow-gold transition-transform group-hover:scale-105"
          >
            {currentSurah && isPlaying ? (
              <Pause className="h-4.5 w-4.5 fill-ink-950" />
            ) : (
              <Play className="ml-0.5 h-4.5 w-4.5 fill-ink-950" />
            )}
          </span>
        </motion.button>
      </div>
    </div>
  );
}

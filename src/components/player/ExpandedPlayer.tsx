import { useState } from 'react';
import {
  Bookmark,
  ChevronDown,
  Gauge,
  Heart,
  Moon,
  Pause,
  Play,
  RefreshCw,
  Repeat,
  Repeat1,
  SkipBack,
  SkipForward,
  WifiOff,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { SeekBar } from '@/components/player/SeekBar';
import { SurahArtwork } from '@/components/surah/SurahArtwork';
import { IslamicPattern } from '@/components/common/IslamicPattern';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { cn, formatTime } from '@/lib/utils';
import type { SleepTimerMode } from '@/types';

const RATES = [0.75, 1, 1.25, 1.5, 1.75, 2];
const SLEEP_OPTIONS: { mode: SleepTimerMode; label: string }[] = [
  { mode: '15', label: '15 min' },
  { mode: '30', label: '30 min' },
  { mode: '45', label: '45 min' },
  { mode: '60', label: '1 heure' },
  { mode: 'end-of-surah', label: 'Fin de la sourate' },
];

export function ExpandedPlayer() {
  const navigate = useNavigate();
  const isExpanded = usePlayerStore((s) => s.isExpanded);
  const setExpanded = usePlayerStore((s) => s.setExpanded);
  const currentSurah = usePlayerStore((s) => s.currentSurah);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const error = usePlayerStore((s) => s.error);
  const retryPlayback = usePlayerStore((s) => s.retryPlayback);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const playNext = usePlayerStore((s) => s.playNext);
  const playPrevious = usePlayerStore((s) => s.playPrevious);
  const seek = usePlayerStore((s) => s.seek);
  const playbackRate = usePlayerStore((s) => s.playbackRate);
  const setPlaybackRate = usePlayerStore((s) => s.setPlaybackRate);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const cycleRepeatMode = usePlayerStore((s) => s.cycleRepeatMode);
  const sleepTimerMode = usePlayerStore((s) => s.sleepTimerMode);
  const sleepTimerRemaining = usePlayerStore((s) => s.sleepTimerRemaining);
  const setSleepTimer = usePlayerStore((s) => s.setSleepTimer);
  const clearSleepTimer = usePlayerStore((s) => s.clearSleepTimer);

  const isFavorite = useLibraryStore((s) => (currentSurah ? s.favorites.has(currentSurah.number) : false));
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const bookmarks = useLibraryStore((s) => s.bookmarks);
  const addBookmark = useLibraryStore((s) => s.addBookmark);

  const [showRateMenu, setShowRateMenu] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);

  if (!currentSurah) return null;
  const surahBookmarks = bookmarks.filter((b) => b.surahNumber === currentSurah.number);

  function handleAddBookmark() {
    addBookmark({
      surahNumber: currentSurah!.number,
      time: currentTime,
      title: `Repère à ${formatTime(currentTime)}`,
      notes: '',
    });
  }

  return (
    <BottomSheet open={isExpanded} onClose={() => setExpanded(false)} fullHeight>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 pb-2 pt-4 sm:pt-5">
          <button
            onClick={() => setExpanded(false)}
            className="rounded-full p-2 text-ink-900/50 hover:bg-ink-900/5 dark:text-white/50 dark:hover:bg-white/10"
            aria-label="Fermer le lecteur"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
          <p className="text-[11px] font-medium uppercase tracking-widest text-ink-900/40 dark:text-white/40">
            En cours de lecture
          </p>
          <button
            onClick={() => setShowBookmarks((v) => !v)}
            className={cn(
              'rounded-full p-2 transition-colors hover:bg-ink-900/5 dark:hover:bg-white/10',
              showBookmarks ? 'text-gold-500' : 'text-ink-900/50 dark:text-white/50'
            )}
            aria-label="Marque-pages"
          >
            <Bookmark className={cn('h-5 w-5', showBookmarks && 'fill-gold-400')} />
          </button>
        </div>

        {error && (
          <div className="mx-5 mb-1 flex flex-col gap-2 rounded-2xl border border-red-500/25 bg-red-500/5 p-3">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 shrink-0 text-red-500" />
              <p className="text-xs text-ink-900/70 dark:text-white/70">
                {error === 'offline-missing'
                  ? 'Cette sourate n’est pas encore disponible hors ligne.'
                  : 'Lecture interrompue. Vérifiez votre connexion et réessayez.'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => retryPlayback()}
                className="flex items-center gap-1 rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white dark:bg-emerald-500 dark:text-emerald-950"
              >
                <RefreshCw className="h-3 w-3" />
                Réessayer
              </button>
              {error === 'offline-missing' && (
                <button
                  onClick={() => {
                    setExpanded(false);
                    navigate('/settings');
                  }}
                  className="rounded-full border border-ink-900/12 px-3 py-1.5 text-xs font-medium text-ink-900/70 dark:border-white/15 dark:text-white/70"
                >
                  Télécharger
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 pb-8">
          {!showBookmarks ? (
            <>
              <div className="relative mx-auto mt-2 aspect-square w-full max-w-xs overflow-hidden rounded-[28px] shadow-lifted">
                <SurahArtwork surah={currentSurah} className="h-full w-full" rounded="rounded-[28px]" />
                <IslamicPattern className="absolute inset-0 text-gold-100" opacity={0.1} />
              </div>

              <div className="mt-7 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="font-display truncate text-2xl font-semibold text-ink-950 dark:text-white">
                    {currentSurah.number}. {currentSurah.frenchName}
                  </h1>
                  <p className="mt-0.5 text-sm text-ink-900/55 dark:text-white/50">
                    {currentSurah.englishName} · {currentSurah.verses} versets ·{' '}
                    {currentSurah.revelationType === 'Meccan' ? 'Mecquoise' : 'Médinoise'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-arabic text-2xl text-emerald-700 dark:text-gold-300">
                    {currentSurah.arabicName}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <SeekBar
                  value={currentTime}
                  max={duration || currentSurah.estimatedDuration}
                  onChange={(v) => usePlayerStore.setState({ currentTime: v })}
                  onCommit={seek}
                />
                <div className="mt-1 flex justify-between text-xs tabular-nums text-ink-900/45 dark:text-white/40">
                  <span>{formatTime(currentTime)}</span>
                  <span>-{formatTime(Math.max(0, (duration || currentSurah.estimatedDuration) - currentTime))}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={cycleRepeatMode}
                  className={cn(
                    'rounded-full p-2.5 transition-colors',
                    repeatMode !== 'off'
                      ? 'bg-emerald-900/8 text-emerald-700 dark:bg-white/10 dark:text-gold-300'
                      : 'text-ink-900/45 hover:bg-ink-900/5 dark:text-white/40 dark:hover:bg-white/10'
                  )}
                  aria-label="Mode de répétition"
                >
                  {repeatMode === 'one' ? <Repeat1 className="h-5 w-5" /> : <Repeat className="h-5 w-5" />}
                </button>

                <div className="flex items-center gap-5">
                  <button
                    onClick={playPrevious}
                    className="rounded-full p-2 text-ink-950 hover:bg-ink-900/5 dark:text-white dark:hover:bg-white/10"
                    aria-label="Sourate précédente"
                  >
                    <SkipBack className="h-6 w-6 fill-current" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-emerald-600 to-emerald-800 text-white shadow-lifted transition-transform active:scale-95 dark:from-gold-300 dark:to-gold-500 dark:text-ink-950"
                    aria-label={isPlaying ? 'Pause' : 'Lecture'}
                  >
                    {isPlaying ? (
                      <Pause className="h-7 w-7 fill-current" />
                    ) : (
                      <Play className="ml-1 h-7 w-7 fill-current" />
                    )}
                  </button>
                  <button
                    onClick={playNext}
                    className="rounded-full p-2 text-ink-950 hover:bg-ink-900/5 dark:text-white dark:hover:bg-white/10"
                    aria-label="Sourate suivante"
                  >
                    <SkipForward className="h-6 w-6 fill-current" />
                  </button>
                </div>

                <button
                  onClick={() => toggleFavorite(currentSurah.number)}
                  className={cn(
                    'rounded-full p-2.5 transition-colors hover:bg-ink-900/5 dark:hover:bg-white/10',
                    isFavorite ? 'text-gold-500' : 'text-ink-900/45 dark:text-white/40'
                  )}
                  aria-label="Favori"
                >
                  <Heart className={cn('h-5 w-5', isFavorite && 'fill-gold-400')} />
                </button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowRateMenu((v) => !v);
                      setShowSleepMenu(false);
                    }}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors',
                      playbackRate !== 1
                        ? 'border-emerald-600/30 bg-emerald-900/8 text-emerald-700 dark:border-gold-400/30 dark:bg-white/8 dark:text-gold-300'
                        : 'border-ink-900/10 text-ink-900/60 hover:bg-ink-900/5 dark:border-white/12 dark:text-white/55 dark:hover:bg-white/8'
                    )}
                  >
                    <Gauge className="h-3.5 w-3.5" />
                    {playbackRate}×
                  </button>
                  {showRateMenu && (
                    <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-2xl border border-ink-900/8 bg-white p-1.5 shadow-lifted dark:border-white/10 dark:bg-ink-800">
                      {RATES.map((rate) => (
                        <button
                          key={rate}
                          onClick={() => {
                            setPlaybackRate(rate);
                            setShowRateMenu(false);
                          }}
                          className={cn(
                            'block w-20 rounded-xl px-3 py-1.5 text-left text-sm',
                            rate === playbackRate
                              ? 'bg-emerald-900/8 text-emerald-700 dark:bg-white/10 dark:text-gold-300'
                              : 'text-ink-900/70 hover:bg-ink-900/5 dark:text-white/60 dark:hover:bg-white/8'
                          )}
                        >
                          {rate}×
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAddBookmark}
                  className="flex items-center gap-1.5 rounded-full border border-ink-900/10 px-3.5 py-2 text-xs font-medium text-ink-900/60 transition-colors hover:bg-ink-900/5 dark:border-white/12 dark:text-white/55 dark:hover:bg-white/8"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  Repère
                </button>

                <div className="relative">
                  <button
                    onClick={() => {
                      setShowSleepMenu((v) => !v);
                      setShowRateMenu(false);
                    }}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors',
                      sleepTimerMode
                        ? 'border-emerald-600/30 bg-emerald-900/8 text-emerald-700 dark:border-gold-400/30 dark:bg-white/8 dark:text-gold-300'
                        : 'border-ink-900/10 text-ink-900/60 hover:bg-ink-900/5 dark:border-white/12 dark:text-white/55 dark:hover:bg-white/8'
                    )}
                  >
                    <Moon className="h-3.5 w-3.5" />
                    {sleepTimerMode && sleepTimerRemaining != null
                      ? `${Math.floor(sleepTimerRemaining / 60)}:${String(sleepTimerRemaining % 60).padStart(2, '0')}`
                      : 'Minuterie'}
                  </button>
                  {showSleepMenu && (
                    <div className="absolute bottom-full right-0 mb-2 w-44 rounded-2xl border border-ink-900/8 bg-white p-1.5 shadow-lifted dark:border-white/10 dark:bg-ink-800">
                      {SLEEP_OPTIONS.map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => {
                            setSleepTimer(opt.mode);
                            setShowSleepMenu(false);
                          }}
                          className="block w-full rounded-xl px-3 py-1.5 text-left text-sm text-ink-900/70 hover:bg-ink-900/5 dark:text-white/60 dark:hover:bg-white/8"
                        >
                          {opt.label}
                        </button>
                      ))}
                      {sleepTimerMode && (
                        <button
                          onClick={() => {
                            clearSleepTimer();
                            setShowSleepMenu(false);
                          }}
                          className="mt-1 block w-full rounded-xl px-3 py-1.5 text-left text-sm text-red-500 hover:bg-red-500/8"
                        >
                          Désactiver
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <BookmarksList
              bookmarks={surahBookmarks}
              onSeek={(time) => {
                seek(time);
                setShowBookmarks(false);
              }}
            />
          )}
        </div>
      </div>
    </BottomSheet>
  );
}

function BookmarksList({
  bookmarks,
  onSeek,
}: {
  bookmarks: { id: string; time: number; title: string; notes: string }[];
  onSeek: (time: number) => void;
}) {
  const removeBookmark = useLibraryStore((s) => s.removeBookmark);

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <Bookmark className="h-8 w-8 text-ink-900/20 dark:text-white/20" />
        <p className="text-sm text-ink-900/50 dark:text-white/45">
          Aucun repère pour cette sourate. Ajoutez-en un depuis le lecteur.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      {bookmarks.map((b) => (
        <div
          key={b.id}
          className="flex items-center gap-3 rounded-2xl border border-ink-900/6 bg-white p-3 dark:border-white/8 dark:bg-ink-900"
        >
          <button onClick={() => onSeek(b.time)} className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium text-ink-950 dark:text-white">{b.title}</p>
            <p className="text-xs tabular-nums text-ink-900/45 dark:text-white/40">{formatTime(b.time)}</p>
          </button>
          <button
            onClick={() => removeBookmark(b.id)}
            className="rounded-full px-2.5 py-1 text-xs text-red-500 hover:bg-red-500/8"
          >
            Retirer
          </button>
        </div>
      ))}
    </div>
  );
}

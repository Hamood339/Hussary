import { create } from 'zustand';
import type { RepeatMode, SleepTimerMode, Surah } from '@/types';
import { SURAHS } from '@/data/surahs';
import { audioEngine } from '@/services/audioEngine';
import { dbApi } from '@/lib/db';
import { isCached } from '@/lib/offlineAudio';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * `offline-missing` : hors ligne et la sourate n'est pas telechargee.
 * `playback`        : echec de lecture cote navigateur (reseau, fichier illisible).
 */
export type PlayerError = 'offline-missing' | 'playback' | null;

interface PlayerState {
  currentSurah: Surah | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  repeatMode: RepeatMode;
  isExpanded: boolean;
  error: PlayerError;
  sleepTimerMode: SleepTimerMode;
  sleepTimerEndsAt: number | null;
  sleepTimerRemaining: number | null;

  playSurah: (surah: Surah, startAt?: number) => void;
  retryPlayback: () => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (time: number) => void;
  seekBy: (delta: number) => void;
  setPlaybackRate: (rate: number) => void;
  cycleRepeatMode: () => void;
  setExpanded: (expanded: boolean) => void;
  setSleepTimer: (mode: SleepTimerMode) => void;
  clearSleepTimer: () => void;
  tickSleepTimer: () => void;
  refreshMediaMetadata: () => void;
}

let sleepInterval: ReturnType<typeof setInterval> | null = null;
let listeningAccumulator = 0;
let lastFlush = Date.now();

function flushListeningTime() {
  const now = Date.now();
  const elapsed = (now - lastFlush) / 1000;
  lastFlush = now;
  if (elapsed > 0 && elapsed < 5) {
    listeningAccumulator += elapsed;
  }
  if (listeningAccumulator >= 5) {
    const toSave = Math.floor(listeningAccumulator);
    listeningAccumulator -= toSave;
    void dbApi.addListeningSeconds(toSave);
  }
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSurah: null,
  isPlaying: false,
  isBuffering: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  repeatMode: 'off',
  isExpanded: false,
  error: null,
  sleepTimerMode: null,
  sleepTimerEndsAt: null,
  sleepTimerRemaining: null,

  playSurah: (surah, startAt = 0) => {
    const { playbackRate } = get();
    set({ currentSurah: surah, currentTime: startAt, error: null });
    audioEngine.load(surah.audioSrc, true, startAt);
    audioEngine.setPlaybackRate(playbackRate);
    get().refreshMediaMetadata();
    void dbApi.recordHistory(surah.number, startAt);

    // Retour immediat si on est hors ligne et que le fichier n'est pas en cache,
    // au lieu de laisser l'utilisateur devant un lecteur muet.
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      void isCached(surah.audioSrc).then((cached) => {
        if (!cached && get().currentSurah?.number === surah.number) {
          audioEngine.pause();
          set({ error: 'offline-missing' });
        }
      });
    }
  },

  retryPlayback: () => {
    const { currentSurah } = get();
    if (!currentSurah) return;
    set({ error: null });
    audioEngine.reload();
  },

  togglePlay: () => {
    const { currentSurah } = get();
    if (!currentSurah) return;
    audioEngine.toggle();
  },

  playNext: () => {
    const { currentSurah } = get();
    if (!currentSurah) return;
    const idx = SURAHS.findIndex((s) => s.number === currentSurah.number);
    const next = SURAHS[(idx + 1) % SURAHS.length];
    get().playSurah(next);
  },

  playPrevious: () => {
    const { currentSurah } = get();
    if (!currentSurah) return;
    const idx = SURAHS.findIndex((s) => s.number === currentSurah.number);
    const prev = SURAHS[(idx - 1 + SURAHS.length) % SURAHS.length];
    get().playSurah(prev);
  },

  seek: (time) => {
    audioEngine.seek(time);
    set({ currentTime: time });
  },

  seekBy: (delta) => {
    audioEngine.seekBy(delta);
  },

  setPlaybackRate: (rate) => {
    audioEngine.setPlaybackRate(rate);
    set({ playbackRate: rate });
  },

  cycleRepeatMode: () => {
    const order: RepeatMode[] = ['off', 'all', 'one'];
    const next = order[(order.indexOf(get().repeatMode) + 1) % order.length];
    set({ repeatMode: next });
  },

  setExpanded: (expanded) => set({ isExpanded: expanded }),

  setSleepTimer: (mode) => {
    if (sleepInterval) clearInterval(sleepInterval);
    if (mode === null) {
      set({ sleepTimerMode: null, sleepTimerEndsAt: null, sleepTimerRemaining: null });
      return;
    }
    if (mode === 'end-of-surah') {
      set({ sleepTimerMode: mode, sleepTimerEndsAt: null, sleepTimerRemaining: null });
      return;
    }
    const minutes = parseInt(mode, 10);
    const endsAt = Date.now() + minutes * 60 * 1000;
    set({ sleepTimerMode: mode, sleepTimerEndsAt: endsAt, sleepTimerRemaining: minutes * 60 });
    sleepInterval = setInterval(() => get().tickSleepTimer(), 1000);
  },

  clearSleepTimer: () => {
    if (sleepInterval) clearInterval(sleepInterval);
    sleepInterval = null;
    set({ sleepTimerMode: null, sleepTimerEndsAt: null, sleepTimerRemaining: null });
  },

  tickSleepTimer: () => {
    const { sleepTimerEndsAt } = get();
    if (!sleepTimerEndsAt) return;
    const remaining = Math.max(0, Math.round((sleepTimerEndsAt - Date.now()) / 1000));
    set({ sleepTimerRemaining: remaining });
    if (remaining <= 0) {
      audioEngine.pause();
      get().clearSleepTimer();
    }
  },

  refreshMediaMetadata: () => {
    const { currentSurah } = get();
    if (!currentSurah) return;
    // On pose TOUJOURS des metadonnees MediaSession : c'est ce qui maintient la
    // lecture active en arriere-plan sur mobile (surtout Android, ou l'audio est
    // coupe s'il n'y a pas de notification media). Le reglage "notifications" ne
    // fait plus que masquer le nom de la sourate.
    const showDetails = useSettingsStore.getState().notificationsEnabled;
    audioEngine.updateMediaMetadata(
      showDetails
        ? {
            title: `${currentSurah.number}. ${currentSurah.frenchName}`,
            artist: 'Cheikh Mahmoud Khalil Al-Hussary',
            album: 'Hussary Quran',
          }
        : { title: 'Hussary Quran', artist: '', album: 'Hussary Quran' },
    );
  },
}));

/**
 * Wires the shared audioEngine singleton into the zustand store, and handles
 * cross-cutting playback behaviours (repeat modes, auto-next, sleep timer at
 * end of surah, continue-listening persistence, listening-time stats).
 * Call once near the app root.
 */
export function initPlayerEngineSync() {
  const unsubscribeState = audioEngine.subscribe((state) => {
    let error = usePlayerStore.getState().error;
    if (state.error) error = error === 'offline-missing' ? 'offline-missing' : 'playback';
    else if (state.isPlaying) error = null; // la lecture a repris -> on efface

    usePlayerStore.setState({
      isPlaying: state.isPlaying,
      isBuffering: state.isBuffering,
      currentTime: state.currentTime,
      duration: state.duration || usePlayerStore.getState().currentSurah?.estimatedDuration || 0,
      error,
    });
    audioEngine.setMediaPlaybackState(state.isPlaying ? 'playing' : 'paused');
    audioEngine.updatePositionState();
    if (state.isPlaying) {
      flushListeningTime();
    } else {
      lastFlush = Date.now();
    }
  });

  const persistInterval = setInterval(() => {
    const { currentSurah, currentTime, playbackRate, isPlaying } = usePlayerStore.getState();
    if (currentSurah && isPlaying) {
      void dbApi.setContinueListening({
        surahNumber: currentSurah.number,
        position: currentTime,
        playbackRate,
        updatedAt: Date.now(),
      });
      flushListeningTime();
    }
  }, 4000);

  const unsubscribeEnded = audioEngine.onEnded(() => {
    const { repeatMode, sleepTimerMode, currentSurah } = usePlayerStore.getState();
    if (currentSurah) void dbApi.markCompleted(currentSurah.number);

    if (sleepTimerMode === 'end-of-surah') {
      usePlayerStore.getState().clearSleepTimer();
      return;
    }
    if (repeatMode === 'one') {
      audioEngine.seek(0);
      void audioEngine.play();
      return;
    }
    if (repeatMode === 'all' || useSettingsStore.getState().autoplay) {
      usePlayerStore.getState().playNext();
      return;
    }
  });

  audioEngine.setMediaSessionHandlers({
    play: () => void audioEngine.play(),
    pause: () => audioEngine.pause(),
    previous: () => usePlayerStore.getState().playPrevious(),
    next: () => usePlayerStore.getState().playNext(),
    seekBackward: () => audioEngine.seekBy(-10),
    seekForward: () => audioEngine.seekBy(10),
    seekTo: (time) => audioEngine.seek(time),
  });

  return () => {
    unsubscribeState();
    unsubscribeEnded();
    clearInterval(persistInterval);
  };
}

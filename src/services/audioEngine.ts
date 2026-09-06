export type AudioEngineListener = (state: AudioEngineState) => void;

export interface AudioEngineState {
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  error: string | null;
}

/**
 * A single shared <audio> element for the whole app. Keeping one instance
 * (rather than one per component) is what makes background/lock-screen
 * playback and the Media Session API behave correctly.
 */
class AudioEngine {
  private audio: HTMLAudioElement;
  private listeners = new Set<AudioEngineListener>();
  private state: AudioEngineState = {
    isPlaying: false,
    isBuffering: false,
    currentTime: 0,
    duration: 0,
    error: null,
  };

  // --- Recuperation automatique en cas de coupure reseau / blocage buffer ---
  private stalledTimer: ReturnType<typeof setTimeout> | null = null;
  private retries = 0;
  private intendedPlaying = false; // ce que l'utilisateur veut, independamment de l'etat reel

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.bindEvents();
  }

  private bindEvents() {
    const a = this.audio;
    a.addEventListener('play', () => this.update({ isPlaying: true, error: null }));
    a.addEventListener('pause', () => this.update({ isPlaying: false }));
    a.addEventListener('waiting', () => {
      this.update({ isBuffering: true });
      this.armStalledTimer();
    });
    a.addEventListener('stalled', () => this.armStalledTimer());
    a.addEventListener('playing', () => {
      this.retries = 0;
      this.clearStalledTimer();
      this.update({ isBuffering: false });
    });
    a.addEventListener('canplay', () => {
      this.clearStalledTimer();
      this.update({ isBuffering: false });
    });
    a.addEventListener('timeupdate', () => this.update({ currentTime: a.currentTime }));
    a.addEventListener('durationchange', () => {
      if (Number.isFinite(a.duration)) this.update({ duration: a.duration });
    });
    a.addEventListener('error', () => this.recover());
  }

  private armStalledTimer() {
    this.clearStalledTimer();
    // Le buffer est vide depuis trop longtemps -> on tente une recuperation.
    this.stalledTimer = setTimeout(() => {
      if (this.intendedPlaying && this.audio.readyState < 3) this.recover();
    }, 15000);
  }

  private clearStalledTimer() {
    if (this.stalledTimer) {
      clearTimeout(this.stalledTimer);
      this.stalledTimer = null;
    }
  }

  /**
   * Recharge la source et reprend a la position courante. Plafonne a 3 essais
   * (avec un delai croissant) avant d'abandonner et de remonter une erreur.
   */
  private recover() {
    this.clearStalledTimer();
    if (!this.audio.src) return;
    if (this.retries >= 3) {
      this.update({ error: 'Impossible de lire ce fichier audio.', isBuffering: false, isPlaying: false });
      return;
    }
    this.retries += 1;
    const resumeAt = this.audio.currentTime || 0;
    const delay = 1200 * this.retries;
    setTimeout(() => {
      if (!this.audio.src) return;
      this.audio.load();
      const onLoaded = () => {
        this.audio.removeEventListener('loadedmetadata', onLoaded);
        try {
          if (resumeAt > 0) this.audio.currentTime = resumeAt;
        } catch {
          // position invalide -> on repart du debut
        }
        if (this.intendedPlaying) void this.play();
      };
      this.audio.addEventListener('loadedmetadata', onLoaded);
    }, delay);
  }

  /** Recuperation declenchee manuellement par l'utilisateur ("Reessayer"). */
  reload() {
    this.retries = 0;
    this.intendedPlaying = true;
    this.recover();
  }

  private update(partial: Partial<AudioEngineState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((l) => l(this.state));
  }

  subscribe(listener: AudioEngineListener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  getState() {
    return this.state;
  }

  load(src: string, autoplay: boolean, startAt = 0) {
    this.retries = 0;
    this.clearStalledTimer();
    if (autoplay) this.intendedPlaying = true;
    if (this.audio.src.endsWith(src)) {
      if (startAt > 0) this.audio.currentTime = startAt;
      if (autoplay) void this.play();
      return;
    }
    this.audio.src = src;
    this.audio.load();
    if (startAt > 0) {
      const onLoaded = () => {
        this.audio.currentTime = startAt;
        this.audio.removeEventListener('loadedmetadata', onLoaded);
      };
      this.audio.addEventListener('loadedmetadata', onLoaded);
    }
    if (autoplay) void this.play();
  }

  async play() {
    this.intendedPlaying = true;
    try {
      await this.audio.play();
    } catch {
      this.update({ isPlaying: false });
    }
  }

  pause() {
    this.intendedPlaying = false;
    this.clearStalledTimer();
    this.audio.pause();
  }

  toggle() {
    if (this.audio.paused) void this.play();
    else this.pause();
  }

  seek(time: number) {
    this.audio.currentTime = Math.max(0, Math.min(time, this.audio.duration || time));
  }

  seekBy(delta: number) {
    this.seek(this.audio.currentTime + delta);
  }

  setPlaybackRate(rate: number) {
    this.audio.playbackRate = rate;
  }

  getCurrentTime() {
    return this.audio.currentTime;
  }

  getDuration() {
    return this.audio.duration || 0;
  }

  onEnded(cb: () => void) {
    this.audio.addEventListener('ended', cb);
    return () => this.audio.removeEventListener('ended', cb);
  }

  setMediaSessionHandlers(handlers: {
    play: () => void;
    pause: () => void;
    previous: () => void;
    next: () => void;
    seekBackward?: () => void;
    seekForward?: () => void;
    seekTo?: (time: number) => void;
  }) {
    if (!('mediaSession' in navigator)) return;
    const ms = navigator.mediaSession;
    ms.setActionHandler('play', handlers.play);
    ms.setActionHandler('pause', handlers.pause);
    ms.setActionHandler('previoustrack', handlers.previous);
    ms.setActionHandler('nexttrack', handlers.next);
    ms.setActionHandler('seekbackward', () => handlers.seekBackward?.());
    ms.setActionHandler('seekforward', () => handlers.seekForward?.());
    try {
      ms.setActionHandler('seekto', (details) => {
        if (details.seekTime != null) handlers.seekTo?.(details.seekTime);
      });
    } catch {
      // seekto isn't supported everywhere
    }
  }

  updateMediaMetadata(meta: { title: string; artist: string; album: string; artwork?: string }) {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: meta.title,
      artist: meta.artist,
      album: meta.album,
      artwork: meta.artwork
        ? [
            { src: meta.artwork, sizes: '512x512', type: 'image/png' },
            { src: meta.artwork, sizes: '192x192', type: 'image/png' },
          ]
        : [],
    });
  }

  clearMediaMetadata() {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = null;
  }

  updatePositionState() {
    if (!('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) return;
    const duration = this.audio.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    try {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: this.audio.playbackRate,
        position: Math.min(this.audio.currentTime, duration),
      });
    } catch {
      // ignore
    }
  }

  setMediaPlaybackState(state: 'playing' | 'paused' | 'none') {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = state;
  }
}

export const audioEngine = new AudioEngine();

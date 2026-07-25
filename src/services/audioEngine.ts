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

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.bindEvents();
  }

  private bindEvents() {
    const a = this.audio;
    a.addEventListener('play', () => this.update({ isPlaying: true, error: null }));
    a.addEventListener('pause', () => this.update({ isPlaying: false }));
    a.addEventListener('waiting', () => this.update({ isBuffering: true }));
    a.addEventListener('playing', () => this.update({ isBuffering: false }));
    a.addEventListener('canplay', () => this.update({ isBuffering: false }));
    a.addEventListener('timeupdate', () => this.update({ currentTime: a.currentTime }));
    a.addEventListener('durationchange', () => {
      if (Number.isFinite(a.duration)) this.update({ duration: a.duration });
    });
    a.addEventListener('error', () => {
      this.update({ error: 'Impossible de lire ce fichier audio.', isBuffering: false, isPlaying: false });
    });
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
    try {
      await this.audio.play();
    } catch {
      this.update({ isPlaying: false });
    }
  }

  pause() {
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

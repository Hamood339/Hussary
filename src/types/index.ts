export type RevelationType = 'Meccan' | 'Medinan';

export interface Surah {
  number: number;
  id: string; // zero-padded "001".."114"
  arabicName: string;
  englishName: string;
  frenchName: string;
  verses: number;
  revelationType: RevelationType;
  estimatedDuration: number; // seconds, heuristic until real duration is probed
  audioSrc: string;
}

export type RepeatMode = 'off' | 'one' | 'all';

export type SleepTimerMode = '15' | '30' | '45' | '60' | 'end-of-surah' | null;

export type ThemePreference = 'light' | 'dark' | 'system';

export type SortOption = 'number' | 'alphabetical' | 'revelation';

export interface FavoriteRecord {
  surahNumber: number;
  addedAt: number;
}

export interface HistoryRecord {
  surahNumber: number;
  playedAt: number;
  position: number;
}

export interface BookmarkRecord {
  id: string;
  surahNumber: number;
  time: number;
  title: string;
  notes: string;
  createdAt: number;
}

export interface ContinueListeningRecord {
  surahNumber: number;
  position: number;
  playbackRate: number;
  updatedAt: number;
}

export interface AppSettings {
  theme: ThemePreference;
  autoplay: boolean;
  notificationsEnabled: boolean;
}

export interface DailyStatRecord {
  date: string; // YYYY-MM-DD
  seconds: number;
}

export interface StatsSummary {
  totalListeningSeconds: number;
  favoritesCount: number;
  completedCount: number;
  dailyStreak: number;
}

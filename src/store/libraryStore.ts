import { create } from 'zustand';
import type { BookmarkRecord, ContinueListeningRecord, HistoryRecord } from '@/types';
import { dbApi } from '@/lib/db';
import { generateId, localDateKey } from '@/lib/utils';

interface LibraryState {
  favorites: Set<number>;
  history: HistoryRecord[];
  bookmarks: BookmarkRecord[];
  completed: Set<number>;
  continueListening: ContinueListeningRecord | null;
  totalListeningSeconds: number;
  dailyStreak: number;
  isLoaded: boolean;

  hydrate: () => Promise<void>;
  refreshStats: () => Promise<void>;
  toggleFavorite: (surahNumber: number) => Promise<void>;
  isFavorite: (surahNumber: number) => boolean;
  recordPlay: (surahNumber: number, position: number) => Promise<void>;
  addBookmark: (input: { surahNumber: number; time: number; title: string; notes: string }) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
}

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const set = new Set(dates);
  const cursor = new Date();
  // If nothing has been listened to yet today, start counting from
  // yesterday so the streak doesn't drop to 0 before the day is over.
  if (!set.has(localDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(localDateKey(cursor))) return 0;
  }
  let streak = 0;
  for (;;) {
    const key = localDateKey(cursor);
    if (set.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  favorites: new Set(),
  history: [],
  bookmarks: [],
  completed: new Set(),
  continueListening: null,
  totalListeningSeconds: 0,
  dailyStreak: 0,
  isLoaded: false,

  hydrate: async () => {
    const [favorites, history, bookmarks, completed, continueListening, dailyStats] = await Promise.all([
      dbApi.getFavorites(),
      dbApi.getHistory(),
      dbApi.getBookmarks(),
      dbApi.getCompleted(),
      dbApi.getContinueListening(),
      dbApi.getDailyStats(),
    ]);
    set({
      favorites: new Set(favorites.map((f) => f.surahNumber)),
      history,
      bookmarks,
      completed: new Set(completed),
      continueListening: continueListening ?? null,
      totalListeningSeconds: dailyStats.reduce((sum, d) => sum + d.seconds, 0),
      dailyStreak: computeStreak(dailyStats.filter((d) => d.seconds > 0).map((d) => d.date)),
      isLoaded: true,
    });
  },

  refreshStats: async () => {
    const dailyStats = await dbApi.getDailyStats();
    set({
      totalListeningSeconds: dailyStats.reduce((sum, d) => sum + d.seconds, 0),
      dailyStreak: computeStreak(dailyStats.filter((d) => d.seconds > 0).map((d) => d.date)),
    });
  },

  toggleFavorite: async (surahNumber) => {
    const nowFav = await dbApi.toggleFavorite(surahNumber);
    set((state) => {
      const next = new Set(state.favorites);
      if (nowFav) next.add(surahNumber);
      else next.delete(surahNumber);
      return { favorites: next };
    });
  },

  isFavorite: (surahNumber) => get().favorites.has(surahNumber),

  recordPlay: async (surahNumber, position) => {
    await dbApi.recordHistory(surahNumber, position);
    const history = await dbApi.getHistory();
    set({ history });
  },

  addBookmark: async ({ surahNumber, time, title, notes }) => {
    const record: BookmarkRecord = {
      id: generateId(),
      surahNumber,
      time,
      title,
      notes,
      createdAt: Date.now(),
    };
    await dbApi.addBookmark(record);
    set((state) => ({ bookmarks: [record, ...state.bookmarks] }));
  },

  removeBookmark: async (id) => {
    await dbApi.removeBookmark(id);
    set((state) => ({ bookmarks: state.bookmarks.filter((b) => b.id !== id) }));
  },
}));

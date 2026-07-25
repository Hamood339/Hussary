import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type {
  AppSettings,
  BookmarkRecord,
  ContinueListeningRecord,
  DailyStatRecord,
  FavoriteRecord,
  HistoryRecord,
} from '@/types';

const DB_NAME = 'hussary-quran-db';
const DB_VERSION = 1;

interface HussaryDB extends DBSchema {
  favorites: {
    key: number;
    value: FavoriteRecord;
  };
  history: {
    key: number;
    value: HistoryRecord;
    indexes: { byPlayedAt: number };
  };
  bookmarks: {
    key: string;
    value: BookmarkRecord;
    indexes: { bySurah: number };
  };
  continueListening: {
    key: string;
    value: ContinueListeningRecord;
  };
  settings: {
    key: string;
    value: AppSettings;
  };
  dailyStats: {
    key: string;
    value: DailyStatRecord;
  };
  completed: {
    key: number;
    value: { surahNumber: number; completedAt: number };
  };
}

let dbPromise: Promise<IDBPDatabase<HussaryDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<HussaryDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('favorites')) {
          db.createObjectStore('favorites', { keyPath: 'surahNumber' });
        }
        if (!db.objectStoreNames.contains('history')) {
          const store = db.createObjectStore('history', { keyPath: 'surahNumber' });
          store.createIndex('byPlayedAt', 'playedAt');
        }
        if (!db.objectStoreNames.contains('bookmarks')) {
          const store = db.createObjectStore('bookmarks', { keyPath: 'id' });
          store.createIndex('bySurah', 'surahNumber');
        }
        if (!db.objectStoreNames.contains('continueListening')) {
          db.createObjectStore('continueListening');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        if (!db.objectStoreNames.contains('dailyStats')) {
          db.createObjectStore('dailyStats', { keyPath: 'date' });
        }
        if (!db.objectStoreNames.contains('completed')) {
          db.createObjectStore('completed', { keyPath: 'surahNumber' });
        }
      },
    });
  }
  return dbPromise;
}

const HISTORY_LIMIT = 30;
const SETTINGS_KEY = 'app-settings';
const CONTINUE_KEY = 'current';

export const dbApi = {
  // Favorites
  async getFavorites(): Promise<FavoriteRecord[]> {
    const db = await getDB();
    return db.getAll('favorites');
  },
  async toggleFavorite(surahNumber: number): Promise<boolean> {
    const db = await getDB();
    const existing = await db.get('favorites', surahNumber);
    if (existing) {
      await db.delete('favorites', surahNumber);
      return false;
    }
    await db.put('favorites', { surahNumber, addedAt: Date.now() });
    return true;
  },

  // History (recently played, capped at 30, most recent surah wins the slot)
  async getHistory(): Promise<HistoryRecord[]> {
    const db = await getDB();
    const all = await db.getAllFromIndex('history', 'byPlayedAt');
    return all.reverse().slice(0, HISTORY_LIMIT);
  },
  async recordHistory(surahNumber: number, position: number): Promise<void> {
    const db = await getDB();
    await db.put('history', { surahNumber, playedAt: Date.now(), position });
    const all = await db.getAllFromIndex('history', 'byPlayedAt');
    if (all.length > HISTORY_LIMIT) {
      const toRemove = all.slice(0, all.length - HISTORY_LIMIT);
      const tx = db.transaction('history', 'readwrite');
      await Promise.all(toRemove.map((r) => tx.store.delete(r.surahNumber)));
      await tx.done;
    }
  },

  // Bookmarks
  async getBookmarks(): Promise<BookmarkRecord[]> {
    const db = await getDB();
    return (await db.getAll('bookmarks')).sort((a, b) => b.createdAt - a.createdAt);
  },
  async addBookmark(record: BookmarkRecord): Promise<void> {
    const db = await getDB();
    await db.put('bookmarks', record);
  },
  async removeBookmark(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('bookmarks', id);
  },

  // Continue listening (single active record)
  async getContinueListening(): Promise<ContinueListeningRecord | undefined> {
    const db = await getDB();
    return db.get('continueListening', CONTINUE_KEY);
  },
  async setContinueListening(record: ContinueListeningRecord): Promise<void> {
    const db = await getDB();
    await db.put('continueListening', record, CONTINUE_KEY);
  },

  // Settings
  async getSettings(): Promise<AppSettings | undefined> {
    const db = await getDB();
    return db.get('settings', SETTINGS_KEY);
  },
  async setSettings(settings: AppSettings): Promise<void> {
    const db = await getDB();
    await db.put('settings', settings, SETTINGS_KEY);
  },

  // Daily listening stats
  async addListeningSeconds(seconds: number): Promise<void> {
    if (seconds <= 0) return;
    const db = await getDB();
    const today = new Date().toISOString().slice(0, 10);
    const existing = await db.get('dailyStats', today);
    await db.put('dailyStats', {
      date: today,
      seconds: (existing?.seconds ?? 0) + seconds,
    });
  },
  async getDailyStats(): Promise<DailyStatRecord[]> {
    const db = await getDB();
    return db.getAll('dailyStats');
  },

  // Completed recitations
  async markCompleted(surahNumber: number): Promise<void> {
    const db = await getDB();
    await db.put('completed', { surahNumber, completedAt: Date.now() });
  },
  async getCompleted(): Promise<number[]> {
    const db = await getDB();
    return (await db.getAll('completed')).map((c) => c.surahNumber);
  },

  // Full reset
  async resetAll(): Promise<void> {
    const db = await getDB();
    await Promise.all(
      ['favorites', 'history', 'bookmarks', 'continueListening', 'settings', 'dailyStats', 'completed'].map(
        (name) => db.clear(name as never)
      )
    );
  },
};

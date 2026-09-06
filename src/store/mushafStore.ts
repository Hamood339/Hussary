import { create } from 'zustand';
import { dbApi } from '@/lib/db';
import { clampPage } from '@/lib/mushafData';

const FONT_SCALE_KEY = 'hussary-mushaf-font-scale';
export const FONT_SCALE_MIN = 0.8;
export const FONT_SCALE_MAX = 1.4;
const FONT_SCALE_STEP = 0.1;

function readStoredScale(): number {
  try {
    const v = parseFloat(localStorage.getItem(FONT_SCALE_KEY) ?? '');
    if (Number.isFinite(v)) return Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, v));
  } catch {
    /* ignore */
  }
  return 1;
}

interface MushafState {
  currentPage: number;
  fontScale: number;
  isLoaded: boolean;

  hydrate: () => Promise<void>;
  setPage: (page: number) => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  adjustFontScale: (delta: number) => void;
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;

function persistPage(page: number) {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    void dbApi.setReadingPosition({ page, updatedAt: Date.now() });
  }, 600);
}

export const useMushafStore = create<MushafState>((set, get) => ({
  currentPage: 1,
  fontScale: 1,
  isLoaded: false,

  hydrate: async () => {
    const stored = await dbApi.getReadingPosition();
    set({
      currentPage: stored ? clampPage(stored.page) : 1,
      fontScale: readStoredScale(),
      isLoaded: true,
    });
  },

  // Changement "doux" (pagination) : persiste avec debounce.
  setPage: (page) => {
    const next = clampPage(page);
    if (next === get().currentPage) return;
    set({ currentPage: next });
    persistPage(next);
  },

  // Saut explicite (index) : persiste immediatement.
  goToPage: (page) => {
    const next = clampPage(page);
    set({ currentPage: next });
    if (persistTimer) clearTimeout(persistTimer);
    void dbApi.setReadingPosition({ page: next, updatedAt: Date.now() });
  },

  nextPage: () => get().setPage(get().currentPage + 1),
  prevPage: () => get().setPage(get().currentPage - 1),

  adjustFontScale: (delta) => {
    const next = Math.round(
      Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, get().fontScale + delta * FONT_SCALE_STEP)) *
        100,
    ) / 100;
    set({ fontScale: next });
    try {
      localStorage.setItem(FONT_SCALE_KEY, String(next));
    } catch {
      /* ignore */
    }
  },
}));

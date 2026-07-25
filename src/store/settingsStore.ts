import { create } from 'zustand';
import type { AppSettings, ThemePreference } from '@/types';
import { dbApi } from '@/lib/db';

interface SettingsState extends AppSettings {
  isLoaded: boolean;
  hydrate: () => Promise<void>;
  setTheme: (theme: ThemePreference) => Promise<void>;
  setPlaybackRate: (rate: number) => Promise<void>;
  setAutoplay: (value: boolean) => Promise<void>;
  setNotificationsEnabled: (value: boolean) => Promise<void>;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  playbackRate: 1,
  autoplay: true,
  notificationsEnabled: false,
};

function applyThemeToDocument(theme: ThemePreference) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
  root.classList.toggle('dark', isDark);
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  isLoaded: false,

  hydrate: async () => {
    const stored = await dbApi.getSettings();
    const settings = stored ?? DEFAULT_SETTINGS;
    set({ ...settings, isLoaded: true });
    applyThemeToDocument(settings.theme);
    if (!stored) await dbApi.setSettings(settings);

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (get().theme === 'system') applyThemeToDocument('system');
      });
    }
  },

  setTheme: async (theme) => {
    set({ theme });
    applyThemeToDocument(theme);
    await dbApi.setSettings({ ...get(), theme });
  },

  setPlaybackRate: async (playbackRate) => {
    set({ playbackRate });
    await dbApi.setSettings({ ...get(), playbackRate });
  },

  setAutoplay: async (autoplay) => {
    set({ autoplay });
    await dbApi.setSettings({ ...get(), autoplay });
  },

  setNotificationsEnabled: async (notificationsEnabled) => {
    set({ notificationsEnabled });
    await dbApi.setSettings({ ...get(), notificationsEnabled });
  },
}));

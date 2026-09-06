import { useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/layouts/AppShell';
import { HomePage } from '@/pages/HomePage';
import { SurahsPage } from '@/pages/SurahsPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { RecentPage } from '@/pages/RecentPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { Onboarding } from '@/components/common/Onboarding';
import { InstallBanner } from '@/components/common/InstallBanner';
import { UpdateNotification } from '@/components/common/UpdateNotification';
import { useLibraryStore } from '@/store/libraryStore';
import { useSettingsStore } from '@/store/settingsStore';
import { initPlayerEngineSync } from '@/store/playerStore';
import { requestPersistentStorage } from '@/lib/offlineAudio';

export default function App() {
  const hydrateLibrary = useLibraryStore((s) => s.hydrate);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);

  useEffect(() => {
    void hydrateLibrary();
    void hydrateSettings();
    void requestPersistentStorage();
    const cleanup = initPlayerEngineSync();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <HashRouter>
      <Onboarding />
      <InstallBanner />
      <UpdateNotification />
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/surahs" element={<SurahsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/recent" element={<RecentPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

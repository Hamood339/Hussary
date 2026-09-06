import { Outlet } from 'react-router-dom';
import { WifiOff } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { MiniPlayer } from '@/components/player/MiniPlayer';
import { ExpandedPlayer } from '@/components/player/ExpandedPlayer';
import { usePlayerStore } from '@/store/playerStore';
import { useOnline } from '@/hooks/useOnline';

export function AppShell() {
  const hasTrack = usePlayerStore((s) => Boolean(s.currentSurah));
  const online = useOnline();

  return (
    <div className="min-h-screen bg-[#faf8f3] dark:bg-ink-950">
      {!online && (
        <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-1.5 bg-ink-900 py-1 text-[11px] font-medium text-white/80">
          <WifiOff className="h-3 w-3" />
          Hors ligne — seules les sourates téléchargées sont lisibles
        </div>
      )}
      <Sidebar />
      <div className="sm:pl-64">
        <main className={`mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-8 sm:pt-8 ${hasTrack ? 'pb-40' : 'pb-24'}`}>
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <MiniPlayer />
      <ExpandedPlayer />
    </div>
  );
}

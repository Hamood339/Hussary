import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { MiniPlayer } from '@/components/player/MiniPlayer';
import { ExpandedPlayer } from '@/components/player/ExpandedPlayer';
import { usePlayerStore } from '@/store/playerStore';

export function AppShell() {
  const hasTrack = usePlayerStore((s) => Boolean(s.currentSurah));

  return (
    <div className="min-h-screen bg-[#faf8f3] dark:bg-ink-950">
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

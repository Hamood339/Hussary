import { motion } from 'framer-motion';
import { Clock, Flame, Heart, ListChecks } from 'lucide-react';
import { useLibraryStore } from '@/store/libraryStore';
import { formatDuration } from '@/lib/utils';

const cards = [
  {
    key: 'time' as const,
    icon: Clock,
    label: 'Écoute totale',
  },
  {
    key: 'favorites' as const,
    icon: Heart,
    label: 'Favoris',
  },
  {
    key: 'completed' as const,
    icon: ListChecks,
    label: 'Terminées',
  },
  {
    key: 'streak' as const,
    icon: Flame,
    label: 'Série de jours',
  },
];

export function StatsGrid() {
  const totalListeningSeconds = useLibraryStore((s) => s.totalListeningSeconds);
  const favoritesCount = useLibraryStore((s) => s.favorites.size);
  const completedCount = useLibraryStore((s) => s.completed.size);
  const dailyStreak = useLibraryStore((s) => s.dailyStreak);

  const values: Record<(typeof cards)[number]['key'], string> = {
    time: totalListeningSeconds > 0 ? formatDuration(totalListeningSeconds) : '0 min',
    favorites: String(favoritesCount),
    completed: String(completedCount),
    streak: `${dailyStreak} j`,
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map(({ key, icon: Icon, label }, i) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="rounded-2xl border border-ink-900/6 bg-white p-4 shadow-soft dark:border-white/8 dark:bg-ink-900"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-900/8 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
            <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
          </div>
          <p className="font-display mt-3 text-xl font-semibold text-ink-950 dark:text-white">{values[key]}</p>
          <p className="text-xs text-ink-900/50 dark:text-white/45">{label}</p>
        </motion.div>
      ))}
    </div>
  );
}

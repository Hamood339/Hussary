import { NavLink } from 'react-router-dom';
import { BookHeart, Clock, Home, ListMusic, Moon, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { to: '/', label: 'Accueil', icon: Home },
  { to: '/surahs', label: 'Sourates', icon: ListMusic },
  { to: '/favorites', label: 'Favoris', icon: BookHeart },
  { to: '/recent', label: 'Récemment écoutées', icon: Clock },
  { to: '/settings', label: 'Réglages', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 shrink-0 flex-col border-r border-ink-900/6 bg-white/70 px-4 py-6 backdrop-blur-xl dark:border-white/8 dark:bg-ink-950/60 sm:flex">
      <div className="flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-900 text-gold-200 shadow-soft">
          <Moon className="h-4.5 w-4.5" fill="currentColor" strokeWidth={0} />
        </div>
        <div>
          <p className="font-display text-[15px] font-semibold leading-tight text-ink-950 dark:text-white">
            Hussary Quran
          </p>
          <p className="text-[11px] text-ink-900/45 dark:text-white/40">Lecteur hors ligne</p>
        </div>
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-emerald-900/8 text-emerald-800 dark:bg-white/8 dark:text-gold-300'
                  : 'text-ink-900/60 hover:bg-ink-900/5 dark:text-white/55 dark:hover:bg-white/5'
              )
            }
          >
            <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-gold-300/30 bg-gradient-to-br from-gold-50 to-transparent p-4 dark:border-gold-400/15 dark:from-gold-400/5">
        <p className="font-display text-sm font-semibold text-ink-950 dark:text-white">100% hors ligne</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-900/55 dark:text-white/45">
          Aucun fichier n’est jamais téléchargé depuis internet. Toute la récitation vit sur cet appareil.
        </p>
      </div>
    </aside>
  );
}

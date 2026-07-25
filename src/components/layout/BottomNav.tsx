import { NavLink } from 'react-router-dom';
import { BookHeart, Home, ListMusic, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { to: '/', label: 'Accueil', icon: Home },
  { to: '/surahs', label: 'Sourates', icon: ListMusic },
  { to: '/favorites', label: 'Favoris', icon: BookHeart },
  { to: '/settings', label: 'Réglages', icon: Settings },
];

export function BottomNav() {
  return (
    <nav className="glass fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-full border border-ink-900/8 px-2 py-2 shadow-lifted dark:border-white/10 sm:hidden">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 text-[10px] font-medium transition-colors',
              isActive
                ? 'text-emerald-700 dark:text-gold-300'
                : 'text-ink-900/45 dark:text-white/40'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} fill={isActive ? 'currentColor' : 'none'} fillOpacity={isActive ? 0.12 : 0} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

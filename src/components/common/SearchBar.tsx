import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({ value, onChange, placeholder, className, autoFocus }: SearchBarProps) {
  return (
    <div
      className={cn(
        'flex h-12 items-center gap-2.5 rounded-full border border-ink-900/8 bg-white/80 px-4 shadow-soft transition-colors focus-within:border-gold-400 dark:border-white/10 dark:bg-white/6',
        className
      )}
    >
      <Search className="h-4.5 w-4.5 shrink-0 text-ink-900/40 dark:text-white/40" strokeWidth={2} />
      <input
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Rechercher une sourate…'}
        className="h-full flex-1 bg-transparent text-sm text-ink-950 placeholder:text-ink-900/40 focus:outline-none dark:text-white dark:placeholder:text-white/40"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Effacer la recherche"
          className="rounded-full p-1 text-ink-900/40 hover:bg-ink-900/5 dark:text-white/40 dark:hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-ink-900/12 bg-ink-900/[0.02] px-6 py-14 text-center dark:border-white/12 dark:bg-white/[0.02]">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-900/8 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <h3 className="font-display text-lg font-semibold text-ink-950 dark:text-white">{title}</h3>
      <p className="max-w-xs text-sm text-ink-900/55 dark:text-white/50">{description}</p>
      {action}
    </div>
  );
}

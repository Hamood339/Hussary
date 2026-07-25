import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-ink-900/6 bg-white shadow-soft dark:border-white/8 dark:bg-ink-900',
        className
      )}
      {...props}
    />
  );
}

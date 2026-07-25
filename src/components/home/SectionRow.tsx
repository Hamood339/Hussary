import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface SectionRowProps {
  title: string;
  viewAllHref?: string;
  children: ReactNode;
}

export function SectionRow({ title, viewAllHref, children }: SectionRowProps) {
  return (
    <section className="mt-8 first:mt-0">
      <div className="mb-3.5 flex items-center justify-between px-1">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink-950 dark:text-white">{title}</h2>
        {viewAllHref && (
          <Link
            to={viewAllHref}
            className="flex items-center gap-0.5 text-sm font-medium text-emerald-700 hover:text-emerald-600 dark:text-gold-300 dark:hover:text-gold-200"
          >
            Tout voir
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <div className="no-scrollbar flex gap-3.5 overflow-x-auto px-1 pb-2">{children}</div>
    </section>
  );
}

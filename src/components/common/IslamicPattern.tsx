import { useId } from 'react';
import { cn } from '@/lib/utils';

interface IslamicPatternProps {
  className?: string;
  opacity?: number;
  color?: string;
}

/**
 * An 8-point star (khatam) tessellation used as ambient texture across the
 * app — hero backdrops, empty states, and the generated per-surah artwork.
 * Pure line work so it stays legible at low opacity in both themes.
 */
export function IslamicPattern({ className, opacity = 0.14, color = 'currentColor' }: IslamicPatternProps) {
  const id = useId();
  return (
    <svg className={cn('pointer-events-none', className)} width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id={`star-${id}`} width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="scale(1)">
          <g stroke={color} strokeWidth="1" fill="none" opacity={opacity}>
            <path d="M28 2 L34 14 L46 8 L40 20 L54 22 L42 28 L54 34 L40 36 L46 48 L34 42 L28 54 L22 42 L10 48 L16 36 L2 34 L14 28 L2 22 L16 20 L10 8 L22 14 Z" />
            <circle cx="28" cy="28" r="9" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#star-${id})`} />
    </svg>
  );
}

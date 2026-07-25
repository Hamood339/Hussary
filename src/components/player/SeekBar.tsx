import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { cn } from '@/lib/utils';

interface SeekBarProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  onCommit?: (value: number) => void;
  className?: string;
  thin?: boolean;
}

export function SeekBar({ value, max, onChange, onCommit, className, thin }: SeekBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localValue, setLocalValue] = useState<number | null>(null);

  const safeMax = max > 0 ? max : 1;
  const displayValue = localValue ?? value;
  const percent = Math.min(100, Math.max(0, (displayValue / safeMax) * 100));

  function valueFromEvent(e: ReactPointerEvent | PointerEvent) {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    return ratio * safeMax;
  }

  function handlePointerDown(e: ReactPointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    const next = valueFromEvent(e);
    setLocalValue(next);
    onChange(next);
  }

  function handlePointerMove(e: ReactPointerEvent) {
    if (!dragging) return;
    const next = valueFromEvent(e);
    setLocalValue(next);
    onChange(next);
  }

  function handlePointerUp(e: ReactPointerEvent) {
    if (!dragging) return;
    setDragging(false);
    const next = valueFromEvent(e);
    onCommit?.(next);
    setLocalValue(null);
  }

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={displayValue}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') onCommit?.(Math.min(safeMax, value + 5));
        if (e.key === 'ArrowLeft') onCommit?.(Math.max(0, value - 5));
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={cn(
        'group relative flex w-full cursor-pointer touch-none items-center py-2',
        className
      )}
    >
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-ink-900/10 dark:bg-white/12',
          thin ? 'h-1' : 'h-1.5'
        )}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-gold-400"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div
        className={cn(
          'absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-gold-300 shadow-glow-gold transition-transform',
          dragging ? 'scale-125' : 'scale-100 group-hover:scale-110'
        )}
        style={{ left: `${percent}%` }}
      />
    </div>
  );
}

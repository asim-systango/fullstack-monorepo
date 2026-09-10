'use client';

interface CapacityProgressProps {
  capacity: number;
  yesCount: number;
  showText?: boolean;
  className?: string;
}

export function CapacityProgress(props: Readonly<CapacityProgressProps>) {
  const { capacity, yesCount, showText = true, className = '' } = props;
  const percentage =
    capacity > 0 ? Math.min(100, Math.round((yesCount / capacity) * 100)) : 0;
  const isFull = yesCount >= capacity;

  let progressColor = 'bg-emerald-500';
  if (percentage >= 100) {
    progressColor = 'bg-rose-500';
  } else if (percentage >= 75) {
    progressColor = 'bg-amber-500';
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      {showText && (
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span>
            Capacity: {yesCount} / {capacity}
          </span>
          <span className={isFull ? 'text-rose-500 font-semibold' : 'text-foreground'}>
            {isFull ? 'Waitlist Active' : `${capacity - yesCount} spots left`}
          </span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/50 p-0.5 border border-border/40">
        <div
          className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

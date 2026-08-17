import { ProgressBar } from '../goals/progress-bar';

export type GoalProgressCardProps = Readonly<{
  title: string;
  current: number;
  target: number;
  unit: string;
}>;

export function GoalProgressCard({
  title,
  current,
  target,
  unit,
}: GoalProgressCardProps) {
  const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="m-0 text-sm font-medium text-foreground">{title}</p>
        <p className="m-0 text-xs text-muted-foreground">
          {current} / {target} {unit}
        </p>
      </div>
      <ProgressBar percent={percentage} />
      <p className="m-0 text-right text-xs font-medium text-muted-foreground">
        {percentage}%
      </p>
    </div>
  );
}

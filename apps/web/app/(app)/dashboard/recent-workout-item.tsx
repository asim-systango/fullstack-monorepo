import { Dumbbell } from 'lucide-react';

export type RecentWorkoutItemProps = Readonly<{
  title: string;
  date: string;
  exerciseCount: number;
}>;

export function RecentWorkoutItem({
  title,
  date,
  exerciseCount,
}: RecentWorkoutItemProps) {
  return (
    <li className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-0 last:pb-0 first:pt-0">
      {/* Workout */}
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Dumbbell className="size-4" aria-hidden="true" />
        </span>

        <p className="m-0 truncate text-sm font-medium text-foreground">{title}</p>
      </div>

      {/* Metadata */}
      <div className="flex shrink-0 items-center gap-6">
        <p className="m-0 text-xs text-muted-foreground font-medium ">{date}</p>

        <p className="m-0 text-xs text-muted-foreground font-medium ">
          {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
        </p>
      </div>
    </li>

    // <li className="flex items-center justify-between gap-3 border-b border-border py-4 last:border-0 last:pb-0 first:pt-0">
    //   <div className="flex min-w-0 items-center gap-3">
    //     <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
    //       <Dumbbell className="size-4" aria-hidden="true" />
    //     </span>
    //     <div className="min-w-0">
    //       <p className="m-0 truncate text-sm font-medium text-foreground">{title}</p>
    //     </div>
    //   </div>

    //   <div className="flex shrink-0 items-center gap-6">
    //     <p className="m-0 text-xs text-muted-foreground">{date}</p>

    //     <p className="m-0 text-xs text-muted-foreground">
    //       {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
    //     </p>
    //   </div>
    //  <Link
    //       href="/workouts"
    //       className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary no-underline hover:underline"
    //     >
    //       View
    //       <ArrowRight className="size-3.5" aria-hidden="true" />
    //     </Link>
    // </li>
  );
}

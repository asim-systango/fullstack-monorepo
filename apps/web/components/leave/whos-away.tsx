'use client';

import { Alert, Badge, EmptyState, Skeleton } from '@shared/ui/components';
import { QueryErrorAlert } from '@/components/feedback';
import { formatDay, formatRange, todayLocal } from '@/lib/leave/dates';
import { useWhosAway } from '@/lib/leave/queries';
import type { AwayPerson } from '@/lib/leave/types';

type DayRowProps = Readonly<{ date: string; people: AwayPerson[]; isToday: boolean }>;

function AwayDayRow({ date, people, isToday }: DayRowProps) {
  return (
    <li className="grid gap-2 px-4 py-3 sm:grid-cols-4">
      <h3 className="m-0 flex items-center gap-2 text-sm font-medium text-foreground">
        {formatDay(date)}
        {isToday ? <Badge tone="accent">Today</Badge> : null}
      </h3>
      <div className="sm:col-span-3">
        {people.length === 0 ? (
          <span className="text-sm text-muted-foreground">Everyone is in</span>
        ) : (
          <ul className="m-0 list-none space-y-1 p-0">
            {people.map((person) => (
              <li key={person.requestId} className="text-sm">
                <span className="font-medium text-foreground">{person.name}</span>
                <span className="text-muted-foreground">
                  {` · ${person.leaveType} · ${formatRange(person.startDate, person.endDate)}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

function peopleLabel(count: number) {
  if (count === 1) return '1 person';
  return `${count} people`;
}

// approved leave for the next 14 days, one row per working day
export function WhosAway() {
  // the manager's own "today", not the server's UTC date
  const today = todayLocal();
  const away = useWhosAway(today);

  if (away.isPending) {
    return (
      <div className="space-y-2">
        <Skeleton size="md" />
        <Skeleton size="md" />
        <Skeleton size="md" />
      </div>
    );
  }
  if (away.isError) {
    return <QueryErrorAlert error={away.error} onRetry={() => void away.refetch()} />;
  }

  const { days, holidays } = away.data;
  const peopleAway = new Set(days.flatMap((d) => d.people.map((p) => p.userId))).size;

  return (
    <>
      <p className="mt-0 text-sm text-muted-foreground">
        {peopleAway === 0
          ? 'Nobody has approved leave in the next 14 days.'
          : `${peopleLabel(peopleAway)} away at some point in the next 14 days.`}
      </p>

      {holidays.length > 0 ? (
        <Alert tone="info" title="Public holidays in this period" className="mb-4">
          {holidays.map((h) => `${formatDay(h.date)}: ${h.name}`).join(' · ')}
        </Alert>
      ) : null}

      {peopleAway === 0 ? (
        <EmptyState
          title="Everyone is in for the next two weeks"
          description="Approved leave shows up here, grouped by date."
        />
      ) : (
        <ul className="m-0 list-none divide-y divide-border rounded-lg border border-border bg-card p-0">
          {days.map((day) => (
            <AwayDayRow
              key={day.date}
              date={day.date}
              people={day.people}
              isToday={day.date === today}
            />
          ))}
        </ul>
      )}
    </>
  );
}

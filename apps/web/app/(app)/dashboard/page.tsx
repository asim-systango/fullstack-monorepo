'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BicepsFlexed, Dumbbell, Plus, Target, Trophy } from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  Skeleton,
} from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { fetchGoals, type GoalWithProgress } from '@/lib/goals-api';
import {
  fetchPersonalRecords,
  fetchWorkouts,
  type PersonalRecord,
} from '@/lib/workouts-api';
import { StatCard } from './stat-card';
import { RecentWorkoutItem } from './recent-workout-item';
import { GoalProgressCard } from './goal-progress-card';

const RECENT_WORKOUTS_LIMIT = 5;
const TOP_EXERCISES_LIMIT = 5;

function formatBestResult(pr: PersonalRecord): string {
  return pr.bestWeightKg === null ? `${pr.bestReps} reps` : `${pr.bestWeightKg} kg`;
}

function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }, (_, i) => (
        <Card key={i}>
          <CardBody className="space-y-3">
            <Skeleton size="sm" />
            <Skeleton size="md" className="h-8 w-16" />
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function ListSkeleton({ rows }: Readonly<{ rows: number }>) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} size="line" />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const workoutsQuery = useQuery({
    queryKey: ['dashboard', 'workouts'],
    queryFn: () => fetchWorkouts({ page: 1, pageSize: RECENT_WORKOUTS_LIMIT }),
  });

  console.warn('=== workoutsQuery', workoutsQuery.data);

  const prsQuery = useQuery({
    queryKey: ['dashboard', 'prs'],
    queryFn: fetchPersonalRecords,
  });
  const goalsQuery = useQuery({ queryKey: ['dashboard', 'goals'], queryFn: fetchGoals });

  const topExercises: PersonalRecord[] = prsQuery.data
    ? [...prsQuery.data]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, TOP_EXERCISES_LIMIT)
    : [];

  const activeGoals: GoalWithProgress[] = goalsQuery.data ?? [];

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 mb-0 text-sm text-muted-foreground sm:text-base">
          Welcome back, {user?.name ?? 'there'} 👋 Ready to crush your goals today?
        </p>
      </div>

      <div className="space-y-6">
        {workoutsQuery.isLoading || prsQuery.isLoading || goalsQuery.isLoading ? (
          <StatCardsSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              title="Total workouts"
              value={workoutsQuery.data?.meta?.total ?? 0}
              icon={Dumbbell}
            />
            <StatCard
              title="Personal records"
              value={prsQuery.data?.length ?? 0}
              icon={Trophy}
            />
            <StatCard title="Active goals" value={activeGoals.length} icon={Target} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between mb-5">
              <CardTitle>Recent workouts</CardTitle>
              <Link
                href="/workouts"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary no-underline hover:underline"
              >
                View all
              </Link>
            </CardHeader>
            <CardBody>
              {workoutsQuery.isLoading ? <ListSkeleton rows={3} /> : null}

              {workoutsQuery.isError ? (
                <Alert tone="danger" title="Something went wrong">
                  <p className="m-0 mb-2">We couldn&apos;t load your recent workouts.</p>
                  <Button size="sm" onClick={() => void workoutsQuery.refetch()}>
                    Try again
                  </Button>
                </Alert>
              ) : null}

              {workoutsQuery.isSuccess && workoutsQuery.data.items.length === 0 ? (
                <EmptyState
                  title="No workouts yet"
                  description="Start tracking your first workout today."
                  action={
                    <Link
                      href="/workouts/new"
                      className="ui-button ui-button-md ui-button-primary no-underline"
                    >
                      <Plus className="size-4" aria-hidden="true" />
                      Add workout
                    </Link>
                  }
                />
              ) : null}

              {workoutsQuery.isSuccess && workoutsQuery.data.items.length > 0 ? (
                <ul className="m-0 list-none space-y-0 p-0">
                  {workoutsQuery.data.items.map((workout) => (
                    <RecentWorkoutItem
                      key={workout.id}
                      title={workout.title}
                      date={new Date(workout.performedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      exerciseCount={workout.exerciseLogs.length}
                    />
                  ))}
                </ul>
              ) : null}
            </CardBody>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="mb-5">
              <CardTitle>Top exercises</CardTitle>
            </CardHeader>
            <CardBody>
              {prsQuery.isLoading ? <ListSkeleton rows={4} /> : null}

              {prsQuery.isError ? (
                <Alert tone="danger" title="Something went wrong">
                  <p className="m-0 mb-2">We couldn&apos;t load your personal records.</p>
                  <Button size="sm" onClick={() => void prsQuery.refetch()}>
                    Try again
                  </Button>
                </Alert>
              ) : null}

              {prsQuery.isSuccess && topExercises.length === 0 ? (
                <EmptyState
                  title="No personal records yet"
                  description="Complete a workout to start tracking your progress."
                />
              ) : null}

              {prsQuery.isSuccess && topExercises.length > 0 ? (
                <ul className="m-0 list-none space-y-3 p-0">
                  {topExercises.map((pr) => (
                    <li
                      key={pr.id}
                      className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0 last:pb-0 first:pt-0"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <BicepsFlexed
                          className="size-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />

                        <span className="truncate text-sm text-black">
                          {pr.exerciseName}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-medium text-muted-foreground">
                        {formatBestResult(pr)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="mb-5">Today&apos;s goals</CardTitle>
            <Link
              href="/goals"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary no-underline hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardBody>
            {goalsQuery.isLoading ? <ListSkeleton rows={2} /> : null}

            {goalsQuery.isError ? (
              <Alert tone="danger" title="Something went wrong">
                <p className="m-0 mb-2">We couldn&apos;t load your goals.</p>
                <Button size="sm" onClick={() => void goalsQuery.refetch()}>
                  Try again
                </Button>
              </Alert>
            ) : null}

            {goalsQuery.isSuccess && activeGoals.length === 0 ? (
              <EmptyState
                title="No active goals"
                description="Set your first fitness goal."
                action={
                  <Link
                    href="/goals"
                    className="ui-button ui-button-md ui-button-primary no-underline"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    Create goal
                  </Link>
                }
              />
            ) : null}

            {goalsQuery.isSuccess && activeGoals.length > 0 ? (
              <div className="space-y-5">
                {activeGoals.map((goal) => (
                  <GoalProgressCard
                    key={goal.id}
                    title={`${goal.exerciseName} — ${goal.targetWeightKg} kg`}
                    current={goal.currentBestWeightKg ?? 0}
                    target={goal.targetWeightKg}
                    unit="kg"
                  />
                ))}
              </div>
            ) : null}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

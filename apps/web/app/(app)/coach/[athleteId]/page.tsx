'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  LoadingState,
  Page,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@shared/ui/components';
import {
  fetchAthletePrs,
  fetchAthleteWorkouts,
  fetchAthleteDetails,
} from '@/lib/coach-api';

export default function AthleteDetailPage() {
  const params = useParams<{ athleteId: string }>();
  const athleteId = params.athleteId;

  const workoutsQuery = useQuery({
    queryKey: ['coach', 'athlete', athleteId, 'workouts'],
    queryFn: () => fetchAthleteWorkouts(athleteId),
  });

  const prsQuery = useQuery({
    queryKey: ['coach', 'athlete', athleteId, 'prs'],
    queryFn: () => fetchAthletePrs(athleteId),
  });

  const atheletQuery = useQuery({
    queryKey: ['coach', 'athlete', athleteId],
    queryFn: () => fetchAthleteDetails(athleteId),
  });

  return (
    <Page>
      <PageHeader
        title={atheletQuery.data ? `${atheletQuery.data.name} Details` : 'User Details'}
      />

      <Card className="mb-5">
        <CardHeader className="flex flex-row items-center justify-between mb-5">
          <CardTitle>Workout history</CardTitle>
        </CardHeader>
        <CardBody>
          {workoutsQuery.isLoading ? (
            <LoadingState variant="block" label="Loading workouts…" />
          ) : null}
          {workoutsQuery.isError ? (
            <Alert tone="danger" title="Couldn't load workouts">
              <Button size="sm" onClick={() => void workoutsQuery.refetch()}>
                Retry
              </Button>
            </Alert>
          ) : null}
          {workoutsQuery.isSuccess && workoutsQuery.data.items.length === 0 ? (
            <EmptyState
              title="No workouts yet"
              description="This athlete hasn't logged a workout."
            />
          ) : null}
          {workoutsQuery.isSuccess && workoutsQuery.data.items.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Workout Name</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Exercises</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workoutsQuery.data.items.map((workout) => (
                  <TableRow key={workout.id}>
                    <TableCell>
                      <span className="text-black font-semibold"> {workout.title}</span>
                    </TableCell>

                    <TableCell>
                      {new Date(workout.performedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {workout.exerciseLogs.length > 0 &&
                        workout.exerciseLogs.map((exercise) => (
                          <Badge
                            key={exercise.id}
                            className="mr-2 bg-primary/10 text-gray border rounded-md "
                          >
                            {exercise?.exerciseName}:{' '}
                            <span className="text-black">{exercise?.sets?.length}</span>
                          </Badge>
                        ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardBody>
      </Card>
      <Card className="mb-5">
        <CardHeader className="flex flex-row items-center justify-between mb-5">
          <CardTitle>Personal records</CardTitle>
        </CardHeader>
        <CardBody>
          {prsQuery.isLoading ? (
            <LoadingState variant="block" label="Loading personal records…" />
          ) : null}
          {prsQuery.isError ? (
            <Alert tone="danger" title="Couldn't load personal records">
              <Button size="sm" onClick={() => void prsQuery.refetch()}>
                Retry
              </Button>
            </Alert>
          ) : null}
          {prsQuery.isSuccess && prsQuery.data.length === 0 ? (
            <EmptyState
              title="No personal records yet"
              description="No sets logged for this athlete."
            />
          ) : null}
          {prsQuery.isSuccess && prsQuery.data.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Exercise</TableHeaderCell>
                  <TableHeaderCell>Best weight (kg)</TableHeaderCell>
                  <TableHeaderCell>Reps</TableHeaderCell>
                  <TableHeaderCell>Achieved on</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prsQuery.data.map((pr) => (
                  <TableRow key={pr.id}>
                    <TableCell>
                      <span className="text-black font-semibold"> {pr.exerciseName}</span>
                    </TableCell>
                    <TableCell>{pr.bestWeightKg ?? '-'}</TableCell>
                    <TableCell>{pr.bestReps}</TableCell>
                    <TableCell>{new Date(pr.updatedAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardBody>
      </Card>
    </Page>
  );
}

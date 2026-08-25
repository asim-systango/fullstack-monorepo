'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
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
import { fetchPersonalRecords } from '@/lib/workouts-api';
import Link from 'next/link';

export default function PersonalRecordsPage() {
  const query = useQuery({
    queryKey: ['prs'],
    queryFn: fetchPersonalRecords,
  });

  return (
    <Page>
      <PageHeader
        title="Personal records"
        description="Your best performance for each exercise"
        actions={
          <Link
            href="/workouts"
            className="ui-button ui-button-md ui-button-ghost no-underline"
          >
            View all history
          </Link>
        }
      />

      <Card>
        {query.isLoading ? (
          <LoadingState variant="block" label="Loading personal records…" />
        ) : null}

        {query.isError ? (
          <Alert tone="danger" title="Couldn't load personal records">
            <Button size="sm" onClick={() => void query.refetch()}>
              Retry
            </Button>
          </Alert>
        ) : null}

        {query.isSuccess && query.data.length === 0 ? (
          <EmptyState
            title="No personal records yet"
            description="Log a workout to start tracking your best sets."
          />
        ) : null}

        {query.isSuccess && query.data.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Exercise</TableHeaderCell>
                <TableHeaderCell>Best weight (in Kg)</TableHeaderCell>
                <TableHeaderCell>Reps</TableHeaderCell>
                <TableHeaderCell>Achieved on</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {query.data.map((pr) => (
                <TableRow key={pr.id}>
                  <TableCell>
                    <span className="text-black font-semibold"> {pr.exerciseName}</span>
                  </TableCell>
                  <TableCell>
                    {pr.bestWeightKg === null ? '-' : `${pr.bestWeightKg} kg`}
                  </TableCell>
                  <TableCell>{pr.bestReps}</TableCell>
                  <TableCell>{new Date(pr.updatedAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </Card>
    </Page>
  );
}

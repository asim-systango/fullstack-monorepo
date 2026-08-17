'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
  EmptyState,
  LoadingState,
  Page,
  PageHeader,
} from '@shared/ui/components';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { clearWorkoutFilters } from '@/lib/store/workouts.slice';
import { deleteWorkout, fetchWorkouts } from '@/lib/workouts-api';
import { WorkoutsFilterBar } from './filter-bar';
import { WorkoutsTable } from './workouts-table';
import { Pagination } from './pagination';
import { Plus } from 'lucide-react';

const PAGE_SIZE = 10;

export default function WorkoutsPage() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const appliedFilter = useAppSelector((state) => state.workouts.appliedFilter);
  const hasActiveFilters = Boolean(
    appliedFilter.dateFrom || appliedFilter.dateTo || appliedFilter.exercise,
  );
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [appliedFilter]);

  const query = useQuery({
    queryKey: ['workouts', appliedFilter, page],
    queryFn: () =>
      fetchWorkouts({
        dateFrom: appliedFilter.dateFrom || undefined,
        dateTo: appliedFilter.dateTo || undefined,
        search: appliedFilter.exercise || undefined,
        page,
        pageSize: PAGE_SIZE,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorkout,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });

  return (
    <Page>
      <PageHeader
        title="Workouts"
        description="Track your workout and monitor your progress over time"
        actions={
          <Link
            href="/workouts/new"
            className="ui-button ui-button-md ui-button-primary no-underline"
          >
            <Plus className="mr-2" /> Add workout
          </Link>
        }
      />
      <Card>
        <WorkoutsFilterBar />

        {query.isLoading ? (
          <LoadingState variant="block" label="Loading workouts…" />
        ) : null}

        {query.isError ? (
          <Alert tone="danger" title="Couldn't load workouts">
            <Button size="sm" onClick={() => void query.refetch()}>
              Retry
            </Button>
          </Alert>
        ) : null}

        {query.isSuccess && query.data.items.length === 0 ? (
          <EmptyState
            title={
              hasActiveFilters ? 'No workouts match your filters' : 'No workouts yet'
            }
            description={
              hasActiveFilters
                ? 'Try widening the date range or clearing filters.'
                : 'Log your first workout to see it here.'
            }
            action={
              hasActiveFilters ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch(clearWorkoutFilters())}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : null}

        {query.isSuccess && query.data.items.length > 0 ? (
          <>
            <WorkoutsTable
              workouts={query.data.items}
              onDelete={(id) => deleteMutation.mutate(id)}
              deletePending={deleteMutation.isPending}
            />
            <Pagination
              page={query.data.meta.currentPage}
              pageSize={query.data.meta.limit}
              total={query.data.meta.total}
              onPageChange={setPage}
            />
          </>
        ) : null}
      </Card>
    </Page>
  );
}

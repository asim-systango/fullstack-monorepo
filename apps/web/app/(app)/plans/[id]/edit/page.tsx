'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, LoadingState, Page } from '@shared/ui/components';
import { fetchPlan, updatePlan } from '@/lib/plans-api';
import { PlanForm } from '../../plan-form';

export default function EditPlanPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const query = useQuery({ queryKey: ['plans', id], queryFn: () => fetchPlan(id) });

  const updateMutation = useMutation({
    mutationFn: (input: Parameters<typeof updatePlan>[1]) => updatePlan(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['plans'] });
      router.push('/plans');
    },
  });

  return (
    <Page>
      {query.isLoading ? <LoadingState variant="block" label="Loading plan…" /> : null}

      {query.isError ? (
        <Alert tone="danger" title="Couldn't load plan">
          <Button size="sm" onClick={() => void query.refetch()}>
            Retry
          </Button>
        </Alert>
      ) : null}

      {query.isSuccess ? (
        <PlanForm
          mode="edit"
          initialTitle={query.data.title}
          initialNotes={query.data.notes ?? ''}
          initialDays={query.data.days
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((day) => ({ dayLabel: day.dayLabel, exercises: day.exercises }))}
          pending={updateMutation.isPending}
          error={updateMutation.error}
          onSubmit={(input) => updateMutation.mutate(input)}
          onCancel={() => router.push('/plans')}
        />
      ) : null}
    </Page>
  );
}

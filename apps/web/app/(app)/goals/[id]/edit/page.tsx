'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, CardBody, LoadingState, Page } from '@shared/ui/components';
import { fetchGoal, updateGoal } from '@/lib/goals-api';
import { GoalForm } from '../../goal-form';

export default function EditGoalPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const query = useQuery({ queryKey: ['goals', id], queryFn: () => fetchGoal(id) });

  const updateMutation = useMutation({
    mutationFn: (input: Parameters<typeof updateGoal>[1]) => updateGoal(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['goals'] });
      router.push('/goals');
    },
  });

  return (
    <Page>
      <div className="space-y-6">
        <div>
          <h1 className="m-0 text-2xl font-semibold tracking-tight text-foreground">
            Update goal
          </h1>
          <p className="mt-1 mb-0 text-sm text-muted-foreground">
            Update your target and track progress against your PR.
          </p>
        </div>

        {query.isLoading ? <LoadingState variant="block" label="Loading goal…" /> : null}

        {query.isError ? (
          <Alert tone="danger" title="Couldn't load goal">
            <Button size="sm" onClick={() => void query.refetch()}>
              Retry
            </Button>
          </Alert>
        ) : null}

        {query.isSuccess ? (
          <Card>
            <CardBody>
              <GoalForm
                initialExerciseName={query.data.exerciseName}
                initialTargetWeightKg={query.data.targetWeightKg}
                initialTargetReps={query.data.targetReps ?? undefined}
                initialTargetDate={query.data.targetDate ?? ''}
                submitLabel="Update goal"
                pending={updateMutation.isPending}
                error={updateMutation.error}
                onSubmit={(input) => updateMutation.mutate(input)}
                onCancel={() => router.push('/goals')}
              />
            </CardBody>
          </Card>
        ) : null}
      </div>
    </Page>
  );
}

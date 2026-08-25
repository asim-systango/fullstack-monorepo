'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardBody, Page } from '@shared/ui/components';
import { createGoal } from '@/lib/goals-api';
import { GoalForm } from '../goal-form';

export default function NewGoalPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createGoal,
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
            Create goal
          </h1>
          <p className="mt-1 mb-0 text-sm text-muted-foreground">
            Set a target weight for an exercise and track progress against your PR.
          </p>
        </div>

        <Card>
          <CardBody>
            <GoalForm
              submitLabel="Create goal"
              pending={createMutation.isPending}
              error={createMutation.error}
              onSubmit={(input) => createMutation.mutate(input)}
              onCancel={() => router.push('/goals')}
            />
          </CardBody>
        </Card>
      </div>
    </Page>
  );
}

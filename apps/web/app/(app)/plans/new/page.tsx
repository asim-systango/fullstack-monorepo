'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Page } from '@shared/ui/components';
import { createPlan } from '@/lib/plans-api';
import { PlanForm } from '../plan-form';

export default function NewPlanPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createPlan,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['plans'] });
      router.push('/plans');
    },
  });

  return (
    <Page>
      <PlanForm
        mode="create"
        pending={createMutation.isPending}
        error={createMutation.error}
        onSubmit={(input) => createMutation.mutate(input)}
        onCancel={() => router.push('/plans')}
      />
    </Page>
  );
}

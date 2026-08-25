'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  LoadingState,
  Page,
  PageHeader,
} from '@shared/ui/components';
import { deleteGoal, fetchGoals } from '@/lib/goals-api';
import { ProgressBar } from './progress-bar';
import { PencilIcon, Plus, Trash2 } from 'lucide-react';

export default function GoalsPage() {
  const queryClient = useQueryClient();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const query = useQuery({ queryKey: ['goals'], queryFn: fetchGoals });

  const deleteMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  return (
    <Page>
      <PageHeader
        title="Goals"
        description="Set goals and stay motivated on your fitness journey"
        actions={
          <Link
            href="/goals/new"
            className="ui-button ui-button-md ui-button-primary no-underline"
          >
            <Plus className="mr-2" /> New goal
          </Link>
        }
      />

      {query.isLoading ? (
        <Card>
          <LoadingState variant="block" label="Loading goals…" />{' '}
        </Card>
      ) : null}

      {query.isError ? (
        <Alert tone="danger" title="Couldn't load goals">
          <Button size="sm" onClick={() => void query.refetch()}>
            Retry
          </Button>
        </Alert>
      ) : null}

      {query.isSuccess && query.data.length === 0 ? (
        <Card>
          <EmptyState
            title="No goals yet"
            description="Set a target weight for an exercise and track progress against your PR."
          />
        </Card>
      ) : null}

      {query.isSuccess && query.data.length > 0 ? (
        <div className="space-y-4">
          {query.data.map((goal) => (
            <Card key={goal.id}>
              <CardHeader>
                <CardTitle className="text-black">{goal.exerciseName}</CardTitle>
              </CardHeader>
              <CardBody className="space-y-3 flex gap-6">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-3">
                    Target: {goal.targetWeightKg} kg
                    {goal.targetReps ? ` × ${goal.targetReps} reps` : ''}
                  </p>
                  <div className="max-w-[800px]">
                    <ProgressBar percent={goal.progressPercent} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    {goal.currentBestWeightKg !== null
                      ? `Current best: ${goal.currentBestWeightKg} kg (${goal.progressPercent}%)`
                      : 'No personal record yet for this exercise (0%)'}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-6 font-medium text-muted-foreground">
                  {goal.targetDate
                    ? ` ${new Date(goal.targetDate).toLocaleDateString()}`
                    : ''}

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/goals/${goal.id}/edit`}
                      aria-label={`Edit ${goal.exerciseName} goal`}
                      className="text-muted-foreground hover:text-primary rounded-md transition-all group cursor-pointer bg-gray-200 hover:bg-primary/20 p-2"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-primary rounded-md transition-all group cursor-pointer bg-gray-200 hover:bg-primary/20 p-2"
                      onClick={() => setPendingDeleteId(goal.id)}
                      aria-label={`Delete ${goal.exerciseName} goal`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : null}

      <Dialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <DialogHeader>
          <DialogTitle>Delete goal?</DialogTitle>
        </DialogHeader>
        <DialogBody>This cannot be undone.</DialogBody>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setPendingDeleteId(null)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={deleteMutation.isPending}
            loadingText="Deleting…"
            onClick={() => {
              if (pendingDeleteId) deleteMutation.mutate(pendingDeleteId);
              setPendingDeleteId(null);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </Page>
  );
}

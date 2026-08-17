'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Badge,
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
import { deletePlan, fetchPlans } from '@/lib/plans-api';
import { PencilIcon, Plus, Trash2 } from 'lucide-react';

export default function PlansPage() {
  const queryClient = useQueryClient();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const query = useQuery({ queryKey: ['plans'], queryFn: fetchPlans });

  const deleteMutation = useMutation({
    mutationFn: deletePlan,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });

  return (
    <Page>
      <PageHeader
        title="Plans"
        description="Follow structured workout plans to acheive your fitness goals"
        actions={
          <Link
            href="/plans/new"
            className="ui-button ui-button-md ui-button-primary no-underline"
          >
            <Plus className="mr-2" /> New plan
          </Link>
        }
      />

      {query.isLoading ? (
        <Card>
          <LoadingState variant="block" label="Loading plans…" />{' '}
        </Card>
      ) : null}

      {query.isError ? (
        <Alert tone="danger" title="Couldn't load plans">
          <Button size="sm" onClick={() => void query.refetch()}>
            Retry
          </Button>
        </Alert>
      ) : null}

      {query.isSuccess && query.data.length === 0 ? (
        <Card>
          <EmptyState
            title="No plans yet"
            description="Create a template with days and target sets/reps per exercise."
          />
        </Card>
      ) : null}

      {query.isSuccess && query.data.length > 0 ? (
        <div className="space-y-4">
          {query.data.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.title}</CardTitle>
              </CardHeader>
              <CardBody className="space-y-3 flex items-center">
                <div className="flex-1">
                  {plan.notes ? (
                    <p className="text-sm text-muted-foreground">{plan.notes}</p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {plan.days
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((day) => (
                        <Badge key={day.id}>
                          {day.dayLabel}:{' '}
                          {day.exercises.map((ex) => ex.exerciseName).join(', ')}
                        </Badge>
                      ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/plans/${plan.id}/edit`}
                    className="text-muted-foreground hover:text-primary rounded-md transition-all group cursor-pointer bg-gray-200 hover:bg-primary/20 p-2"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-primary rounded-md transition-all group cursor-pointer bg-gray-200 hover:bg-primary/20 p-2"
                    onClick={() => setPendingDeleteId(plan.id)}
                    aria-label={`Delete ${plan.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
          <DialogTitle>Delete plan?</DialogTitle>
        </DialogHeader>
        <DialogBody>
          This removes the plan and all its days. This cannot be undone.
        </DialogBody>
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

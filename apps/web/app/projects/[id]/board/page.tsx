'use client';
import { use } from 'react';
import Link from 'next/link';
import { Badge, Button, Card, Page, Spinner, StatusMessage } from '@shared/ui/components';
import { ShellHeader } from '@/components/auth';
import { useChangeStatus, useIssues } from '@/lib/domain/issues';
import { STATUS_COLUMNS, nextStatuses } from '@/lib/domain/types';

const LABELS: Record<string, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
};

type MoveButtonProps = Readonly<{
  to: string;
  issueId: string;
  isPending: boolean;
  onMove: (issueId: string, to: string) => void;
}>;

function MoveButton({ to, issueId, isPending, onMove }: MoveButtonProps) {
  return (
    <Button
      size="sm"
      variant="secondary"
      loading={isPending}
      onClick={() => onMove(issueId, to)}
    >
      → {LABELS[to]}
    </Button>
  );
}

export default function BoardPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params);
  const { data, isLoading, isError } = useIssues(id);
  const changeStatus = useChangeStatus(id);

  const handleMove = (issueId: string, to: string) => {
    changeStatus.mutate({ id: issueId, status: to });
  };

  if (isLoading)
    return (
      <Page>
        <Spinner />
      </Page>
    );
  if (isError)
    return (
      <Page>
        <StatusMessage tone="error">Failed to load board.</StatusMessage>
      </Page>
    );

  return (
    <Page>
      <ShellHeader title="Board" subtitle="Move issues through the workflow" />
      <div className="grid gap-4 md:grid-cols-3">
        {STATUS_COLUMNS.map((col) => (
          <div key={col}>
            <h3 className="mb-2 font-semibold">{LABELS[col]}</h3>
            <div className="flex flex-col gap-2">
              {data
                ?.filter((i) => i.status === col)
                .map((issue) => (
                  <Card key={issue.id} className="p-3">
                    <Link href={`/issues/${issue.id}`} className="font-medium">
                      {issue.title}
                    </Link>
                    <div className="mt-2 flex gap-2">
                      {nextStatuses(issue.status).map((to) => (
                        <MoveButton
                          key={to}
                          to={to}
                          issueId={issue.id}
                          isPending={changeStatus.isPending}
                          onMove={handleMove}
                        />
                      ))}
                    </div>
                  </Card>
                ))}
              {data?.filter((i) => i.status === col).length === 0 && (
                <Badge tone="neutral">Empty</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}

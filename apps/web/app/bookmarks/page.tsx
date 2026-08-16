'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { PageShell } from '@/components/layout/page-shell';
import { Alert, Button, Card, CardBody, Skeleton } from '@/components/ui';
import { listBookmarks, removeBookmarkByJobId } from '@/lib/api/bookmarks-api';
import { getErrorMessage } from '@/lib/api/errors';
import { queryKeys } from '@/lib/query/keys';

export default function BookmarksPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.bookmarks,
    queryFn: listBookmarks,
  });

  const removeMutation = useMutation({
    mutationFn: (jobId: string) => removeBookmarkByJobId(jobId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks }),
  });

  return (
    <PageShell title="Bookmarks" description="Saved jobs. Delete uses jobId in the path.">
      {isLoading ? <Skeleton className="h-24 w-full" /> : null}
      {isError ? (
        <Alert tone="danger" title="Could not load bookmarks">
          {getErrorMessage(error)}
        </Alert>
      ) : null}
      {data && data.length === 0 ? (
        <Alert tone="info" title="No bookmarks">
          Save jobs from a job detail page.
        </Alert>
      ) : null}
      <ul className="space-y-3">
        {data?.map((bookmark) => (
          <li key={bookmark.id}>
            <Card>
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link
                    href={`/jobs/${bookmark.jobId}`}
                    className="font-semibold text-primary no-underline hover:text-brand"
                  >
                    {bookmark.job?.title ?? `Job ${bookmark.jobId}`}
                  </Link>
                  <p className="mt-1 text-sm text-secondary">
                    {bookmark.job?.location ?? '—'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  loading={removeMutation.isPending}
                  onClick={() => removeMutation.mutate(bookmark.jobId)}
                >
                  Remove
                </Button>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>
      {removeMutation.isError ? (
        <Alert tone="danger" className="mt-3">
          {getErrorMessage(removeMutation.error)}
        </Alert>
      ) : null}
    </PageShell>
  );
}

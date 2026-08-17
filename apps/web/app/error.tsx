'use client';

import { useEffect } from 'react';
import { Alert, Button, Page } from '@shared/ui/components';

export default function ErrorBoundary({
  error,
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Page>
      <Alert tone="danger" title="Something went wrong">
        An unexpected error occurred.
        <div className="mt-3">
          <Button size="sm" onClick={reset}>
            Try again
          </Button>
        </div>
      </Alert>
    </Page>
  );
}

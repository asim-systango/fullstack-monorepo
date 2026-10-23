import { Alert, Button } from '@shared/ui/components';
import { errorMessage } from '@/lib/leave/errors';

type QueryErrorAlertProps = Readonly<{
  error: unknown;
  onRetry: () => void;
  title?: string;
}>;

// error state for lists: show the API message and a retry button, never an endless spinner
export function QueryErrorAlert({
  error,
  onRetry,
  title = "Couldn't load this",
}: QueryErrorAlertProps) {
  return (
    <Alert tone="danger" title={title}>
      <p className="m-0">{errorMessage(error)}</p>
      <Button size="sm" variant="secondary" className="mt-3" onClick={onRetry}>
        Try again
      </Button>
    </Alert>
  );
}

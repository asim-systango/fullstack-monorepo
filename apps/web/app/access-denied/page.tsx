import Link from 'next/link';
import { Alert, Page, PageHeader } from '@shared/ui/components';

export default function AccessDeniedPage() {
  return (
    <Page>
      <PageHeader title="Access denied" />
      <Alert tone="danger" title="You don't have access to this page">
        This area is restricted to a different role. <Link href="/">Go home</Link>.
      </Alert>
    </Page>
  );
}

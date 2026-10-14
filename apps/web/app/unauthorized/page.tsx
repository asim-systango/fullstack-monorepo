import Link from 'next/link';
import { PageShell } from '@/components/layout/page-shell';
import { Button, Card, CardBody } from '@/components/ui';

export default function UnauthorizedPage() {
  return (
    <PageShell
      title="Access denied"
      description="You do not have permission for that page. Middleware normally redirects wrong roles to their home."
    >
      <Card>
        <CardBody>
          <Link href="/jobs">
            <Button variant="secondary">Back to jobs</Button>
          </Link>
        </CardBody>
      </Card>
    </PageShell>
  );
}

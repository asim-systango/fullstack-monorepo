'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardTitle,
  EmptyState,
  LoadingState,
  Page,
  PageHeader,
} from '@shared/ui/components';
import { fetchAssignedAthletes } from '@/lib/coach-api';
import { Eye } from 'lucide-react';

export default function CoachPage() {
  const query = useQuery({
    queryKey: ['coach', 'athletes'],
    queryFn: fetchAssignedAthletes,
  });

  return (
    <Page>
      <PageHeader title="Assigned athletes" />

      {query.isLoading ? (
        <LoadingState variant="block" label="Loading athletes…" />
      ) : null}

      {query.isError ? (
        <Alert tone="danger" title="Couldn't load athletes">
          <Button size="sm" onClick={() => void query.refetch()}>
            Retry
          </Button>
        </Alert>
      ) : null}

      {query.isSuccess && query.data.length === 0 ? (
        <EmptyState
          title="No athletes assigned yet"
          description="Ask an admin to assign an athlete to your coach account."
        />
      ) : null}

      {query.isSuccess && query.data.length > 0 ? (
        <div className="space-y-3">
          {query.data.map((athlete) => (
            <Card key={athlete.athleteId}>
              <CardBody className="flex items-center justify-between">
                <div>
                  <CardTitle>{athlete.name ?? athlete.email}</CardTitle>
                  <p className="text-sm text-muted-foreground">{athlete.email}</p>
                </div>
                <Link
                  href={`/coach/${athlete.athleteId}`}
                  className="ui-button ui-button-md ui-button-secondary no-underline"
                >
                  <Eye className="w-4 h-4 mr-2" /> View Details
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : null}
    </Page>
  );
}

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  LoadingState,
  Page,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { RequireAuth, ShellHeader } from '@/components/auth';
import { templatesApi } from '@/lib/resumes-api';

export default function AdminTemplatesPage() {
  return (
    <Page>
      <ShellHeader title="Templates" subtitle="Admin · toggle availability" />
      <RequireAuth role="admin">
        <TemplatesTable />
      </RequireAuth>
    </Page>
  );
}

function TemplatesTable() {
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ['templates'],
    queryFn: () => templatesApi.list(),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      templatesApi.update(id, { isActive }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  if (templatesQuery.isLoading) {
    return <LoadingState label="Loading templates…" />;
  }

  if (templatesQuery.isError) {
    return (
      <Alert tone="danger" title="Could not load templates">
        {templatesQuery.error instanceof ApiClientError
          ? templatesQuery.error.message
          : 'Request failed'}{' '}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => void templatesQuery.refetch()}
        >
          Retry
        </Button>
      </Alert>
    );
  }

  const templates = templatesQuery.data ?? [];

  return (
    <>
      <PageHeader
        title="Resume templates"
        description="Inactive templates are hidden from the candidate picker."
      />

      {toggleMutation.isError ? (
        <Alert tone="danger" title="Update failed" className="mb-4">
          {toggleMutation.error instanceof ApiClientError
            ? toggleMutation.error.message
            : 'Could not update template'}
        </Alert>
      ) : null}

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Key</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Active</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id}>
              <TableCell>{template.name}</TableCell>
              <TableCell className="font-mono text-xs">{template.key}</TableCell>
              <TableCell>
                <Badge tone={template.isActive ? 'success' : 'neutral'}>
                  {template.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <Checkbox
                  label={template.isActive ? 'On' : 'Off'}
                  checked={template.isActive}
                  disabled={
                    toggleMutation.isPending &&
                    toggleMutation.variables?.id === template.id
                  }
                  onChange={(e) =>
                    toggleMutation.mutate({
                      id: template.id,
                      isActive: e.target.checked,
                    })
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

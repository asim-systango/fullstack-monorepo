import { Badge } from '@/components/ui';
import type { ApplicationStatus, JobStatus } from '@/lib/api/types';

const appTone: Record<
  ApplicationStatus,
  'neutral' | 'brand' | 'success' | 'warning' | 'danger'
> = {
  submitted: 'brand',
  reviewing: 'warning',
  rejected: 'danger',
  hired: 'success',
};

export function ApplicationStatusBadge({
  status,
}: Readonly<{ status: ApplicationStatus }>) {
  return <Badge tone={appTone[status]}>{status}</Badge>;
}

export function JobStatusBadge({
  status,
  deleted,
}: Readonly<{ status: JobStatus; deleted?: boolean }>) {
  if (deleted) return <Badge tone="neutral">deleted</Badge>;
  return <Badge tone={status === 'open' ? 'success' : 'neutral'}>{status}</Badge>;
}

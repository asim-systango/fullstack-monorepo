'use client';

import { Badge } from '@shared/ui/components';
import { STATUS_LABEL } from '@/lib/status';
import type { IssueStatus } from '@/lib/domain-types';
import { cn } from '@shared/ui';

const TONE: Record<IssueStatus, 'neutral' | 'accent' | 'success'> = {
  todo: 'neutral',
  in_progress: 'accent',
  done: 'success',
};

export function IssueStatusBadge({
  status,
  pulse = false,
}: Readonly<{ status: IssueStatus; pulse?: boolean }>) {
  return (
    <Badge tone={TONE[status]} className={cn(pulse && 'tf-status-pulse')}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

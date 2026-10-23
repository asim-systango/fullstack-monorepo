import { Badge } from '@shared/ui/components';
import { STATUS_LABEL, STATUS_TONE } from '@/lib/leave/format';
import type { LeaveStatus } from '@/lib/leave/types';

export function StatusBadge({ status }: Readonly<{ status: LeaveStatus }>) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}

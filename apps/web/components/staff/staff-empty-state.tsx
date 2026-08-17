import type { ReactNode } from 'react';
import { EmptyState } from '@shared/ui/components';

export function StaffEmptyState({
  title,
  description,
  action,
}: Readonly<{ title: string; description: string; action?: ReactNode }>) {
  return (
    <EmptyState className="staff-empty" title={title} description={description} action={action} />
  );
}

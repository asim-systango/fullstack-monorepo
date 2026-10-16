import type { ReactNode } from 'react';
import { PageHeader } from '@shared/ui/components';

export function StaffPageHeader({
  title,
  description,
  actions,
}: Readonly<{ title: string; description?: string; actions?: ReactNode }>) {
  return (
    <PageHeader
      className="staff-page-header"
      title={title}
      description={description}
      actions={actions}
    />
  );
}

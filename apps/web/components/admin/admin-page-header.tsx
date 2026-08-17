import type { ReactNode } from 'react';
import { PageHeader } from '@shared/ui/components';

export function AdminPageHeader({
  title,
  description,
  actions,
}: Readonly<{ title: string; description?: string; actions?: ReactNode }>) {
  return (
    <PageHeader
      className="admin-page-header"
      title={title}
      description={description}
      actions={actions}
    />
  );
}

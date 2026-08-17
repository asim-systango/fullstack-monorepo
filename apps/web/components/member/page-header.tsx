import type { ReactNode } from 'react';
import { PageHeader } from '@shared/ui/components';

export function MemberContent({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <div className={className ? `member-content ${className}` : 'member-content'}>
      {children}
    </div>
  );
}

export function MemberPageHeader({
  title,
  description,
  action,
}: Readonly<{
  title: string;
  description?: string;
  action?: ReactNode;
}>) {
  return (
    <PageHeader
      className="member-page-header member-enter"
      title={title}
      description={description}
      actions={action}
    />
  );
}

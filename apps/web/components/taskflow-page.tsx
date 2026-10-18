import type { ReactNode } from 'react';
import { Page } from '@shared/ui/components';
import { cn } from '@shared/ui';

export function TaskFlowPage({
  children,
  wide = false,
  className,
}: Readonly<{ children: ReactNode; wide?: boolean; className?: string }>) {
  return (
    <Page className={cn('tf-page', wide && 'tf-page-wide', className)}>{children}</Page>
  );
}

import type { ReactNode } from 'react';
import { Page } from '@shared/ui/components';
import { cn } from '@shared/ui';
import { BrandAtmosphere } from './brand-atmosphere';

export function TaskFlowPage({
  children,
  wide = true,
  className,
}: Readonly<{ children: ReactNode; wide?: boolean; className?: string }>) {
  return (
    <div className="tf-stage">
      <BrandAtmosphere />
      <Page className={cn('tf-page', wide && 'tf-page-wide', className)}>{children}</Page>
    </div>
  );
}

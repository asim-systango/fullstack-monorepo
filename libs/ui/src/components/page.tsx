import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../cn';

export type PageProps = Readonly<HTMLAttributes<HTMLElement> & { children: ReactNode }>;

export function Page({ children, className, ...rest }: PageProps) {
  return (
    <main className={cn('ui-page', className)} {...rest}>
      {children}
    </main>
  );
}

export type PageHeaderProps = Readonly<{
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}>;

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('ui-page-header', className)}>
      <div>
        <h1 className="ui-page-title">{title}</h1>
        {description ? <p className="ui-page-description">{description}</p> : null}
      </div>
      {actions ? <div className="ui-page-actions">{actions}</div> : null}
    </header>
  );
}

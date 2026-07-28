import type { ReactNode } from 'react';
import { cn } from '../cn';

export type EmptyStateProps = Readonly<{
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}>;

/** Empty list / no results — distinct from loading and error (stack rule #8). */
export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('ui-empty', className)}>
      <h3 className="ui-empty-title">{title}</h3>
      {description ? <p className="ui-empty-description">{description}</p> : null}
      {action ? <div className="ui-empty-action">{action}</div> : null}
    </div>
  );
}

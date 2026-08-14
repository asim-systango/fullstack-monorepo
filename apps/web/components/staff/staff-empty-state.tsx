import type { ReactNode } from 'react';

export function StaffEmptyState({
  title,
  description,
  action,
}: Readonly<{ title: string; description: string; action?: ReactNode }>) {
  return (
    <div className="staff-empty">
      <h3>{title}</h3>
      <p>{description}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

import type { ReactNode } from 'react';

export function AdminPageHeader({
  title,
  description,
  actions,
}: Readonly<{ title: string; description?: string; actions?: ReactNode }>) {
  return (
    <div className="admin-page-header flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

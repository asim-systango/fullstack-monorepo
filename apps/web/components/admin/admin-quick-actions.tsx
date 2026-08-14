import Link from 'next/link';

export type AdminQuickAction = {
  href: string;
  label: string;
  primary?: boolean;
};

export function AdminQuickActions({
  title = 'Administration',
  description = 'Manage members, policies, fines, and library content.',
  actions,
}: Readonly<{
  title?: string;
  description?: string;
  actions: readonly AdminQuickAction[];
}>) {
  return (
    <div className="admin-card admin-card-elevated p-4">
      <p className="admin-section-title">{title}</p>
      <p className="admin-section-desc mb-3">{description}</p>
      <div className="admin-quick-actions">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`ui-button ui-button-sm no-underline hover:no-underline ${
              action.primary ? 'ui-button-primary' : 'ui-button-secondary'
            }`}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

import Link from 'next/link';

export type StaffQuickAction = {
  href: string;
  label: string;
  primary?: boolean;
};

export function StaffQuickActions({
  actions,
}: Readonly<{ actions: readonly StaffQuickAction[] }>) {
  return (
    <div className="staff-card staff-card-primary p-4">
      <p className="staff-section-title">Quick actions</p>
      <p className="staff-section-desc mb-3">Jump into the work that matters today.</p>
      <div className="staff-quick-actions">
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

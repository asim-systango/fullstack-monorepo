import type { User } from '@shared/api-client';

const LABELS: Record<User['role'], string> = {
  user: 'Customer',
  staff: 'Staff',
  admin: 'Admin',
};

export function RoleBadge({ role }: Readonly<{ role: User['role'] }>) {
  return (
    <span
      style={{
        background: `var(--tg-role-${role}-bg)`,
        color: `var(--tg-role-${role}-fg)`,
        fontSize: 11,
        fontWeight: 500,
        padding: '2px 8px',
        borderRadius: 999,
      }}
    >
      {LABELS[role]}
    </span>
  );
}

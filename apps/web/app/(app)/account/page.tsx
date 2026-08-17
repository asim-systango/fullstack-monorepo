'use client';

import { useRouter } from 'next/navigation';
import { Badge, Button, Card } from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { Avatar } from '@/components/splitter';

function DetailRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

export default function AccountPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  async function onLogout() {
    await logout();
    router.push('/login');
  }

  const verifiedLabel = user.emailVerified ? 'Verified' : 'Pending';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="splitter-shadow overflow-hidden p-0">
        <div className="splitter-brand-gradient px-6 py-8 text-white">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar name={user.name} size="lg" className="ring-2 ring-white/40" />
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-sm text-white/85">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 px-6 py-4">
          <Badge tone="accent">{user.role}</Badge>
          <Badge tone={user.emailVerified ? 'success' : 'neutral'}>{verifiedLabel}</Badge>
        </div>
      </Card>

      <Card className="splitter-shadow">
        <h3 className="mb-1 text-base font-semibold">Account details</h3>
        <p className="mb-2 text-sm text-muted-foreground">
          This is the profile used for group membership and settlements.
        </p>
        <dl>
          <DetailRow label="Full name" value={user.name} />
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="Role" value={user.role} />
          <DetailRow label="Email status" value={verifiedLabel} />
          <DetailRow label="User ID" value={user.id} />
        </dl>
      </Card>

      <Card className="splitter-shadow">
        <h3 className="text-base font-semibold">Session</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign out on this device. You can log back in anytime with the same email.
        </p>
        <Button variant="ghost" className="mt-4" onClick={() => void onLogout()}>
          Log out
        </Button>
      </Card>
    </div>
  );
}

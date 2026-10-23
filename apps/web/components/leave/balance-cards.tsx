import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from '@shared/ui/components';
import { plural } from '@/lib/leave/format';
import type { Balance } from '@/lib/leave/types';

function BalanceCard({ balance }: Readonly<{ balance: Balance }>) {
  if (!balance.configured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{balance.leaveTypeName}</CardTitle>
          <CardDescription>{`Not set for ${balance.year} yet`}</CardDescription>
        </CardHeader>
        <CardBody>
          <p className="m-0 text-sm text-muted-foreground">
            Ask HR to set your balance before applying.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{balance.leaveTypeName}</CardTitle>
      </CardHeader>
      <CardBody>
        <p className="m-0 text-2xl font-semibold text-foreground">
          {balance.availableDays}{' '}
          <span className="text-sm font-normal text-muted-foreground">
            {`of ${balance.totalDays} days left`}
          </span>
        </p>
        <p className="mt-1 mb-0 text-xs text-muted-foreground">
          {`${balance.usedDays} used · ${plural(balance.pendingDays, 'day')} pending`}
        </p>
      </CardBody>
    </Card>
  );
}

export function BalanceCards({ balances }: Readonly<{ balances: Balance[] }>) {
  if (balances.length === 0) {
    return (
      <EmptyState
        title="No leave types yet"
        description="An admin has to create leave types before anyone can apply."
      />
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {balances.map((balance) => (
        <BalanceCard key={balance.leaveTypeId} balance={balance} />
      ))}
    </div>
  );
}

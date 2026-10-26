import { StatusMessage } from '@shared/ui/components';
import { formatDay, workingDaysLabel } from '@/lib/leave/dates';
import { errorMessage } from '@/lib/leave/errors';
import { plural } from '@/lib/leave/format';
import type { Balance, Quote } from '@/lib/leave/types';

type WorkingDaysPreviewProps = Readonly<{
  startDate: string;
  endDate: string;
  quote: Quote | undefined;
  loading: boolean;
  error: unknown;
}>;

// "3 working days, Fri to Tue" before the user submits
export function WorkingDaysPreview({
  startDate,
  endDate,
  quote,
  loading,
  error,
}: WorkingDaysPreviewProps) {
  if (!startDate || !endDate) {
    return (
      <StatusMessage>Pick both dates to see how many working days this is.</StatusMessage>
    );
  }
  if (error) return <StatusMessage tone="error">{errorMessage(error)}</StatusMessage>;
  if (loading || !quote) return <StatusMessage>Counting working days…</StatusMessage>;
  if (quote.days === 0) {
    return <StatusMessage tone="error">No working days in this range</StatusMessage>;
  }

  const skipped = quote.holidays
    .map((h) => `${h.name} (${formatDay(h.date)})`)
    .join(', ');
  return (
    <div>
      <p className="m-0 text-base font-semibold text-foreground">
        {workingDaysLabel(quote.days, startDate, endDate)}
      </p>
      {skipped ? (
        <p className="mt-1 mb-0 text-sm text-muted-foreground">{`Skips ${skipped}`}</p>
      ) : null}
    </div>
  );
}

type DaysLeftProps = Readonly<{
  balance: Balance | undefined;
  requested: number | undefined;
}>;

export function DaysLeftNote({ balance, requested }: DaysLeftProps) {
  if (!balance) return null;
  if (!balance.configured) {
    return (
      <StatusMessage tone="error">
        {`You have no ${balance.leaveTypeName} balance for ${balance.year}. Ask HR to set your balance.`}
      </StatusMessage>
    );
  }
  if (requested !== undefined && requested > balance.availableDays) {
    return (
      <StatusMessage tone="error">
        {`That's more than the ${plural(balance.availableDays, 'day')} of ${balance.leaveTypeName} you have left.`}
      </StatusMessage>
    );
  }
  return (
    <StatusMessage>
      {`${plural(balance.availableDays, 'day')} of ${balance.leaveTypeName} left (${balance.pendingDays} already pending).`}
    </StatusMessage>
  );
}

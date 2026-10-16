export function CheckoutSummary({
  memberName,
  copyCount,
  atLimit,
}: Readonly<{
  memberName?: string | null;
  copyCount: number;
  atLimit: boolean;
}>) {
  return (
    <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
      {memberName ? `${memberName} · ` : ''}
      {copyCount} available cop{copyCount === 1 ? 'y' : 'ies'}
      {atLimit ? ' · at borrow limit' : ''}
    </p>
  );
}

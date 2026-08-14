type StatCardProps = {
  label: string;
  /** Undefined while the count is still loading. */
  value: number | undefined;
  hint?: string;
};

export function StatCard({ label, value, hint }: Readonly<StatCardProps>) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted/40 p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      {value === undefined ? (
        <span className="mt-2 block h-8 w-12 animate-pulse rounded bg-border" />
      ) : (
        <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
      )}
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

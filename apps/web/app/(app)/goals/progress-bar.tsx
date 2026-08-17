export function ProgressBar({ percent }: Readonly<{ percent: number }>) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <progress className="sr-only" value={clamped} max={100} />
      <div
        aria-hidden="true"
        className={clamped >= 100 ? 'h-full bg-success' : 'h-full bg-primary'}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

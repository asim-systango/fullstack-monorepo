import type { CSSProperties } from 'react';

export function MemberMetricCard({
  label,
  value,
  hint,
  stagger = 0,
}: Readonly<{
  label: string;
  value: string;
  hint: string;
  stagger?: number;
}>) {
  return (
    <article
      className="member-card member-metric member-enter p-4"
      style={{ '--member-stagger': stagger } as CSSProperties}
    >
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.06em] text-[color:var(--bookly-muted)]">
        {label}
      </p>
      <p className="mt-2 mb-0 text-2xl font-semibold tracking-tight text-[color:var(--bookly-navy)]">
        {value}
      </p>
      <p className="mt-1 mb-0 text-sm text-[color:var(--bookly-muted)]">{hint}</p>
    </article>
  );
}

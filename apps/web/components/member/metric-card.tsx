import Link from 'next/link';
import type { CSSProperties } from 'react';
import { MetricCard } from '@shared/ui/components';

export function MemberMetricCard({
  label,
  value,
  hint,
  href,
  stagger = 0,
}: Readonly<{
  label: string;
  value: string;
  hint: string;
  href: string;
  stagger?: number;
}>) {
  return (
    <Link
      href={href}
      className="member-card member-metric member-enter p-4 no-underline hover:no-underline"
      style={{ '--member-stagger': stagger } as CSSProperties}
    >
      <MetricCard label={label} value={value} hint={hint} />
    </Link>
  );
}

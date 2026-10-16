import Link from 'next/link';
import { MetricCard } from '@shared/ui/components';

export function StaffMetricCard({
  label,
  value,
  hint,
  tone = 'default',
  href,
}: Readonly<{
  label: string;
  value: string | number;
  hint: string;
  tone?: 'default' | 'warn' | 'ok';
  href?: string;
}>) {
  const body = (
    <MetricCard
      className={`staff-card staff-metric${tone === 'warn' ? ' staff-metric-warn' : ''}${tone === 'ok' ? ' staff-metric-ok' : ''}`}
      label={label}
      value={value}
      hint={hint}
    />
  );

  if (href) {
    return (
      <Link href={href} className="no-underline hover:no-underline">
        {body}
      </Link>
    );
  }

  return body;
}

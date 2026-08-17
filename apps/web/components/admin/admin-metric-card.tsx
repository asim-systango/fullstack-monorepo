import Link from 'next/link';
import { MetricCard } from '@shared/ui/components';

export function AdminMetricCard({
  label,
  value,
  hint,
  tone = 'default',
  href,
}: Readonly<{
  label: string;
  value: string | number;
  hint: string;
  tone?: 'default' | 'warn' | 'ok' | 'policy';
  href?: string;
}>) {
  let extra = '';
  if (tone === 'warn') extra = ' admin-metric-warn';
  else if (tone === 'ok') extra = ' admin-metric-ok';
  else if (tone === 'policy') extra = ' admin-metric-policy';

  const body = (
    <MetricCard
      className={`admin-card admin-metric${extra}`}
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

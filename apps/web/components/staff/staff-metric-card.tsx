import Link from 'next/link';

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
  let toneClass = '';
  if (tone === 'warn') toneClass = 'staff-metric-warn';
  else if (tone === 'ok') toneClass = 'staff-metric-ok';

  const body = (
    <div className={`staff-card staff-metric ${toneClass}`}>
      <p className="staff-metric-label">{label}</p>
      <p className="staff-metric-value">{value}</p>
      <p className="staff-metric-hint">{hint}</p>
    </div>
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

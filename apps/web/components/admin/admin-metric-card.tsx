import Link from 'next/link';

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
  let toneClass = '';
  if (tone === 'warn') toneClass = 'admin-metric-warn';
  else if (tone === 'ok') toneClass = 'admin-metric-ok';
  else if (tone === 'policy') toneClass = 'admin-metric-policy';

  const body = (
    <div className={`admin-card admin-metric ${toneClass}`}>
      <p className="admin-metric-label">{label}</p>
      <p className="admin-metric-value">{value}</p>
      <p className="admin-metric-hint">{hint}</p>
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

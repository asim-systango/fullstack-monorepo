import Link from 'next/link';

export function BrandMark({ href = '/' }: Readonly<{ href?: string }>) {
  return (
    <Link href={href} style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: 'var(--tg-hero)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        T
      </div>
      <span style={{ fontSize: 15.5, fontWeight: 500, color: 'var(--tg-text)' }}>TastyGo</span>
    </Link>
  );
}

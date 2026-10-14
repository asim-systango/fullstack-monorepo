import Link from 'next/link';

export function AccessDenied() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <h1 style={{ fontSize: 20, fontWeight: 500, color: 'var(--tg-text)', margin: '0 0 8px' }}>
        Access denied
      </h1>
      <p style={{ fontSize: 14, color: 'var(--tg-text-muted)', margin: '0 0 18px' }}>
        You do not have permission to view this page.
      </p>
      <Link href="/restaurants" className="tg-btn tg-btn-primary" style={{ textDecoration: 'none' }}>
        Browse restaurants
      </Link>
    </div>
  );
}

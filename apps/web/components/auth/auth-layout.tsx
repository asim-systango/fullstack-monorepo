import type { ReactNode } from 'react';
import Link from 'next/link';

export function AuthLayout({
  children,
  headline,
  lede,
}: Readonly<{ children: ReactNode; headline: string; lede: string }>) {
  return (
    <div className="tf-auth-layout tf-enter">
      <aside className="tf-auth-panel">
        <div>
          <Link
            href="/"
            className="tf-brand-mark text-inherit no-underline hover:no-underline"
          >
            <span className="tf-brand-glyph">Tf</span>
            <span className="text-lg font-semibold tracking-tight">TaskFlow</span>
          </Link>
          <p className="tf-auth-kicker mt-10">Project management</p>
          <h1 className="tf-auth-headline">{headline}</h1>
          <p className="tf-auth-lede">{lede}</p>
        </div>
        <p className="text-sm text-white/55">
          Leads plan · members ship · boards stay honest
        </p>
      </aside>
      <section className="tf-auth-form">
        <div className="tf-auth-form-inner">{children}</div>
      </section>
    </div>
  );
}

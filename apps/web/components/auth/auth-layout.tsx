import type { ReactNode } from 'react';
import Link from 'next/link';
import { AuthBoardSvg } from './auth-board-svg';

export function AuthLayout({
  children,
  headline,
  lede,
}: Readonly<{ children: ReactNode; headline: string; lede: string }>) {
  return (
    <div className="tf-auth-layout tf-enter">
      <aside className="tf-auth-panel">
        <Link
          href="/"
          className="tf-brand-mark tf-auth-brand text-inherit no-underline hover:no-underline"
        >
          <span className="tf-brand-glyph">Tf</span>
          <span className="text-lg font-semibold tracking-tight">TaskFlow</span>
        </Link>

        <div className="tf-auth-panel-center">
          <AuthBoardSvg />
          <p className="tf-auth-kicker">Project management</p>
          <h1 className="tf-auth-headline">{headline}</h1>
          <p className="tf-auth-lede">{lede}</p>
        </div>

        <p className="tf-auth-panel-foot">Admin oversees · leads plan · members ship</p>
      </aside>
      <section className="tf-auth-form">
        <div className="tf-auth-form-inner">{children}</div>
      </section>
    </div>
  );
}

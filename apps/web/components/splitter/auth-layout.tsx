'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { IconChevron, IconGlobe, IconSun } from './icons';

const FEATURES = [
  'Track group expenses in real-time',
  'Settle up with one tap',
  'Invite friends via email instantly',
] as const;

function AuthBrandPanel() {
  return (
    <aside className="splitter-auth-brand">
      <div className="splitter-auth-brand-bg" aria-hidden />
      <div className="splitter-auth-brand-inner">
        <Link href="/login" className="splitter-auth-logo">
          <span className="splitter-auth-logo-mark" aria-hidden>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
              <path
                d="M7 8.5h10M7 15.5h10M9.5 8.5v7M14.5 8.5v7"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>SPLITTER</span>
        </Link>

        <div className="splitter-auth-hero">
          <h2 className="splitter-auth-hero-title">The smarter way to split expenses</h2>
          <p className="splitter-auth-hero-copy">
            Track shared costs, settle balances, and keep every group trip or household
            budget fair — without the spreadsheet headache.
          </p>
        </div>

        <div className="splitter-auth-showcase" aria-hidden>
          <div className="splitter-auth-showcase-card">
            <p className="splitter-auth-showcase-card-title">Trip to Goa</p>
            <ul className="splitter-auth-showcase-lines">
              <li>
                <span>Dinner</span>
                <span>₹1,800</span>
              </li>
              <li>
                <span>Taxi</span>
                <span>₹640</span>
              </li>
              <li>
                <span>Hotel</span>
                <span>₹2,000</span>
              </li>
            </ul>
            <p className="splitter-auth-showcase-total">
              <span>Total</span>
              <span>₹4,440</span>
            </p>
          </div>

          <div className="splitter-auth-showcase-flow">
            <div className="splitter-auth-avatars">
              <span className="splitter-auth-avatar splitter-auth-avatar-a">A</span>
              <span className="splitter-auth-avatar splitter-auth-avatar-b">B</span>
              <span className="splitter-auth-avatar splitter-auth-avatar-c">C</span>
            </div>
            <span className="splitter-auth-showcase-arrow">→</span>
            <div className="splitter-auth-showcase-card splitter-auth-showcase-card-sm">
              <p className="splitter-auth-balance-line splitter-auth-balance-positive">
                You are owed <strong>₹1,250.00</strong>
              </p>
              <p className="splitter-auth-balance-line splitter-auth-balance-negative">
                You owe <strong>₹350.00</strong>
              </p>
            </div>
          </div>
        </div>

        <ul className="splitter-auth-features">
          {FEATURES.map((feature) => (
            <li key={feature}>
              <span className="splitter-auth-feature-check" aria-hidden>
                ✓
              </span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function AuthToolbar() {
  return (
    <header className="splitter-auth-toolbar">
      <div className="splitter-auth-toolbar-actions">
        <label className="splitter-auth-lang">
          <span className="splitter-auth-lang-icon" aria-hidden>
            <IconGlobe />
          </span>
          <select
            className="splitter-auth-lang-select"
            defaultValue="en"
            aria-label="Language"
          >
            <option value="en">English</option>
          </select>
          <span className="splitter-auth-lang-chevron" aria-hidden>
            <IconChevron />
          </span>
        </label>
        <button type="button" className="splitter-auth-theme-btn" aria-label="Light mode">
          <IconSun />
        </button>
      </div>
    </header>
  );
}

function AuthFooter() {
  return (
    <footer className="splitter-auth-footer">
      <div className="splitter-auth-footer-inner">
        <p>© 2026 Splitter. All rights reserved.</p>
        <nav className="splitter-auth-footer-links" aria-label="Legal">
          <Link href="/help">Privacy Policy</Link>
          <span aria-hidden>·</span>
          <Link href="/help">Terms of Service</Link>
          <span aria-hidden>·</span>
          <Link href="/help">Help</Link>
        </nav>
      </div>
    </footer>
  );
}

export function AuthLayout({
  title,
  subtitle,
  children,
}: Readonly<{ title: string; subtitle?: string; children: ReactNode }>) {
  return (
    <div className="splitter-auth">
      <AuthBrandPanel />
      <div className="splitter-auth-main">
        <AuthToolbar />
        <main className="splitter-auth-content">
          <div className="splitter-auth-mobile-brand lg:hidden">
            <Link href="/login" className="splitter-auth-logo splitter-auth-logo-dark">
              <span
                className="splitter-auth-logo-mark splitter-auth-logo-mark-dark"
                aria-hidden
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                  <path
                    d="M7 8.5h10M7 15.5h10M9.5 8.5v7M14.5 8.5v7"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span>SPLITTER</span>
            </Link>
          </div>
          <div className="splitter-auth-form-wrap">
            <div className="splitter-auth-glass">
              <h1 className="splitter-auth-title">{title}</h1>
              {subtitle ? <p className="splitter-auth-subtitle">{subtitle}</p> : null}
              <div className="splitter-auth-body">{children}</div>
            </div>
          </div>
        </main>
        <AuthFooter />
      </div>
    </div>
  );
}

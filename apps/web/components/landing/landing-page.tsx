'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BooklyLogo, useAuth } from '@/components/auth';
import { ROUTES } from '@/lib/auth/routes';
import { usePublicDashboard } from '@/lib/bookly';
import { LandingPreview } from './landing-preview';

export function LandingPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const catalog = usePublicDashboard();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(ROUTES.dashboard);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="landing-shell flex min-h-dvh items-center justify-center">
        <p className="m-0 text-sm text-[color:var(--bookly-muted)]">Loading Bookly…</p>
      </div>
    );
  }

  let badge = 'Library catalog, loans, and administration';
  if (catalog.data) {
    const titles = catalog.data.totalTitles;
    const copies = catalog.data.availableCopies;
    const titleLabel = titles === 1 ? 'title' : 'titles';
    const copyLabel = copies === 1 ? 'copy' : 'copies';
    badge = `${titles} ${titleLabel} · ${copies} available ${copyLabel}`;
  }

  return (
    <div className="landing-shell">
      <header className="landing-header">
        <Link href="/" className="landing-brand">
          <span className="landing-brand-mark">
            <BooklyLogo variant="mark" priority className="h-7 w-7 object-contain" />
          </span>
          Bookly
        </Link>

        <nav className="landing-nav" aria-label="Landing">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#roles">Roles</a>
        </nav>

        <div className="landing-header-actions">
          <Link href={ROUTES.login} className="landing-btn landing-btn-outline">
            Log in
          </Link>
          <Link href={ROUTES.register} className="landing-btn landing-btn-primary">
            Get started
          </Link>
          <button
            type="button"
            className="landing-menu"
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-nav"
            aria-label="Open menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            Menu
          </button>
        </div>
      </header>

      {menuOpen ? (
        <nav
          id="landing-mobile-nav"
          className="landing-mobile-nav"
          aria-label="Landing mobile"
        >
          <a href="#features" onClick={() => setMenuOpen(false)}>
            Features
          </a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
            How it works
          </a>
          <a href="#roles" onClick={() => setMenuOpen(false)}>
            Roles
          </a>
          <Link href={ROUTES.login} onClick={() => setMenuOpen(false)}>
            Log in
          </Link>
        </nav>
      ) : null}

      <p className="landing-strip">
        Members, staff, and administrators — one library console
      </p>

      <main className="landing-main">
        <section className="landing-hero">
          <p className="landing-badge">{badge}</p>
          <h1>
            One-stop digital solution for your <em>Library</em>
          </h1>
          <p className="landing-hero-lead">
            Browse the catalog, track loans and reservations, run the librarian desk, and
            govern members and policy from a single Bookly workspace.
          </p>
          <div className="landing-hero-actions">
            <Link href={ROUTES.register} className="landing-btn landing-btn-primary">
              Create account →
            </Link>
            <Link href={ROUTES.login} className="landing-btn landing-btn-outline">
              Log in
            </Link>
          </div>
        </section>

        <LandingPreview />

        <section id="features" className="landing-section">
          <h2>Built for day-to-day library work</h2>
          <p>The same flows members, staff, and administrators already use in Bookly.</p>
          <div className="landing-feature-grid">
            <article className="landing-card">
              <h3>Catalog</h3>
              <p>
                Search by title, author, or ISBN and see how many copies are available.
              </p>
            </article>
            <article className="landing-card">
              <h3>Loans &amp; reservations</h3>
              <p>
                Members track due dates and queue position. Staff check out and return at
                the desk.
              </p>
            </article>
            <article className="landing-card">
              <h3>Governance</h3>
              <p>
                Administrators manage members, borrowing limits, and fines without mixing
                staff tools.
              </p>
            </article>
          </div>
        </section>

        <section id="how-it-works" className="landing-section">
          <h2>How it works</h2>
          <p>
            Create an account, verify your email, then use Bookly in the role assigned to
            you.
          </p>
          <div className="landing-feature-grid">
            <article className="landing-card">
              <h3>1. Register</h3>
              <p>Members create an account and confirm it with an email code.</p>
            </article>
            <article className="landing-card">
              <h3>2. Browse &amp; reserve</h3>
              <p>Find a title. If every copy is out, join the reservation queue.</p>
            </article>
            <article className="landing-card">
              <h3>3. Borrow at the desk</h3>
              <p>
                Checkout and return stay with library staff. Members see loans and fines
                online.
              </p>
            </article>
          </div>
        </section>

        <section id="roles" className="landing-section">
          <h2>Three roles, clear boundaries</h2>
          <p>Bookly does not treat every signed-in user as a librarian.</p>
          <div className="landing-role-grid">
            <article className="landing-card">
              <h3>Member</h3>
              <p>Catalog, own loans, reservations, and fines. No desk checkout.</p>
            </article>
            <article className="landing-card">
              <h3>Staff</h3>
              <p>
                Checkout, return, member lookup, overdue follow-up, and catalog
                operations.
              </p>
            </article>
            <article className="landing-card">
              <h3>Administrator</h3>
              <p>Member governance, library policies, fines, and platform visibility.</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="landing-footer">Bookly · Library management</footer>
    </div>
  );
}

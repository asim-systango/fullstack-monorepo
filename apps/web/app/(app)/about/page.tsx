'use client';

import Link from 'next/link';
import { MemberContent, MemberPageHeader, RequireMember } from '@/components/member';
import { ROUTES } from '@/lib/auth/routes';

function AboutContent() {
  return (
    <MemberContent className="member-about">
      <MemberPageHeader
        title="About"
        description="Bookly is your library workspace — catalog, loans, reservations, and fines in one place."
      />

      <section className="member-card member-about-card member-enter">
        <h2 className="member-about-title">What Bookly is</h2>
        <p className="member-about-copy">
          Bookly is a library management platform for members, librarians, and administrators.
          As a member you can search the catalog, request available titles, join a reservation
          queue when every copy is out, and keep track of due dates and fines.
        </p>
      </section>

      <section className="member-card member-about-card">
        <h2 className="member-about-title">How members use Bookly</h2>
        <ul className="member-about-list">
          <li>
            Browse the catalog by title, author, or ISBN. Open a title to see availability.
          </li>
          <li>
            If a copy is available, send a checkout request. A librarian will issue the book at
            the desk.
          </li>
          <li>
            If every copy is on loan, reserve the title and watch your queue position.
          </li>
          <li>
            Returns and fine payments are handled at the library desk. Bookly keeps the record
            visible so you always know where you stand.
          </li>
        </ul>
      </section>

      <section className="member-card member-about-card">
        <h2 className="member-about-title">Need a hand?</h2>
        <p className="member-about-copy">
          Start with the catalog, then use Overview to see active loans, reservations, and any
          outstanding balance.
        </p>
        <div className="member-about-actions">
          <Link
            href={ROUTES.books}
            className="ui-button ui-button-md ui-button-primary member-about-btn no-underline hover:no-underline"
          >
            Browse books
          </Link>
          <Link href={ROUTES.dashboard} className="member-inline-link">
            Go to Overview
          </Link>
        </div>
      </section>
    </MemberContent>
  );
}

export default function AboutPage() {
  return (
    <RequireMember>
      <AboutContent />
    </RequireMember>
  );
}

'use client';

import Link from 'next/link';
import { LoadingState } from '@shared/ui/components';
import { ShellHeader, useAuth } from '@/components/auth';
import { TaskFlowPage } from '@/components/taskflow-page';
import { HomeBoardArt } from '@/components/tf-illustrations';

const FEATURES = [
  {
    title: 'Projects & membership',
    body: 'Leads create workspaces, invite members by email, and keep access scoped to the people who ship.',
  },
  {
    title: 'Issue board',
    body: 'Move work through todo → in progress → done with a status machine that blocks illegal jumps.',
  },
  {
    title: 'Comments & activity',
    body: 'Discuss on the issue, see who changed status, and keep an audit trail without leaving TaskFlow.',
  },
  {
    title: 'Live updates',
    body: 'Open the board in two tabs — status changes stream over WebSocket so the team stays in sync.',
  },
] as const;

const ROLES = [
  {
    role: 'Admin',
    account: 'admin@demo.local',
    body: 'Platform-wide visibility — can list projects across the workspace for oversight.',
  },
  {
    role: 'Staff (lead)',
    account: 'staff@demo.local',
    body: 'Creates projects, manages members, and owns planning for the team.',
  },
  {
    role: 'User (member)',
    account: 'user@demo.local',
    body: 'Works issues and comments inside projects they’ve joined — no platform admin.',
  },
] as const;

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <TaskFlowPage wide className="tf-home">
      <ShellHeader subtitle="Ship work together" />

      {/* Same shell as Projects / My issues (tf-domain-hero) — avoids tab jump */}
      <section className="tf-domain-hero tf-home-hero tf-enter">
        <div className="tf-domain-hero-copy">
          <p className="tf-home-kicker">Project management</p>
          <h1 className="tf-home-title">TaskFlow</h1>
          <p className="tf-home-lede">
            Boards, issues, and membership in one workspace — for leads who plan and
            members who ship.
          </p>
          {loading ? <LoadingState label="Loading session…" /> : null}
          {!loading && user ? (
            <div className="tf-home-actions">
              <Link
                href="/projects"
                className="ui-button ui-button-md ui-button-primary no-underline hover:no-underline"
              >
                Open projects
              </Link>
              <Link
                href="/dashboard"
                className="ui-button ui-button-md ui-button-secondary no-underline hover:no-underline"
              >
                My open issues
              </Link>
            </div>
          ) : null}
          {!loading && !user ? (
            <div className="tf-home-actions-block">
              <div className="tf-home-actions">
                <Link
                  href="/login"
                  className="ui-button ui-button-md ui-button-primary no-underline hover:no-underline"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="ui-button ui-button-md ui-button-secondary no-underline hover:no-underline"
                >
                  Register
                </Link>
              </div>
              <p className="tf-home-demo">
                Demo · <code>staff@demo.local</code> / <code>user@demo.local</code> ·{' '}
                <code>password123</code>
              </p>
            </div>
          ) : null}
        </div>
        <HomeBoardArt />
      </section>

      <section className="tf-home-section tf-enter tf-enter-delay-1">
        <header className="tf-home-section-head">
          <h2>What TaskFlow is</h2>
          <p>
            A focused project-management app: create a project, invite the team, track
            issues on a board, comment, and soft-delete work that’s done or cancelled —
            with live board sync for everyone watching.
          </p>
        </header>
      </section>

      <section className="tf-home-section tf-enter tf-enter-delay-2">
        <header className="tf-home-section-head">
          <h2>How it helps</h2>
          <p>Each surface has one job — less noise, clearer handoffs.</p>
        </header>
        <div className="tf-feature-grid">
          {FEATURES.map((f) => (
            <article key={f.title} className="tf-feature tf-card-lift">
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="tf-home-section tf-enter tf-enter-delay-3">
        <header className="tf-home-section-head">
          <h2>Who uses it</h2>
          <p>
            Three gateway roles — not one person managing everything. Password for demos:{' '}
            <code>password123</code>.
          </p>
        </header>
        <div className="tf-role-grid">
          {ROLES.map((r) => (
            <article key={r.role} className="tf-role tf-card-lift">
              <h3>{r.role}</h3>
              <p className="tf-role-account">
                <code>{r.account}</code>
              </p>
              <p>{r.body}</p>
            </article>
          ))}
        </div>
      </section>
    </TaskFlowPage>
  );
}

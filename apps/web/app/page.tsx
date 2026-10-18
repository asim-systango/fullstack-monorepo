'use client';

import Link from 'next/link';
import { LoadingState } from '@shared/ui/components';
import { ShellHeader, useAuth } from '@/components/auth';
import { TaskFlowPage } from '@/components/taskflow-page';

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <TaskFlowPage wide>
      <ShellHeader subtitle="Ship work together" />
      <section className="tf-hero tf-enter">
        <p className="tf-auth-kicker m-0 text-white/60">Project management</p>
        <h1 className="tf-hero-brand">TaskFlow</h1>
        <p className="tf-hero-copy">
          Boards, issues, and membership in one workspace — for leads who plan and members
          who ship.
        </p>
        {loading ? <LoadingState label="Loading session…" /> : null}
        {!loading && user ? (
          <div className="flex flex-wrap gap-3">
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
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
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
            <p className="m-0 text-sm text-white/55">
              Demo · <code>staff@demo.local</code> / <code>user@demo.local</code> ·{' '}
              <code>password123</code>
            </p>
          </div>
        ) : null}
      </section>
    </TaskFlowPage>
  );
}

'use client';

import Link from 'next/link';
import { LoadingState } from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { roleHome } from '@/lib/auth-home';

export function HomeLinks() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState label="Checking session…" />;
  }

  if (!user) {
    return (
      <p className="mt-4">
        <Link href="/login">Log in</Link> with a seed user to open your workspace.
      </p>
    );
  }

  const home = roleHome(user.role);

  return (
    <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
      <li>
        Signed in as <span className="font-mono">{user.email}</span> ({user.role})
      </li>
      <li>
        <Link href={home}>Go to your workspace</Link>
        {user.role === 'user' ? ' (Resumes)' : null}
        {user.role === 'admin' ? ' (Templates)' : null}
      </li>
      {user.role === 'admin' ? (
        <li>
          <Link href="/admin/resumes">All resumes</Link>
        </li>
      ) : null}
      {user.role === 'user' ? (
        <li>
          <Link href="/resumes/new">Create a new resume</Link>
        </li>
      ) : null}
    </ul>
  );
}

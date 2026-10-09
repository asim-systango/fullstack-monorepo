'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@shared/ui/components';
import MobileMenu from './mobile-menu';

export default function Navbar() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="text-xl font-bold">LMS</div>
            <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-ink">
              LMS
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/courses"
                className="text-sm text-muted-foreground hover:text-ink transition-colors"
              >
                Courses
              </Link>

              {user?.role === 'user' && (
                <>
                  <Link
                    href="/my/dashboard"
                    className="text-sm text-muted-foreground hover:text-ink transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/my/courses"
                    className="text-sm text-muted-foreground hover:text-ink transition-colors"
                  >
                    My Courses
                  </Link>
                  <Link
                    href="/my/grades"
                    className="text-sm text-muted-foreground hover:text-ink transition-colors"
                  >
                    My Grades
                  </Link>
                  <Link
                    href="/my/certificates"
                    className="text-sm text-muted-foreground hover:text-ink transition-colors"
                  >
                    Certificates
                  </Link>
                </>
              )}

              {user?.role === 'staff' && (
                <>
                  <Link
                    href="/instructor"
                    className="text-sm text-muted-foreground hover:text-ink transition-colors"
                  >
                    Instructor Dashboard
                  </Link>
                  <Link
                    href="/instructor/courses"
                    className="text-sm text-muted-foreground hover:text-ink transition-colors"
                  >
                    My Courses
                  </Link>
                  <Link
                    href="/instructor/courses/create"
                    className="text-sm text-muted-foreground hover:text-ink transition-colors"
                  >
                    Create Course
                  </Link>
                </>
              )}

              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="text-sm text-muted-foreground hover:text-ink transition-colors"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <MobileMenu />

            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user.name}
                </span>
                <Button onClick={logout} variant="ghost" size="sm">
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

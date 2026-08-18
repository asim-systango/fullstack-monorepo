'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@shared/ui/components';

export default function MobileMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        className="md:hidden"
      >
        {isOpen ? '✕' : '☰'}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="flex flex-col h-full p-4">
            <div className="flex justify-between items-center mb-8">
              <span className="text-xl font-bold">Menu</span>
              <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm">
                ✕
              </Button>
            </div>

            <div className="flex flex-col gap-4">
              <Link href="/" onClick={() => setIsOpen(false)} className="text-lg py-2">
                Home
              </Link>
              <Link
                href="/courses"
                onClick={() => setIsOpen(false)}
                className="text-lg py-2"
              >
                Courses
              </Link>

              {user?.role === 'user' && (
                <>
                  <Link
                    href="/my/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="text-lg py-2"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/my/courses"
                    onClick={() => setIsOpen(false)}
                    className="text-lg py-2"
                  >
                    My Courses
                  </Link>
                  <Link
                    href="/my/grades"
                    onClick={() => setIsOpen(false)}
                    className="text-lg py-2"
                  >
                    My Grades
                  </Link>
                  <Link
                    href="/my/certificates"
                    onClick={() => setIsOpen(false)}
                    className="text-lg py-2"
                  >
                    Certificates
                  </Link>
                </>
              )}

              {user?.role === 'staff' && (
                <>
                  <Link
                    href="/instructor"
                    onClick={() => setIsOpen(false)}
                    className="text-lg py-2"
                  >
                    Instructor Dashboard
                  </Link>
                  <Link
                    href="/instructor/courses"
                    onClick={() => setIsOpen(false)}
                    className="text-lg py-2"
                  >
                    My Courses
                  </Link>
                  <Link
                    href="/instructor/courses/create"
                    onClick={() => setIsOpen(false)}
                    className="text-lg py-2"
                  >
                    Create Course
                  </Link>
                </>
              )}

              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="text-lg py-2"
                >
                  Admin
                </Link>
              )}
              <div className="border-t pt-4 mt-4">
                {user ? (
                  <>
                    <div className="text-sm text-muted-foreground mb-4">
                      Signed in as {user.name}
                    </div>
                    <Button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="w-full"
                    >
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full"
                    >
                      <Button variant="ghost" className="w-full mb-2">
                        Log In
                      </Button>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="w-full"
                    >
                      <Button className="w-full">Register</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

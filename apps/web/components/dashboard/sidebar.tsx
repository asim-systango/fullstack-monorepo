'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth';
import { hasRole, ROLES } from '@/lib/auth/roles';
import { ROUTES } from '@/lib/auth/routes';
import { adminNavSections, memberNavSections, staffNavSections } from './nav-items';

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  open,
  onClose,
}: Readonly<{ open: boolean; onClose: () => void }>) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isMember = hasRole(user, [ROLES.user]);
  const isStaff = hasRole(user, [ROLES.staff]);
  const isAdmin = hasRole(user, [ROLES.admin]);

  let asideClass = 'border-border bg-card';
  if (isMember) asideClass = 'member-sidebar border-[color:var(--bookly-border)]';
  else if (isStaff) asideClass = 'staff-sidebar border-[color:var(--bookly-border)]';
  else if (isAdmin) asideClass = 'admin-sidebar border-[color:var(--bookly-border)]';

  let brandClass = 'border-b border-border';
  if (isMember) brandClass = 'member-sidebar-brand';
  else if (isStaff) brandClass = 'staff-sidebar-brand';
  else if (isAdmin) brandClass = 'admin-sidebar-brand';

  const brandedMark = isMember || isStaff || isAdmin;

  let brandTitleClass = 'text-[#002B49]';
  if (isMember) brandTitleClass = 'member-brand-title';
  else if (isStaff) brandTitleClass = 'staff-brand-title';
  else if (isAdmin) brandTitleClass = 'admin-brand-title';

  let brandSubClass = 'text-muted-foreground';
  if (isMember) brandSubClass = 'member-brand-sub';
  else if (isStaff) brandSubClass = 'staff-brand-sub';
  else if (isAdmin) brandSubClass = 'admin-brand-sub';

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-[color-mix(in_oklch,var(--ink-950)_40%,transparent)] md:hidden"
          aria-label="Close menu"
          onClick={onClose}
        />
      ) : null}
      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-60 shrink-0 flex-col border-r transition-transform md:translate-x-0 ${asideClass} ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className={`flex min-h-[4.5rem] items-center gap-2 px-4 ${brandClass}`}>
          <div
            className={
              brandedMark
                ? 'flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,#fff_92%,transparent)] shadow-md'
                : undefined
            }
          >
            <Image
              src="/brand/bookly-mark.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
          </div>
          <div>
            <p className={`m-0 text-sm font-semibold tracking-tight ${brandTitleClass}`}>
              Bookly
            </p>
            <p className={`m-0 text-xs ${brandSubClass}`}>
              {isMember ? 'Your library' : 'Library console'}
            </p>
          </div>
        </div>

        {isMember ? (
          <nav
            className="flex flex-1 flex-col gap-4 overflow-y-auto p-3"
            aria-label="Member"
          >
            {memberNavSections().map((section) => (
              <div key={section.id}>
                {section.label ? (
                  <p className="member-nav-section">{section.label}</p>
                ) : null}
                <div className="flex flex-col gap-0.5">
                  {section.items.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? 'page' : undefined}
                        className="member-nav-link"
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        ) : null}

        {isStaff ? (
          <>
            <nav
              className="flex flex-1 flex-col gap-4 overflow-y-auto p-3"
              aria-label="Staff"
            >
              {staffNavSections().map((section) => (
                <div key={section.id}>
                  {section.label ? (
                    <p className="staff-nav-section">{section.label}</p>
                  ) : null}
                  <div className="flex flex-col gap-0.5">
                    {section.items.map((item) => {
                      const active = isActivePath(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          aria-current={active ? 'page' : undefined}
                          className="staff-nav-link"
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
            <p className="staff-sidebar-footer">Bookly · Library operations</p>
          </>
        ) : null}

        {isAdmin ? (
          <>
            <nav
              className="flex flex-1 flex-col gap-4 overflow-y-auto p-3"
              aria-label="Admin"
            >
              {adminNavSections().map((section) => (
                <div key={section.id}>
                  {section.label ? (
                    <p className="admin-nav-section">{section.label}</p>
                  ) : null}
                  <div className="flex flex-col gap-0.5">
                    {section.items.map((item) => {
                      const active = isActivePath(pathname, item.href);
                      const secondary = item.href === ROUTES.librarian;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          aria-current={active ? 'page' : undefined}
                          className={`admin-nav-link${secondary ? ' admin-nav-link-secondary' : ''}`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
            <p className="admin-sidebar-footer">Bookly · Administration</p>
          </>
        ) : null}
      </aside>
    </>
  );
}

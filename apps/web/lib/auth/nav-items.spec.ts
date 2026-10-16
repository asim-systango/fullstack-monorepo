import {
  ADMIN_NAV_SECTIONS,
  MEMBER_NAV_SECTIONS,
  STAFF_NAV_SECTIONS,
} from '@/components/dashboard/nav-items';

describe('role nav sections', () => {
  it('gives members catalog and my-* links', () => {
    const hrefs = MEMBER_NAV_SECTIONS.flatMap((section) => section.items.map((item) => item.href));
    expect(hrefs).toEqual(
      expect.arrayContaining(['/dashboard', '/books', '/my/loans', '/my/reservations']),
    );
  });

  it('gives staff desk circulation links', () => {
    const hrefs = STAFF_NAV_SECTIONS.flatMap((section) => section.items.map((item) => item.href));
    expect(hrefs).toEqual(
      expect.arrayContaining(['/librarian/checkout', '/librarian/returns', '/librarian/overdue']),
    );
  });

  it('gives admin policy and member admin links', () => {
    const hrefs = ADMIN_NAV_SECTIONS.flatMap((section) => section.items.map((item) => item.href));
    expect(hrefs).toEqual(expect.arrayContaining(['/admin/policies', '/admin/members']));
  });
});

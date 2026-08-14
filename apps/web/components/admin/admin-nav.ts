/**
 * Admin sections. Every entry points at a real page — the sidebar is the only
 * way into moderation, so a dead link here strands the role.
 */
export const ADMIN_NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/editors', label: 'Editors' },
  { href: '/admin/articles', label: 'Articles' },
  { href: '/admin/comments', label: 'Comments' },
  { href: '/admin/tags', label: 'Tags' },
] as const;

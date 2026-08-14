import type { GatewayRole } from '@/lib/auth/roles';

export type StudioNavItem = { href: string; label: string };

const AUTHOR_NAV: readonly StudioNavItem[] = [
  { href: '/studio', label: 'My Articles' },
  { href: '/studio/new', label: 'Create Article' },
];

const EDITOR_STUDIO_NAV: readonly StudioNavItem[] = [
  { href: '/studio', label: 'Articles' },
  { href: '/studio/new', label: 'Create Article' },
  { href: '/editor', label: 'Review Queue' },
];

/**
 * Chrome for the shared Author/Editor studio. Admins never land here — they
 * have `/admin`. Editors keep `/editor` for the review queue.
 */
export function getStudioWorkspace(role: GatewayRole | undefined) {
  const isEditor = role === 'staff';

  return {
    isEditor,
    role: (isEditor ? 'staff' : 'user') as GatewayRole,
    navItems: isEditor ? EDITOR_STUDIO_NAV : AUTHOR_NAV,
    listTitle: isEditor ? 'Articles' : 'My Articles',
    listSubtitle: isEditor
      ? 'Review and manage articles. You cannot publish your own — request review so another editor can.'
      : 'Write drafts and save revisions. An Editor publishes your work.',
    createSubtitle: isEditor
      ? 'Save a draft, then request review. Another editor must publish it.'
      : 'Save a draft revision. Editors publish when ready.',
    backLabel: isEditor ? 'Back to Articles' : 'Back to My Articles',
  };
}

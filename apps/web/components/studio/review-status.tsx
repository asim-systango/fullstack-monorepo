import type { ArticleReviewState } from '@/lib/api/studio';

type StateCopy = {
  label: string;
  className: string;
  /** Extra context shown next to the badge, when the pointers disagree. */
  note?: string;
};

/**
 * One source of truth for how each workflow position is worded, so the author
 * studio, the editor queue and the review page never contradict each other.
 */
export const REVIEW_STATE_COPY: Record<ArticleReviewState, StateCopy> = {
  draft: {
    label: 'Draft',
    className: 'bg-surface-muted text-body',
  },
  'pending-review': {
    label: 'Pending Review',
    className: 'bg-accent-yellow/30 text-foreground',
  },
  'changes-after-submit': {
    label: 'Pending Review',
    className: 'bg-accent-yellow/30 text-foreground',
    note: 'New changes have been made since this article was submitted.',
  },
  published: {
    label: 'Published',
    className: 'bg-brand/10 text-brand',
  },
  'published-pending-review': {
    label: 'Published',
    className: 'bg-brand/10 text-brand',
    note: 'A newer revision is waiting for an editor to review it.',
  },
  'published-with-draft': {
    label: 'Published',
    className: 'bg-brand/10 text-brand',
    note: 'You have newer changes that have not been submitted for review.',
  },
};

export function ReviewStatusBadge({ state }: Readonly<{ state: ArticleReviewState }>) {
  const { label, className } = REVIEW_STATE_COPY[state];
  return (
    <span className={`rounded-pill px-3 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

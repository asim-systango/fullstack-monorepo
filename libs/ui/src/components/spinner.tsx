import type { HTMLAttributes } from 'react';
import { cn } from '../cn';

export type SpinnerProps = Readonly<{
  className?: string;
  /** Visually hidden label for screen readers. */
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}>;

/**
 * Loading indicator. Uses native `<output>` (implicit `role="status"`)
 * instead of ARIA role overrides (Sonar S6819 / jsx-a11y prefer-tag-over-role).
 */
export function Spinner({ className, label = 'Loading', size = 'md' }: SpinnerProps) {
  return (
    <output
      className={cn(
        'ui-spinner',
        size === 'sm' && 'ui-spinner-sm',
        size === 'md' && 'ui-spinner-md',
        size === 'lg' && 'ui-spinner-lg',
        className,
      )}
    >
      <span className="ui-spinner-dot" aria-hidden />
      <span className="sr-only">{label}</span>
    </output>
  );
}

export type LoadingStateProps = Readonly<{
  label?: string;
  className?: string;
  /** Compact inline row vs padded block. */
  variant?: 'inline' | 'block';
}>;

/**
 * Block/inline loading copy. Announces via nested `<Spinner>` (`<output>`).
 * Visible label is aria-hidden so screen readers only hear the spinner once.
 */
export function LoadingState({
  label = 'Loading…',
  className,
  variant = 'inline',
}: LoadingStateProps) {
  return (
    <div
      className={cn('ui-loading', variant === 'block' && 'ui-loading-block', className)}
    >
      <Spinner label={label} />
      <span className="ui-loading-label" aria-hidden>
        {label}
      </span>
    </div>
  );
}

export type SkeletonProps = Readonly<
  HTMLAttributes<HTMLDivElement> & {
    /** Approximate height preset. */
    size?: 'sm' | 'md' | 'lg' | 'line';
  }
>;

/** Placeholder pulse for list/detail loading (prefer over empty content). */
export function Skeleton({ className, size = 'md', ...rest }: SkeletonProps) {
  return (
    <div
      className={cn(
        'ui-skeleton',
        size === 'sm' && 'ui-skeleton-sm',
        size === 'md' && 'ui-skeleton-md',
        size === 'lg' && 'ui-skeleton-lg',
        size === 'line' && 'ui-skeleton-line',
        className,
      )}
      aria-hidden
      {...rest}
    />
  );
}

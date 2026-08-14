import { bookInitials } from '@/lib/member';

const SIZE_CLASS = {
  sm: 'member-cover-sm',
  md: 'member-cover-md',
  lg: 'member-cover-lg',
} as const;

const TEXT_CLASS = {
  sm: 'text-sm',
  md: 'text-xl',
  lg: 'text-3xl',
} as const;

export function BookCover({
  title,
  size = 'md',
}: Readonly<{ title: string; size?: 'sm' | 'md' | 'lg' }>) {
  return (
    <div className={`member-cover ${SIZE_CLASS[size]}`} aria-hidden="true">
      <span className={TEXT_CLASS[size]}>{bookInitials(title)}</span>
    </div>
  );
}

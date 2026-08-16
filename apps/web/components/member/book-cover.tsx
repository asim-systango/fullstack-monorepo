import { bookInitials } from '@/lib/member';

const SIZE_CLASS = {
  sm: 'member-cover-sm',
  md: 'member-cover-md',
  lg: 'member-cover-lg',
} as const;

export function BookCover({
  title,
  size = 'md',
}: Readonly<{ title: string; size?: 'sm' | 'md' | 'lg' }>) {
  return (
    <div className={`member-cover ${SIZE_CLASS[size]}`} aria-hidden="true">
      <span>{bookInitials(title)}</span>
    </div>
  );
}

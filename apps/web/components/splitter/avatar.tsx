import { cn } from '@shared/ui';

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const second = parts[1];
  if (!first) return '?';
  if (!second) return first.slice(0, 2).toUpperCase();
  return `${first[0] ?? ''}${second[0] ?? ''}`.toUpperCase();
}

export function Avatar({
  name,
  size = 'md',
  className,
}: Readonly<{ name: string; size?: 'sm' | 'md' | 'lg'; className?: string }>) {
  return (
    <span
      className={cn(
        'splitter-avatar',
        size === 'sm' && 'splitter-avatar-sm',
        size === 'md' && 'splitter-avatar-md',
        size === 'lg' && 'splitter-avatar-lg',
        className,
      )}
      aria-hidden
    >
      {initialsFromName(name)}
    </span>
  );
}

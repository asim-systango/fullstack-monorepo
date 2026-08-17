'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../theme/theme-provider';
import { Button, type ButtonProps } from './button';

export type ThemeToggleProps = Readonly<
  Omit<ButtonProps, 'children' | 'onClick'> & {
    showLabel?: boolean;
  }
>;

export function ThemeToggle({
  showLabel = false,
  variant = 'ghost',
  size = 'sm',
  className,
  ...rest
}: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      className={className}
      {...rest}
    >
      <span className="flex items-center gap-2">
        {isDark ? (
          <Sun className="size-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
        ) : (
          <Moon className="size-4 text-slate-700 transition-transform duration-200 hover:-rotate-12" />
        )}
        {showLabel ? (
          <span className="text-xs font-medium">
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </span>
        ) : null}
      </span>
    </Button>
  );
}

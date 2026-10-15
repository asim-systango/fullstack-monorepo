'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '../cn';

type DropdownContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
};

const DropdownContext = createContext<DropdownContextType | null>(null);

export function DropdownMenu({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <DropdownContext.Provider
      value={{ open, setOpen, toggleOpen: () => setOpen((prev) => !prev) }}
    >
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  className,
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  const ctx = useContext(DropdownContext);
  return (
    <button
      type="button"
      onClick={() => ctx?.toggleOpen()}
      className={cn('inline-flex cursor-pointer items-center', className)}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  children,
  align = 'right',
  className,
}: Readonly<{
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}>) {
  const ctx = useContext(DropdownContext);
  if (!ctx?.open) return null;

  return (
    <div
      className={cn(
        'absolute z-50 mt-2 min-w-48 rounded-lg border border-border bg-card p-1 text-card-foreground shadow-lg backdrop-blur-md transition-all duration-150 animate-in fade-in-0 zoom-in-95',
        align === 'right' ? 'right-0' : 'left-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  onClick,
  disabled = false,
  danger = false,
  className,
}: Readonly<{
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  className?: string;
}>) {
  const ctx = useContext(DropdownContext);

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    ctx?.setOpen(false);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors select-none',
        danger
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-foreground hover:bg-muted hover:text-foreground',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function DropdownMenuLabel({
  children,
  className,
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  return (
    <div
      className={cn(
        'px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({
  className,
}: Readonly<{
  className?: string;
}>) {
  return <div className={cn('-mx-1 my-1 h-px bg-border', className)} />;
}

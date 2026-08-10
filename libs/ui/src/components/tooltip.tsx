'use client';

import { createContext, useContext, useId, useState, type ReactNode } from 'react';
import { cn } from '../cn';

type TooltipContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  tooltipId: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

const TooltipContext = createContext<TooltipContextType | null>(null);

export function Tooltip({
  children,
  _delayMs = 200,
}: Readonly<{
  children: ReactNode;
  _delayMs?: number;
}>) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  const handleMouseEnter = () => {
    setOpen(true);
  };

  const handleMouseLeave = () => {
    setOpen(false);
  };

  return (
    <TooltipContext.Provider
      value={{
        open,
        setOpen,
        tooltipId,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
      }}
    >
      <div className="relative inline-flex items-center">{children}</div>
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({
  children,
  className,
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  const ctx = useContext(TooltipContext);
  return (
    <button
      type="button"
      aria-describedby={ctx?.open ? ctx.tooltipId : undefined}
      className={cn(
        'inline-flex items-center cursor-pointer bg-transparent border-0 p-0 text-inherit font-inherit',
        className,
      )}
      onMouseEnter={ctx?.onMouseEnter}
      onMouseLeave={ctx?.onMouseLeave}
      onFocus={ctx?.onMouseEnter}
      onBlur={ctx?.onMouseLeave}
    >
      {children}
    </button>
  );
}

export function TooltipContent({
  children,
  side = 'top',
  className,
}: Readonly<{
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}>) {
  const ctx = useContext(TooltipContext);
  if (!ctx?.open) return null;

  const sideClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div
      id={ctx.tooltipId}
      role="tooltip"
      className={cn(
        'absolute z-50 whitespace-nowrap rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md transition-all duration-150 animate-in fade-in-0 zoom-in-95 pointer-events-none',
        sideClasses[side],
        className,
      )}
    >
      {children}
    </div>
  );
}

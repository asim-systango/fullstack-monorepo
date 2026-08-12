'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from './cn';

export type DropdownItem = {
  id: string;
  label: string;
  disabled?: boolean;
  onSelect?: () => void;
};

export type DropdownProps = {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'start' | 'end';
  className?: string;
  menuClassName?: string;
  onSelect?: (item: DropdownItem) => void;
};

export function Dropdown({
  trigger,
  items,
  align = 'start',
  className,
  menuClassName,
  onSelect,
}: Readonly<DropdownProps>) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const enabledItems = items.filter((item) => !item.disabled);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') close();
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [close, open]);

  function selectItem(item: DropdownItem) {
    if (item.disabled) return;
    item.onSelect?.();
    onSelect?.(item);
    close();
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(0);
    }
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!open || enabledItems.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % enabledItems.length);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? enabledItems.length - 1 : index - 1));
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const item = enabledItems[activeIndex];
      if (item) selectItem(item);
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  }

  return (
    <div ref={rootRef} className={cn('relative inline-flex', className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={handleTriggerKeyDown}
        className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:ring-offset-2"
      >
        {trigger}
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          tabIndex={-1}
          onKeyDown={handleMenuKeyDown}
          className={cn(
            'absolute top-[calc(100%+0.375rem)] z-50 min-w-44 overflow-hidden rounded-lg border border-border bg-background py-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)]',
            align === 'end' ? 'right-0' : 'left-0',
            menuClassName,
          )}
        >
          {items.map((item) => {
            const enabledIndex = enabledItems.findIndex((entry) => entry.id === item.id);
            const isActive = enabledIndex === activeIndex;

            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onMouseEnter={() => {
                  if (!item.disabled && enabledIndex >= 0) setActiveIndex(enabledIndex);
                }}
                onClick={() => selectItem(item)}
                className={cn(
                  'flex w-full items-center px-3 py-2 text-left text-sm text-foreground transition-colors duration-(--duration-fast) ease-(--ease-standard) disabled:cursor-not-allowed disabled:text-muted-foreground',
                  isActive && 'bg-surface-muted',
                  !item.disabled && !isActive && 'hover:bg-surface-muted',
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

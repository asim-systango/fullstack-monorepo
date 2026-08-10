'use client';

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type DialogHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { X } from 'lucide-react';
import { cn } from '../cn';
import { Button } from './button';

type DialogIds = Readonly<{
  titleId: string;
  descriptionId: string;
  registerDescription: (mounted: boolean) => void;
}>;

const DialogIdsContext = createContext<DialogIds | null>(null);

function useDialogIds(): DialogIds | null {
  return useContext(DialogIdsContext);
}

export type DialogProps = Readonly<
  Omit<DialogHTMLAttributes<HTMLDialogElement>, 'open'> & {
    /** Controlled open state (uses native `showModal` / `close`). */
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Close when clicking outside the panel (default true). */
    closeOnBackdrop?: boolean;
    /** Show a dismiss control in the panel (default true). */
    showClose?: boolean;
    children: ReactNode;
  }
>;

/**
 * Modal dialog via native `<dialog>` + `showModal()`.
 * Escape and focus trap come from the browser.
 * Enhanced with backdrop blur and smooth entrance animations.
 */
export function Dialog({
  open,
  onOpenChange,
  closeOnBackdrop = true,
  showClose = true,
  className,
  children,
  onCancel,
  onClose,
  ...rest
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [hasDescription, setHasDescription] = useState(false);

  const ids = useMemo(
    () => ({
      titleId,
      descriptionId,
      registerDescription: setHasDescription,
    }),
    [titleId, descriptionId],
  );

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (open) {
      if (!node.open) node.showModal();
      return;
    }

    if (node.open) node.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={cn(
        'm-0 max-h-none max-w-none border-0 bg-transparent p-4 text-foreground inset-0 w-full h-full grid place-items-center backdrop:bg-black/60 backdrop:backdrop-blur-md',
        !open && 'hidden',
        className,
      )}
      aria-labelledby={titleId}
      aria-describedby={hasDescription ? descriptionId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onOpenChange?.(false);
        onCancel?.(e);
      }}
      onClose={(e) => {
        if (open) onOpenChange?.(false);
        onClose?.(e);
      }}
      {...rest}
    >
      {closeOnBackdrop ? (
        <button
          type="button"
          className="col-start-1 row-start-1 h-full w-full cursor-default border-0 bg-transparent p-0"
          aria-label="Dismiss dialog"
          tabIndex={-1}
          onClick={() => onOpenChange?.(false)}
        />
      ) : null}
      <div className="col-start-1 row-start-1 relative z-10 w-full max-w-lg rounded-xl border border-border bg-card p-6 text-card-foreground shadow-2xl transition-all animate-in fade-in-0 zoom-in-95">
        {showClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Close"
            onClick={() => onOpenChange?.(false)}
          >
            <X className="size-4" />
          </Button>
        ) : null}
        <DialogIdsContext.Provider value={ids}>{children}</DialogIdsContext.Provider>
      </div>
    </dialog>
  );
}

/** Alias — same as `Dialog` */
export const Modal = Dialog;

type BoxProps = Readonly<HTMLAttributes<HTMLDivElement> & { children?: ReactNode }>;

export function DialogHeader({ children, className, ...rest }: BoxProps) {
  return (
    <div className={cn('mb-4 pr-8 space-y-1.5', className)} {...rest}>
      {children}
    </div>
  );
}

export type DialogTitleProps = Readonly<
  HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }
>;

export function DialogTitle({ children, className, ...rest }: DialogTitleProps) {
  const ids = useDialogIds();
  return (
    <h2
      id={ids?.titleId}
      className={cn(
        'text-lg font-semibold tracking-tight text-card-foreground',
        className,
      )}
      {...rest}
    >
      {children}
    </h2>
  );
}

export type DialogDescriptionProps = Readonly<
  HTMLAttributes<HTMLParagraphElement> & { children: ReactNode }
>;

export function DialogDescription({
  children,
  className,
  ...rest
}: DialogDescriptionProps) {
  const ids = useDialogIds();

  useEffect(() => {
    ids?.registerDescription(true);
    return () => ids?.registerDescription(false);
  }, [ids]);

  return (
    <p
      id={ids?.descriptionId}
      className={cn('text-sm text-muted-foreground', className)}
      {...rest}
    >
      {children}
    </p>
  );
}

export function DialogBody({ children, className, ...rest }: BoxProps) {
  return (
    <div
      className={cn('py-2 text-sm text-card-foreground space-y-4', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function DialogFooter({ children, className, ...rest }: BoxProps) {
  return (
    <div
      className={cn(
        'mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

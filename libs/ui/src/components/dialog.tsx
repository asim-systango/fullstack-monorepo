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
 * Compose with `DialogHeader` / `DialogTitle` / `DialogBody` / `DialogFooter`.
 * `Modal` is an alias of this component.
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
      className={cn('ui-dialog', className)}
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
          className="ui-dialog-backdrop"
          aria-label="Dismiss dialog"
          tabIndex={-1}
          onClick={() => onOpenChange?.(false)}
        />
      ) : null}
      <div className="ui-dialog-panel">
        {showClose ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ui-dialog-close"
            aria-label="Close"
            onClick={() => onOpenChange?.(false)}
          >
            <span aria-hidden="true">×</span>
          </Button>
        ) : null}
        <DialogIdsContext.Provider value={ids}>{children}</DialogIdsContext.Provider>
      </div>
    </dialog>
  );
}

/** Alias — same as `Dialog` (blocking modal via `showModal`). */
export const Modal = Dialog;

type BoxProps = Readonly<HTMLAttributes<HTMLDivElement> & { children?: ReactNode }>;

export function DialogHeader({ children, className, ...rest }: BoxProps) {
  return (
    <div className={cn('ui-dialog-header', className)} {...rest}>
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
    <h2 id={ids?.titleId} className={cn('ui-dialog-title', className)} {...rest}>
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
      className={cn('ui-dialog-description', className)}
      {...rest}
    >
      {children}
    </p>
  );
}

export function DialogBody({ children, className, ...rest }: BoxProps) {
  return (
    <div className={cn('ui-dialog-body', className)} {...rest}>
      {children}
    </div>
  );
}

export function DialogFooter({ children, className, ...rest }: BoxProps) {
  return (
    <div className={cn('ui-dialog-footer', className)} {...rest}>
      {children}
    </div>
  );
}

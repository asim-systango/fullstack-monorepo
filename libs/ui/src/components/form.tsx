import type { FormHTMLAttributes, ReactNode } from 'react';
import { cn } from '../cn';

export type FormProps = Readonly<
  FormHTMLAttributes<HTMLFormElement> & {
    /** Marks the form busy (aria-busy). Disable controls / use Button `loading` while true. */
    pending?: boolean;
    children: ReactNode;
  }
>;

/**
 * Thin form wrapper for pending/submit flows.
 * Pair with `Button loading={pending}` and `disabled={pending}` on fields.
 */
export function Form({ pending = false, className, children, ...rest }: FormProps) {
  return (
    <form
      className={cn('ui-form', pending && 'ui-form-pending', className)}
      aria-busy={pending || undefined}
      {...rest}
    >
      {children}
    </form>
  );
}

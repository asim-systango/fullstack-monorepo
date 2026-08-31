import { forwardRef, type LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className, required = false, children, ...props },
  ref,
) {
  return (
    <label
      ref={ref}
      className={cn('block text-sm font-semibold text-primary', className)}
      {...props}
    >
      {children}
      {required ? (
        <span className="ml-0.5 text-danger" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
});

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid = false, rows = 4, id, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      id={id}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full resize-y rounded-md border bg-surface px-3 py-2 text-sm text-primary',
        'placeholder:text-tertiary',
        'focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand',
        'disabled:cursor-not-allowed disabled:bg-surface-hover disabled:opacity-60',
        invalid ? 'border-danger' : 'border-border-strong hover:border-primary',
        className,
      )}
      {...props}
    />
  );
});

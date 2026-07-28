import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../cn';

export type AlertTone = 'neutral' | 'info' | 'success' | 'danger';

export type AlertProps = Readonly<
  HTMLAttributes<HTMLElement> & {
    tone?: AlertTone;
    title?: string;
    children?: ReactNode;
  }
>;

/**
 * Prefer native semantics: `<output>` implies status; danger uses `role="alert"`
 * (no HTML equivalent for assertive alerts).
 */
export function Alert({
  tone = 'neutral',
  title,
  children,
  className,
  ...rest
}: AlertProps) {
  const classes = cn(
    'ui-alert',
    tone === 'neutral' && 'ui-alert-neutral',
    tone === 'info' && 'ui-alert-info',
    tone === 'success' && 'ui-alert-success',
    tone === 'danger' && 'ui-alert-danger',
    className,
  );

  const body = (
    <>
      {title ? <p className="ui-alert-title">{title}</p> : null}
      {children ? <div className="ui-alert-body">{children}</div> : null}
    </>
  );

  if (tone === 'danger') {
    return (
      <div className={classes} role="alert" {...rest}>
        {body}
      </div>
    );
  }

  return (
    <output className={classes} {...rest}>
      {body}
    </output>
  );
}

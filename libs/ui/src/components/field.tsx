import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '../cn';

export type FieldProps = Readonly<{
  label: string;
  htmlFor?: string;
  /** Default `name` on the control when the child does not set one. */
  name?: string;
  hint?: string;
  error?: string;
  /** Shows a required marker on the label. */
  required?: boolean;
  /** Shows an “(optional)” hint on the label. */
  optional?: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}>;

function resolveDescribedBy(
  error: string | undefined,
  hint: string | undefined,
  errorId: string | undefined,
  hintId: string | undefined,
): string | undefined {
  if (error) return errorId;
  if (hint) return hintId;
  return undefined;
}

type EnhanceOpts = Readonly<{
  htmlFor?: string;
  name?: string;
  required: boolean;
  disabled: boolean;
  error?: string;
  describedBy?: string;
}>;

function enhanceFieldControl(child: ReactNode, opts: EnhanceOpts): ReactNode {
  let result: ReactNode = child;
  if (isValidElement(child)) {
    const el = child as ReactElement<Record<string, unknown>>;
    result = cloneElement(el, {
      id: el.props.id ?? opts.htmlFor,
      name: el.props.name ?? opts.name,
      required: el.props.required ?? opts.required,
      disabled: el.props.disabled ?? opts.disabled,
      invalid: el.props.invalid ?? Boolean(opts.error),
      'aria-describedby':
        (el.props['aria-describedby'] as string | undefined) ?? opts.describedBy,
    });
  }
  return result;
}

type FieldLabelProps = Readonly<{
  label: string;
  htmlFor?: string;
  required: boolean;
  showOptional: boolean;
}>;

function FieldLabel({ label, htmlFor, required, showOptional }: FieldLabelProps) {
  return (
    <label className="ui-field-label" htmlFor={htmlFor}>
      {label}
      {required ? (
        <span className="ui-field-required" aria-hidden>
          *
        </span>
      ) : null}
      {showOptional ? <span className="ui-field-optional">(optional)</span> : null}
    </label>
  );
}

type FieldMessagesProps = Readonly<{
  hint?: string;
  error?: string;
  hintId?: string;
  errorId?: string;
  showHint: boolean;
}>;

function FieldMessages({ hint, error, hintId, errorId, showHint }: FieldMessagesProps) {
  return (
    <>
      {showHint ? (
        <p id={hintId} className="ui-field-hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="ui-field-error" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}

export function Field({
  label,
  htmlFor,
  name,
  hint,
  error,
  required = false,
  optional = false,
  disabled = false,
  children,
  className,
}: FieldProps) {
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined;
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  const describedBy = resolveDescribedBy(error, hint, errorId, hintId);

  const control = Children.map(children, (child) =>
    enhanceFieldControl(child, {
      htmlFor,
      name,
      required,
      disabled,
      error,
      describedBy,
    }),
  );

  return (
    <div
      className={cn('ui-field', disabled && 'ui-field-disabled', className)}
      data-invalid={error ? 'true' : undefined}
      data-required={required ? 'true' : undefined}
    >
      <FieldLabel
        label={label}
        htmlFor={htmlFor}
        required={required}
        showOptional={optional && !required}
      />
      {control}
      <FieldMessages
        hint={hint}
        error={error}
        hintId={hintId}
        errorId={errorId}
        showHint={Boolean(hint) && !error}
      />
    </div>
  );
}

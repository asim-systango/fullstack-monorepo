import type { ReactNode } from 'react';

type AuthInputGroupProps = Readonly<{
  label: string;
  htmlFor: string;
  icon: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
}>;

export function AuthInputGroup({
  label,
  htmlFor,
  icon,
  trailing,
  children,
}: AuthInputGroupProps) {
  return (
    <div className="splitter-auth-field">
      <label className="splitter-auth-field-label" htmlFor={htmlFor}>
        {label}
      </label>
      <div className="splitter-auth-input-shell">
        <span className="splitter-auth-input-icon" aria-hidden>
          {icon}
        </span>
        {children}
        {trailing ? (
          <span className="splitter-auth-input-trailing">{trailing}</span>
        ) : null}
      </div>
    </div>
  );
}

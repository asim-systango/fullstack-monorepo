import type { ReactNode } from 'react';

export function MemberContent({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <div className={className ? `member-content ${className}` : 'member-content'}>
      {children}
    </div>
  );
}

export function MemberPageHeader({
  title,
  description,
  action,
}: Readonly<{
  title: string;
  description?: string;
  action?: ReactNode;
}>) {
  return (
    <header className="member-page-header member-enter">
      <div>
        <h1 className="member-page-title">{title}</h1>
        {description ? <p className="member-page-desc">{description}</p> : null}
      </div>
      {action}
    </header>
  );
}

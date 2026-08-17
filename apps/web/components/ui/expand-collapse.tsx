'use client';

import type { CSSProperties, ReactNode } from 'react';

type ExpandCollapseProps = Readonly<{
  open: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}>;

export function ExpandCollapse({ open, children, className, style }: ExpandCollapseProps) {
  return (
    <div
      className={['tg-expand', open ? 'is-open' : '', className].filter(Boolean).join(' ')}
      style={style}
      aria-hidden={!open}
      inert={!open}
    >
      <div className="tg-expand-inner">{children}</div>
    </div>
  );
}

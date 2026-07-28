import type { HTMLAttributes } from 'react';
import { cn } from '../cn';

export type SeparatorProps = Readonly<HTMLAttributes<HTMLHRElement>>;

export function Separator({ className, ...rest }: SeparatorProps) {
  return <hr className={cn('ui-separator', className)} {...rest} />;
}

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../cn';

export type MetricCardTone = 'default' | 'warn' | 'ok' | 'policy';

export type MetricCardProps = Readonly<
  HTMLAttributes<HTMLDivElement> & {
    label: string;
    value: ReactNode;
    hint?: ReactNode;
    tone?: MetricCardTone;
  }
>;

export function MetricCard({
  label,
  value,
  hint,
  tone = 'default',
  className,
  ...rest
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'ui-metric',
        tone === 'warn' && 'ui-metric-warn',
        tone === 'ok' && 'ui-metric-ok',
        tone === 'policy' && 'ui-metric-policy',
        className,
      )}
      {...rest}
    >
      <p className="ui-metric-label">{label}</p>
      <p className="ui-metric-value">{value}</p>
      {hint != null ? <p className="ui-metric-hint">{hint}</p> : null}
    </div>
  );
}

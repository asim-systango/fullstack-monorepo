'use client';

import { Card, CardBody } from '@shared/ui/components';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
}

export function StatCard(props: Readonly<StatCardProps>) {
  const { title, value, subtitle, icon, trend, trendType = 'positive' } = props;
  let trendColor = 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
  if (trendType === 'negative') {
    trendColor = 'text-rose-600 bg-rose-500/10 border-rose-500/20';
  } else if (trendType === 'neutral') {
    trendColor = 'text-muted-foreground bg-secondary border-border/50';
  }

  return (
    <Card className="border border-border/60 bg-card shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-md">
      <CardBody className="flex flex-col justify-between p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-muted-foreground truncate">
            {title}
          </span>
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              {icon}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-2xl font-extrabold tracking-tight text-foreground">
              {value}
            </span>
            {trend && (
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${trendColor}`}
              >
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground font-medium">{subtitle}</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

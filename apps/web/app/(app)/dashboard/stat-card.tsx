import type { LucideIcon } from 'lucide-react';
import { Card, CardBody } from '@shared/ui/components';

export type StatCardProps = Readonly<{
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
}>;

export function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardBody className="flex items-start justify-start gap-3">
        <div className="inline-flex size-15 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="m-0 text-sm text-muted-foreground">{title}</p>
          <p className="m-0 mt-1 text-3xl font-semibold text-foreground">{value}</p>
          {description ? (
            <p className="m-0 mt-1 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}

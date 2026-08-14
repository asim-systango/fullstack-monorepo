'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@shared/ui/components';

export function StatCard({
  label,
  value,
}: Readonly<{ label: string; value: string | number }>) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

import Link from 'next/link';
import { Button, Card } from '@shared/ui/components';

export function SectionPlaceholder({
  title,
  description,
}: Readonly<{ title: string; description: string }>) {
  return (
    <Card className="splitter-shadow mx-auto max-w-xl space-y-4 p-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Link href="/groups" className="inline-flex no-underline hover:no-underline">
        <Button type="button">Go to groups</Button>
      </Link>
    </Card>
  );
}

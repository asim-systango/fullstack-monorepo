import { EmptyState } from '@shared/ui/components';

export function AdminEmptyState({
  title,
  description,
}: Readonly<{ title: string; description: string }>) {
  return <EmptyState className="admin-empty" title={title} description={description} />;
}

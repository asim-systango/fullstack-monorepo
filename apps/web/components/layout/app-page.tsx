import type { ReactNode } from 'react';
import { Page, PageHeader } from '@shared/ui/components';

type AppPageProps = Readonly<{
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}>;

// Page is max-w-3xl by default, our tables need more room
export function AppPage({ title, description, actions, children }: AppPageProps) {
  return (
    <Page className="max-w-6xl pt-0">
      <PageHeader title={title} description={description} actions={actions} />
      {children}
    </Page>
  );
}

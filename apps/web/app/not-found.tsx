import { EmptyState, Page } from '@shared/ui/components';
import { ButtonLink } from '@/components/layout';

export default function NotFound() {
  return (
    <Page>
      <EmptyState
        title="Page not found"
        description="The link may be wrong, or the page has moved."
        action={<ButtonLink href="/">Go to my home page</ButtonLink>}
      />
    </Page>
  );
}

import { Alert } from '@shared/ui/components';
import { ROLE_HOME, ROLE_LABEL, type Role } from '@/lib/auth/routing';
import { AppPage } from './app-page';
import { ButtonLink } from './button-link';

export function AccessDenied({ role }: Readonly<{ role: Role }>) {
  return (
    <AppPage title="Access denied">
      <Alert tone="danger" title="You can't open this page">
        <p className="m-0">
          {`You're signed in as ${ROLE_LABEL[role].toLowerCase()}, and this page is for another role.`}
        </p>
        <ButtonLink href={ROLE_HOME[role]} size="sm" variant="secondary" className="mt-3">
          Go to my home page
        </ButtonLink>
      </Alert>
    </AppPage>
  );
}

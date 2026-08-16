'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PageShell } from '@/components/layout/page-shell';
import { Alert, Button, Card, CardBody, Field, Input } from '@/components/ui';
import { changePassword } from '@/lib/api/auth-api';
import { getErrorMessage } from '@/lib/api/errors';
import { FEATURES, homePathForRole, requiresPasswordChange } from '@/lib/auth/session';
import { useAuthStore } from '@/lib/store';

export default function ChangePasswordPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrateFromMe = useAuthStore((s) => s.hydrateFromMe);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => changePassword({ currentPassword, newPassword }),
    onSuccess: async () => {
      setSuccess('Password updated.');
      setFormError(null);
      const me = await hydrateFromMe();
      if (me && !requiresPasswordChange(me)) {
        router.replace(homePathForRole(me.role));
      }
    },
    onError: (error) => setFormError(getErrorMessage(error)),
  });

  function onSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    setFormError(null);
    setSuccess(null);
    mutation.mutate();
  }

  return (
    <PageShell
      title="Change password"
      description="Required when your account is flagged mustChangePassword / requires_password_change."
    >
      <Card className="max-w-md">
        <CardBody>
          {!FEATURES.changePassword ? (
            <Alert tone="warning" title="Backend endpoint pending">
              POST /auth/change-password is not in the gateway yet. Enable with
              NEXT_PUBLIC_ENABLE_CHANGE_PASSWORD=true once it ships. The form below is
              ready.
            </Alert>
          ) : null}
          <form className="mt-4 flex flex-col gap-4" onSubmit={onSubmit}>
            {formError ? (
              <Alert tone="danger" title="Update failed">
                {formError}
              </Alert>
            ) : null}
            {success ? (
              <Alert tone="success" title="Done">
                {success}
              </Alert>
            ) : null}
            <Field label="Current password" required>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              )}
            </Field>
            <Field label="New password" required>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                />
              )}
            </Field>
            <Button type="submit" fullWidth loading={mutation.isPending}>
              Update password
            </Button>
            {user && !requiresPasswordChange(user) ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push(homePathForRole(user.role))}
              >
                Skip for now
              </Button>
            ) : null}
          </form>
        </CardBody>
      </Card>
    </PageShell>
  );
}

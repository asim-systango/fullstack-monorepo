'use client';

import { useState, type SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Form, PageHeader, StatusMessage } from '@shared/ui/components';
import { PasswordField, useAuth, useAuthForm } from '@/components/auth';
import { useChangePassword } from '@/lib/auth/hooks';
import { ROUTES } from '@/lib/auth/routes';
import { changePasswordSchema, PASSWORD_HINT } from '@/lib/validation/auth';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const forced = Boolean(user?.mustChangePassword);
  const changePassword = useChangePassword();
  const { pending, error, fieldErrors, submit } = useAuthForm();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    await submit({
      schema: changePasswordSchema,
      values: { currentPassword, newPassword, confirmPassword },
      onValid: async (values) => {
        await changePassword.mutateAsync({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        try {
          await logout();
        } catch {
          /* session already cleared by the API */
        }
        router.replace(ROUTES.login);
        router.refresh();
      },
    });
  }

  return (
    <div className="member-content">
      <div className="max-w-md">
        <PageHeader
        title="Change password"
        description={
          forced
            ? 'Set a new password, then sign in again with it to use BOOKLY.'
            : 'Choose a new password. You will be signed out and asked to log in again.'
        }
      />
      <Form pending={pending} onSubmit={onSubmit}>
        <Field
          label="Current password"
          htmlFor="current-password"
          required
          disabled={pending}
          error={fieldErrors.currentPassword}
        >
          <PasswordField
            id="current-password"
            name="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
        </Field>
        <Field
          label="New password"
          htmlFor="new-password"
          required
          hint={PASSWORD_HINT}
          disabled={pending}
          error={fieldErrors.newPassword}
        >
          <PasswordField
            id="new-password"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
          />
        </Field>
        <Field
          label="Confirm new password"
          htmlFor="confirm-new-password"
          required
          disabled={pending}
          error={fieldErrors.confirmPassword}
        >
          <PasswordField
            id="confirm-new-password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
          />
        </Field>
        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        <Button type="submit" loading={pending} loadingText="Saving…">
          Update password
        </Button>
      </Form>
      </div>
    </div>
  );
}

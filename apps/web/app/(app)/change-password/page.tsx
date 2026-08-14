'use client';

import { useState, type SyntheticEvent } from 'react';
import { Button, Field, Form, PageHeader, StatusMessage } from '@shared/ui/components';
import { PasswordField, useAuthForm } from '@/components/auth';
import { useChangePassword } from '@/lib/auth/hooks';
import { changePasswordSchema, PASSWORD_HINT } from '@/lib/validation/auth';

export default function ChangePasswordPage() {
  const changePassword = useChangePassword();
  const { pending, error, fieldErrors, submit } = useAuthForm();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(null);
    const ok = await submit({
      schema: changePasswordSchema,
      values: { currentPassword, newPassword, confirmPassword },
      onValid: async (values) => {
        await changePassword.mutateAsync({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccess('Password updated.');
      },
    });
    if (!ok) setSuccess(null);
  }

  return (
    <div className="mx-auto max-w-md">
      <PageHeader
        title="Change password"
        description="Choose a new password. You will stay signed in."
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
        {success ? <StatusMessage tone="success">{success}</StatusMessage> : null}
        <Button type="submit" loading={pending} loadingText="Saving…">
          Update password
        </Button>
      </Form>
    </div>
  );
}

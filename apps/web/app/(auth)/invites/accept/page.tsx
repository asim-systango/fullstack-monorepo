'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Alert, Button, Spinner, StatusMessage } from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { AuthLayout } from '@/components/splitter';
import { useAuth } from '@/components/auth';
import { splitterApi } from '@/lib/api';
import { rememberReturnPath, safeReturnPath } from '@/lib/return-url';

function AcceptInviteContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const token = params.get('token');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const acceptedRef = useRef(false);

  const returnUrl = `/invites/accept?token=${encodeURIComponent(token ?? '')}`;
  const [preview, setPreview] = useState<{
    groupName: string;
    inviteeEmail: string;
    hasAccount: boolean;
    status: string;
  } | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setPreviewLoading(true);
    splitterApi
      .previewInvite(token)
      .then((data) => {
        if (cancelled) return;
        setPreview(data);
        setPreviewError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setPreviewError(
          err instanceof ApiClientError
            ? err.message
            : 'This invite link is invalid or expired.',
        );
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function accept() {
    if (!token || acceptedRef.current) return;
    acceptedRef.current = true;
    setPending(true);
    setError(null);
    try {
      const group = await splitterApi.acceptInviteByToken(token);
      router.replace(`/groups/${group.id}`);
    } catch (err) {
      acceptedRef.current = false;
      setError(err instanceof ApiClientError ? err.message : 'Could not accept invite');
      setPending(false);
    }
  }

  useEffect(() => {
    if (!user || !token || !preview || preview.status !== 'pending') return;
    void accept();
  }, [user, token, preview]);

  if (!token) {
    return (
      <AuthLayout title="Invite">
        <StatusMessage tone="error">This invite link is missing a token.</StatusMessage>
      </AuthLayout>
    );
  }

  if (loading || previewLoading) {
    return (
      <AuthLayout title="Invite">
        <Spinner label="Loading" />
      </AuthLayout>
    );
  }

  if (previewError || !preview) {
    return (
      <AuthLayout title="Invite">
        <StatusMessage tone="error">{previewError ?? 'Invite not found.'}</StatusMessage>
        <Link href={safeReturnPath('/groups')} className="mt-4 inline-block text-sm">
          Go to groups
        </Link>
      </AuthLayout>
    );
  }

  if (preview.status !== 'pending') {
    return (
      <AuthLayout title="Invite" subtitle={preview.groupName}>
        <Alert tone="info">This invite is no longer pending.</Alert>
        <Link href={safeReturnPath('/groups')} className="mt-6 inline-block">
          <Button>Go to groups</Button>
        </Link>
      </AuthLayout>
    );
  }

  if (!user) {
    const loginHref = `/login?returnUrl=${encodeURIComponent(returnUrl)}&email=${encodeURIComponent(preview.inviteeEmail)}`;
    const registerHref = `/register?returnUrl=${encodeURIComponent(returnUrl)}&email=${encodeURIComponent(preview.inviteeEmail)}`;

    return (
      <AuthLayout
        title={`Join ${preview.groupName}`}
        subtitle={
          preview.hasAccount
            ? 'Log in to accept this invite'
            : 'Create an account to accept this invite'
        }
      >
        <Alert tone="info">
          {preview.hasAccount
            ? `This invite was sent to ${preview.inviteeEmail}. Log in with that email to join the group.`
            : `This invite was sent to ${preview.inviteeEmail}. Create an account with that email, then you’ll be taken into the group.`}
        </Alert>
        <div className="mt-6 flex flex-wrap gap-2">
          {preview.hasAccount ? (
            <>
              <Link href={loginHref} onClick={() => rememberReturnPath(returnUrl)}>
                <Button>Log in</Button>
              </Link>
              <Link href={registerHref} onClick={() => rememberReturnPath(returnUrl)}>
                <Button variant="secondary">Create account instead</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href={registerHref} onClick={() => rememberReturnPath(returnUrl)}>
                <Button>Create account</Button>
              </Link>
              <Link href={loginHref} onClick={() => rememberReturnPath(returnUrl)}>
                <Button variant="secondary">I already have an account</Button>
              </Link>
            </>
          )}
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={`Join ${preview.groupName}`} subtitle="Adding you to the group…">
      {error ? (
        <>
          <StatusMessage tone="error">{error}</StatusMessage>
          <Button className="mt-4" loading={pending} onClick={() => void accept()}>
            Try again
          </Button>
        </>
      ) : (
        <Spinner label="Joining group" />
      )}
    </AuthLayout>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<Spinner label="Loading" />}>
      <AcceptInviteContent />
    </Suspense>
  );
}

'use client';

import { Suspense } from 'react';
import { LoadingState, Page } from '@shared/ui/components';
import { AuthLayout, LoginForm, ShellHeader } from '@/components/auth';

export default function LoginPage() {
  return (
    <Page>
      <ShellHeader title="Auction House" subtitle="Sign in to your account" />
      <AuthLayout
        headline="Every Bid Brings You Closer to Winning."
        description="Sign in to discover exciting auctions, place bids, and keep track of your favorite items."
      >
        <Suspense fallback={<LoadingState label="Loading…" />}>
          <LoginForm />
        </Suspense>
      </AuthLayout>
    </Page>
  );
}

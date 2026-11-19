'use client';

import { useRouter } from 'next/navigation';
import { Page, PageHeader } from '@shared/ui/components';
import { RequireAuth, ShellHeader } from '@/components/auth';
import { AuctionForm } from '@/components/auctions';
import { auctionsApi } from '@/lib/api';

function NewAuctionPage() {
  const router = useRouter();

  return (
    <Page>
      <ShellHeader title="New auction" subtitle="List an item for sale" />
      <PageHeader
        title="Create auction"
        description="Title, category, starting price, increment, and end time are required."
      />
      <AuctionForm
        submitLabel="Create auction"
        onSubmit={async (input) => {
          const auction = await auctionsApi.create(input);
          router.push(`/auctions/${auction.id}`);
        }}
      />
    </Page>
  );
}

export default function NewAuctionRoute() {
  return (
    <RequireAuth roles={['staff']}>
      <NewAuctionPage />
    </RequireAuth>
  );
}

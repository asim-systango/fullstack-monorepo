'use client';

import { BrowseCategories } from './browse-categories';
import { HowItWorks } from './how-it-works';
import { AuctionSection } from './auction-section';
import { useHomeAuctions } from './use-home-auctions';

/** Shared open-auctions Query drives Featured, Ending Soon, and Recently Added. */
export function HomeMarketplace() {
  const { query, featured, endingSoon, recentlyAdded, notifyExpired } = useHomeAuctions();

  return (
    <div className="mt-10 space-y-12">
      <AuctionSection
        id="featured-auctions"
        title="Featured Auctions"
        description="Active lots worth a look — browse open auctions and place your bid."
        auctions={featured}
        query={query}
        onCountdownEnded={notifyExpired}
      />

      <AuctionSection
        id="ending-soon"
        title="Ending Soon"
        description="These auctions close first — don’t miss the final moments."
        auctions={endingSoon}
        query={query}
        onCountdownEnded={notifyExpired}
      />

      <BrowseCategories />

      <HowItWorks />

      <AuctionSection
        id="recently-added"
        title="Recently Added"
        description="Fresh listings just added to the marketplace."
        auctions={recentlyAdded}
        query={query}
        onCountdownEnded={notifyExpired}
      />
    </div>
  );
}

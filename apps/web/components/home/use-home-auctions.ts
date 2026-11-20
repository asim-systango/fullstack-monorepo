'use client';

import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auctionsApi, auctionQueryKeys } from '@/lib/api';
import { HOME_OPEN_AUCTIONS_PARAMS, HOME_SECTION_LIMIT } from '@/lib/home-queries';
import { isAuctionEnded } from '@/lib/auction-utils';

export function useHomeAuctions() {
  const [nowMs, setNowMs] = useState(() => Date.now());

  const query = useQuery({
    queryKey: auctionQueryKeys.list(HOME_OPEN_AUCTIONS_PARAMS),
    queryFn: () => auctionsApi.list(HOME_OPEN_AUCTIONS_PARAMS),
  });

  const openItems = useMemo(() => {
    const now = new Date(nowMs);
    const items = query.data?.items ?? [];
    return items.filter(
      (auction) => auction.status === 'open' && !isAuctionEnded(auction.endsAt, now),
    );
  }, [query.data?.items, nowMs]);

  const featured = useMemo(() => openItems.slice(0, HOME_SECTION_LIMIT), [openItems]);

  const endingSoon = useMemo(() => {
    return [...openItems]
      .sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime())
      .slice(0, HOME_SECTION_LIMIT);
  }, [openItems]);

  const recentlyAdded = useMemo(() => {
    return [...openItems]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, HOME_SECTION_LIMIT);
  }, [openItems]);

  const notifyExpired = useCallback(() => {
    setNowMs(Date.now());
  }, []);

  return {
    query,
    featured,
    endingSoon,
    recentlyAdded,
    notifyExpired,
  };
}

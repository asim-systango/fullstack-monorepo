'use client';

import { useEffect, useRef, useState } from 'react';
import { formatRemainingTime, isAuctionEnded } from '@/lib/auction-utils';

export function AuctionCountdown({
  endsAt,
  className,
  onEnded,
}: Readonly<{
  endsAt: string;
  className?: string;
  onEnded?: () => void;
}>) {
  const [now, setNow] = useState(() => new Date());
  const endedNotified = useRef(false);
  const ended = isAuctionEnded(endsAt, now);

  useEffect(() => {
    endedNotified.current = false;
  }, [endsAt]);

  useEffect(() => {
    if (ended) {
      if (!endedNotified.current) {
        endedNotified.current = true;
        onEnded?.();
      }
      return;
    }

    const id = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(id);
  }, [endsAt, ended, onEnded]);

  return (
    <span className={className} aria-live="polite">
      {formatRemainingTime(endsAt, now)}
    </span>
  );
}

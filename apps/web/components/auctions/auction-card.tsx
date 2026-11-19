'use client';

import Link from 'next/link';
import {
  Badge,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/components';
import type { Auction } from '@/lib/schemas/auction';
import {
  categoryLabel,
  formatMoney,
  isAuctionEnded,
  statusBadgeTone,
} from '@/lib/auction-utils';
import { AuctionCountdown } from './auction-countdown';
import { WatchButton } from './watch-button';

function CategoryPlaceholder({ category }: Readonly<{ category: string }>) {
  const initial = category.trim().charAt(0).toUpperCase() || 'A';
  return (
    <div
      className="flex aspect-[4/3] w-full items-center justify-center bg-muted text-muted-foreground"
      aria-hidden
    >
      <div className="text-center">
        <span className="block text-3xl font-semibold tracking-tight text-foreground/70">
          {initial}
        </span>
        <span className="mt-1 block text-xs uppercase tracking-wide">
          {categoryLabel(category)}
        </span>
      </div>
    </div>
  );
}

export function AuctionCard({
  auction,
  showCountdown = true,
  onCountdownEnded,
}: Readonly<{
  auction: Auction;
  showCountdown?: boolean;
  onCountdownEnded?: () => void;
}>) {
  const ended = isAuctionEnded(auction.endsAt);

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CategoryPlaceholder category={auction.category} />
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-base">
            <Link href={`/auctions/${auction.id}`} className="hover:underline">
              {auction.title}
            </Link>
          </CardTitle>
          <Badge tone={statusBadgeTone(auction.status)}>{auction.status}</Badge>
        </div>
        <CardDescription className="capitalize">
          {categoryLabel(auction.category)}
        </CardDescription>
      </CardHeader>
      <CardBody className="flex flex-1 flex-col gap-2 text-sm">
        <p>
          <span className="text-muted-foreground">Starting </span>
          <span className="font-medium">{formatMoney(auction.startingPrice)}</span>
        </p>
        <p>
          <span className="text-muted-foreground">Current bid </span>
          <span className="font-medium">{formatMoney(auction.currentPrice)}</span>
        </p>
        <p className="text-muted-foreground">
          {showCountdown && auction.status === 'open' ? (
            <>
              Time left{' '}
              <AuctionCountdown
                endsAt={auction.endsAt}
                className={
                  ended
                    ? 'font-medium text-muted-foreground'
                    : 'font-medium text-foreground'
                }
                onEnded={onCountdownEnded}
              />
            </>
          ) : (
            <>
              Ends{' '}
              {new Intl.DateTimeFormat('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(new Date(auction.endsAt))}
            </>
          )}
        </p>

        <div className="mt-auto flex flex-col gap-2 pt-3">
          <WatchButton auctionId={auction.id} compact />
          <Link
            href={`/auctions/${auction.id}`}
            className="ui-button ui-button-sm ui-button-secondary no-underline hover:no-underline"
          >
            View Details
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}

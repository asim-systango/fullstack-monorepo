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
import { formatEndsAt, formatMoney, statusBadgeTone } from '@/lib/auction-utils';

export function AuctionCard({ auction }: Readonly<{ auction: Auction }>) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">
            <Link href={`/auctions/${auction.id}`} className="hover:underline">
              {auction.title}
            </Link>
          </CardTitle>
          <Badge tone={statusBadgeTone(auction.status)}>{auction.status}</Badge>
        </div>
        <CardDescription className="capitalize">{auction.category}</CardDescription>
      </CardHeader>
      <CardBody className="space-y-2 text-sm">
        <p>
          <span className="text-muted-foreground">Current </span>
          <span className="font-medium">{formatMoney(auction.currentPrice)}</span>
        </p>
        <p className="text-muted-foreground">Ends {formatEndsAt(auction.endsAt)}</p>
      </CardBody>
    </Card>
  );
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from '../bids/bids.entity';
import { User } from '../users/user.entity';
import { Watchlist } from '../watchlist/watchlist.entity';
import { AuctionExpiryService } from './auction-expiry.service';
import { Auction } from './auctions.entity';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Auction, User, Bid, Watchlist])],
  controllers: [AuctionsController],
  providers: [AuctionsService, AuctionExpiryService],
  exports: [AuctionsService],
})
export class AuctionsModule {}

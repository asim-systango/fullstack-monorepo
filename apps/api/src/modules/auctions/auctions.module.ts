import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from '../bids/bids.entity';
import { User } from '../users/user.entity';
import { AuctionExpiryService } from './auction-expiry.service';
import { Auction } from './auctions.entity';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Auction, User, Bid])],
  controllers: [AuctionsController],
  providers: [AuctionsService, AuctionExpiryService],
  exports: [AuctionsService],
})
export class AuctionsModule {}

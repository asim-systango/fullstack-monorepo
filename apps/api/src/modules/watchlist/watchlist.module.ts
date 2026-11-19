import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../auctions/auctions.entity';
import { AuctionWatchController, MyWatchlistController } from './watchlist.controller';
import { Watchlist } from './watchlist.entity';
import { WatchlistService } from './watchlist.service';

@Module({
  imports: [TypeOrmModule.forFeature([Watchlist, Auction])],
  controllers: [AuctionWatchController, MyWatchlistController],
  providers: [WatchlistService],
  exports: [WatchlistService],
})
export class WatchlistModule {}

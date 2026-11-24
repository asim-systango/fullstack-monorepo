import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../auctions/auctions.entity';
import { Bid } from './bids.entity';
import { BidsController, MyBidsController } from './bids.controller';
import { BidsService } from './bids.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bid, Auction])],
  controllers: [BidsController, MyBidsController],
  providers: [BidsService],
  exports: [BidsService],
})
export class BidsModule {}

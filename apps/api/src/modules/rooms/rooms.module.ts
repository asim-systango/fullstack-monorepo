import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { Booking } from '../bookings/booking.entity';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { HotelsModule } from '../hotels/hotels.module';

@Module({
  imports: [TypeOrmModule.forFeature([Room, Booking]), HotelsModule],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}

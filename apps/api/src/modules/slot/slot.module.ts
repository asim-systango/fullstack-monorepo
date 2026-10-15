import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Slot } from './entities/slot.entity';
import { SlotRepository } from './repositories/slot.repository';
import { SlotService } from './slot.service';
import { SlotController } from './slot.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Slot])],
  controllers: [SlotController],
  providers: [SlotRepository, SlotService],
  exports: [SlotRepository, SlotService],
})
export class SlotModule {}

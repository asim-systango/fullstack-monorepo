import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slot } from './entities/slot.entity';

/**
 * Slot service — business logic shell.
 * CRUD and validation will be added on Day 2.
 * Slot management (create/block/unblock) on Day 4.
 */
@Injectable()
export class SlotService {
  private readonly logger = new Logger(SlotService.name);

  constructor(
    @InjectRepository(Slot)
    private readonly slotRepository: Repository<Slot>,
  ) {
    this.logger.log('SlotService initialized');
  }
}

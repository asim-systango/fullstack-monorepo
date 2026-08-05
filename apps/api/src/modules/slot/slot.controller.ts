import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SlotService } from './slot.service';

/**
 * Slot controller — REST endpoint shell.
 * Endpoints will be added on Day 2.
 */
@ApiTags('Slots')
@Controller('slots')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}
}

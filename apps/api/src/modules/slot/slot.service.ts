import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SlotRepository } from './repositories/slot.repository';
import { Slot } from './entities/slot.entity';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { SlotStatus } from '../../shared/enums/slot-status.enum';

@Injectable()
export class SlotService {
  private readonly logger = new Logger(SlotService.name);

  constructor(private readonly slotRepository: SlotRepository) {}

  async findAll(query?: {
    doctorId?: string;
    status?: SlotStatus;
    startDate?: string;
    endDate?: string;
  }): Promise<Slot[]> {
    return this.slotRepository.findAll({
      doctorId: query?.doctorId,
      status: query?.status,
      startDate: query?.startDate ? new Date(query.startDate) : undefined,
      endDate: query?.endDate ? new Date(query.endDate) : undefined,
    });
  }

  async findOne(id: string): Promise<Slot> {
    const slot = await this.slotRepository.findById(id);
    if (!slot) {
      throw new NotFoundException(`Slot with ID "${id}" not found`);
    }
    return slot;
  }

  async create(dto: CreateSlotDto): Promise<Slot> {
    const startsAt = new Date(dto.startsAt);
    const endsAt = dto.endsAt
      ? new Date(dto.endsAt)
      : new Date(startsAt.getTime() + 30 * 60 * 1000);

    if (startsAt >= endsAt) {
      throw new BadRequestException('Slot start time must be before end time');
    }

    this.logger.log(
      `Creating slot for doctor ${dto.doctorId} from ${startsAt.toISOString()} to ${endsAt.toISOString()}`,
    );
    return this.slotRepository.create({
      doctorId: dto.doctorId,
      startsAt,
      endsAt,
      status: SlotStatus.AVAILABLE,
    });
  }

  async update(id: string, dto: UpdateSlotDto): Promise<Slot> {
    await this.findOne(id);
    const updated = await this.slotRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Slot with ID "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);
    await this.slotRepository.delete(id);
    return { success: true, message: `Slot "${id}" deleted successfully` };
  }
}

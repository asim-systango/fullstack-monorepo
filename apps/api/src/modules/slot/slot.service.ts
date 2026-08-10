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

  async findAvailableForDoctor(doctorId: string): Promise<Slot[]> {
    return this.slotRepository.findAvailableByDoctorId(doctorId);
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

    if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime())) {
      throw new BadRequestException('Invalid start or end date format');
    }

    if (startsAt >= endsAt) {
      throw new BadRequestException('Slot start time must be before end time');
    }

    if (startsAt.getTime() <= Date.now()) {
      throw new BadRequestException('Slot start time must be in the future');
    }

    const durationMinutes = (endsAt.getTime() - startsAt.getTime()) / (1000 * 60);
    if (durationMinutes !== 30) {
      throw new BadRequestException(
        `Consultation slot duration must be exactly 30 minutes (got ${durationMinutes} mins)`,
      );
    }

    // Check for overlapping slots
    const overlap = await this.slotRepository.findOverlappingSlot(
      dto.doctorId,
      startsAt,
      endsAt,
    );
    if (overlap) {
      throw new BadRequestException(
        `Doctor already has an overlapping slot scheduled between ${overlap.startsAt.toISOString()} and ${overlap.endsAt.toISOString()}`,
      );
    }

    this.logger.log(
      `[SLOT_CREATED] Doctor: ${dto.doctorId}, Time: ${startsAt.toISOString()} - ${endsAt.toISOString()}`,
    );
    return this.slotRepository.create({
      doctorId: dto.doctorId,
      startsAt,
      endsAt,
      status: SlotStatus.AVAILABLE,
    });
  }

  async update(id: string, dto: UpdateSlotDto): Promise<Slot> {
    const existing = await this.findOne(id);
    if (
      dto.status &&
      existing.status === SlotStatus.BOOKED &&
      dto.status !== SlotStatus.BOOKED
    ) {
      throw new BadRequestException(
        'Cannot manually change status of a booked slot without cancelling the appointment',
      );
    }

    this.logger.log(`[SLOT_UPDATED] Slot: ${id}, New Status: ${dto.status}`);
    const updated = await this.slotRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Slot with ID "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const slot = await this.findOne(id);
    if (slot.status === SlotStatus.BOOKED) {
      throw new BadRequestException('Cannot delete a slot that is currently booked');
    }

    this.logger.log(`[SLOT_DELETED] Slot: ${id}`);
    await this.slotRepository.delete(id);
    return { success: true, message: `Slot "${id}" deleted successfully` };
  }
}

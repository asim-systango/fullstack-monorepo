import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SlotRepository } from './repositories/slot.repository';
import { Slot } from './entities/slot.entity';
import { BulkCreateSlotDto } from './dto/bulk-create-slot.dto';
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

  async createBulk(dto: BulkCreateSlotDto): Promise<Slot[]> {
    const duration = dto.slotDurationMinutes || 30;
    const startDateStr = (dto.date ?? '').split('T')[0];
    const endDateStr = (dto.endDate || dto.date || '').split('T')[0];

    const startDate = new Date(`${startDateStr}T00:00:00`);
    const endDate = new Date(`${endDateStr}T00:00:00`);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid start or end date format');
    }

    if (startDate > endDate) {
      throw new BadRequestException('Start date must be on or before end date');
    }

    const createdSlots: Slot[] = [];
    const activeDays =
      dto.daysOfWeek && dto.daysOfWeek.length > 0 ? dto.daysOfWeek : null;

    const generateSlotsForWindow = async (
      dateStr: string,
      sTime: string,
      eTime: string,
    ) => {
      const cleanSTime = sTime.slice(0, 5);
      const cleanETime = eTime.slice(0, 5);
      const windowStart = new Date(`${dateStr}T${cleanSTime}:00`);
      const windowEnd = new Date(`${dateStr}T${cleanETime}:00`);

      if (isNaN(windowStart.getTime()) || isNaN(windowEnd.getTime())) return;
      if (windowStart >= windowEnd) return;

      let currentStart = new Date(windowStart);
      while (currentStart.getTime() + duration * 60 * 1000 <= windowEnd.getTime()) {
        const currentEnd = new Date(currentStart.getTime() + duration * 60 * 1000);

        if (currentStart.getTime() > Date.now()) {
          const overlap = await this.slotRepository.findOverlappingSlot(
            dto.doctorId,
            currentStart,
            currentEnd,
          );

          if (!overlap) {
            const slot = await this.slotRepository.create({
              doctorId: dto.doctorId,
              startsAt: currentStart,
              endsAt: currentEnd,
              status: SlotStatus.AVAILABLE,
            });
            createdSlots.push(slot);
          }
        }

        currentStart = currentEnd;
      }
    };

    // Collect all shift windows (dynamic array or legacy fallback)
    const shiftWindows: Array<{ startTime: string; endTime: string }> = [];

    if (dto.shifts && dto.shifts.length > 0) {
      dto.shifts.forEach((s) => {
        if (s.startTime && s.endTime) {
          shiftWindows.push({ startTime: s.startTime, endTime: s.endTime });
        }
      });
    } else {
      if (dto.startTime && dto.endTime) {
        shiftWindows.push({ startTime: dto.startTime, endTime: dto.endTime });
      }
      if (dto.shift2StartTime && dto.shift2EndTime) {
        shiftWindows.push({ startTime: dto.shift2StartTime, endTime: dto.shift2EndTime });
      }
    }

    if (shiftWindows.length === 0) {
      throw new BadRequestException('At least one shift window must be provided');
    }

    const currDate = new Date(startDate);
    while (currDate <= endDate) {
      const dayOfWeek = currDate.getDay();
      if (!activeDays || activeDays.includes(dayOfWeek)) {
        const year = currDate.getFullYear();
        const month = String(currDate.getMonth() + 1).padStart(2, '0');
        const day = String(currDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        for (const shift of shiftWindows) {
          await generateSlotsForWindow(dateStr, shift.startTime, shift.endTime);
        }
      }
      currDate.setDate(currDate.getDate() + 1);
    }

    this.logger.log(
      `[BULK_SLOTS_CREATED] Doctor: ${dto.doctorId}, Created: ${createdSlots.length} slots between ${startDateStr} and ${endDateStr}`,
    );

    return createdSlots;
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

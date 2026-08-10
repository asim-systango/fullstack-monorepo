import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentRepository } from './repositories/appointment.repository';
import { SlotRepository } from '../slot/repositories/slot.repository';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus } from '../../shared/enums/appointment-status.enum';
import { SlotStatus } from '../../shared/enums/slot-status.enum';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);

  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly slotRepository: SlotRepository,
  ) {}

  async findAll(query?: {
    patientId?: string;
    doctorId?: string;
    status?: AppointmentStatus;
  }): Promise<Appointment[]> {
    return this.appointmentRepository.findAll(query);
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID "${id}" not found`);
    }
    return appointment;
  }

  async create(patientId: string, dto: CreateAppointmentDto): Promise<Appointment> {
    const slot = await this.slotRepository.findById(dto.slotId);
    if (!slot) {
      throw new NotFoundException(`Slot with ID "${dto.slotId}" not found`);
    }

    if (slot.status !== SlotStatus.AVAILABLE) {
      throw new BadRequestException(`Slot "${dto.slotId}" is not available for booking`);
    }

    // Check if slot already has an active appointment
    const existing = await this.appointmentRepository.findBySlotId(dto.slotId);
    if (existing && existing.status === AppointmentStatus.SCHEDULED) {
      throw new BadRequestException(`Slot "${dto.slotId}" is already booked`);
    }

    // Update slot status to BOOKED
    await this.slotRepository.update(slot.id, { status: SlotStatus.BOOKED });

    this.logger.log(`Booking appointment for patient ${patientId} on slot ${dto.slotId}`);
    return this.appointmentRepository.create({
      patientId,
      slotId: dto.slotId,
      reason: dto.reason ?? null,
      status: AppointmentStatus.SCHEDULED,
    });
  }

  async update(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);

    if (dto.status === AppointmentStatus.CANCELLED && appointment.slotId) {
      await this.slotRepository.update(appointment.slotId, {
        status: SlotStatus.AVAILABLE,
      });
    }

    const updated = await this.appointmentRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Appointment with ID "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const appointment = await this.findOne(id);
    if (appointment.slotId) {
      await this.slotRepository.update(appointment.slotId, {
        status: SlotStatus.AVAILABLE,
      });
    }

    await this.appointmentRepository.update(id, { status: AppointmentStatus.CANCELLED });
    await this.appointmentRepository.softDelete(id);
    return { success: true, message: `Appointment "${id}" cancelled and soft-deleted` };
  }
}

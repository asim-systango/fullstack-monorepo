import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppointmentRepository } from './repositories/appointment.repository';
import { Appointment } from './entities/appointment.entity';
import { Slot } from '../slot/entities/slot.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus } from '../../shared/enums/appointment-status.enum';
import { SlotStatus } from '../../shared/enums/slot-status.enum';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);

  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async findAll(query?: {
    patientId?: string;
    doctorId?: string;
    status?: AppointmentStatus;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
    sort?: 'createdAt' | 'startsAt';
  }): Promise<{ items: Appointment[]; total: number; page: number; limit: number }> {
    return this.appointmentRepository.findAll(query);
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID "${id}" not found`);
    }
    return appointment;
  }

  /**
   * Transactional appointment booking with Pessimistic Write Locking (SELECT FOR UPDATE).
   * Guarantees zero double-booking under high concurrency.
   */
  async create(patientId: string, dto: CreateAppointmentDto): Promise<Appointment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock target slot with pessimistic_write
      const slot = await queryRunner.manager.findOne(Slot, {
        where: { id: dto.slotId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!slot) {
        throw new NotFoundException(`Slot with ID "${dto.slotId}" not found`);
      }

      if (slot.status === SlotStatus.BOOKED) {
        throw new ConflictException(
          `Slot "${dto.slotId}" is already booked by another patient`,
        );
      }

      if (slot.status === SlotStatus.BLOCKED) {
        throw new ConflictException(
          `Slot "${dto.slotId}" is currently blocked by doctor`,
        );
      }

      if (slot.status !== SlotStatus.AVAILABLE) {
        throw new ConflictException(`Slot "${dto.slotId}" is not available for booking`);
      }

      if (new Date(slot.startsAt).getTime() <= Date.now()) {
        throw new BadRequestException('Cannot book a consultation slot in the past');
      }

      // Update slot status to BOOKED
      slot.status = SlotStatus.BOOKED;
      await queryRunner.manager.save(Slot, slot);

      // Create appointment entity
      const appointment = queryRunner.manager.create(Appointment, {
        patientId,
        slotId: dto.slotId,
        reason: dto.reason ?? null,
        status: AppointmentStatus.SCHEDULED,
      });
      const savedAppointment = await queryRunner.manager.save(Appointment, appointment);

      await queryRunner.commitTransaction();

      this.logger.log(
        `[BOOKING_SUCCESS] Patient ${patientId} successfully booked slot ${dto.slotId}. Appointment ID: ${savedAppointment.id}`,
      );

      return (await this.appointmentRepository.findById(savedAppointment.id))!;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `[BOOKING_FAILURE] Failed to book slot ${dto.slotId} for patient ${patientId}: ${(err as Error).message}`,
      );
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
    await this.findOne(id);
    const updated = await this.appointmentRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Appointment with ID "${id}" not found`);
    }
    return updated;
  }

  /**
   * Transactional appointment cancellation & soft delete.
   * Enforces patient ownership or admin role privileges.
   */
  async remove(
    id: string,
    currentUserId?: string,
    userRole?: string,
  ): Promise<{ success: boolean; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const appointment = await queryRunner.manager.findOne(Appointment, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!appointment) {
        throw new NotFoundException(`Appointment with ID "${id}" not found`);
      }

      // Enforce ownership: Patient can only cancel their own appointment unless Admin
      if (
        currentUserId &&
        userRole !== 'ADMIN' &&
        appointment.patientId !== currentUserId
      ) {
        throw new ForbiddenException('Patients can only cancel their own appointments');
      }

      if (appointment.status === AppointmentStatus.CANCELLED) {
        throw new BadRequestException('Appointment is already cancelled');
      }

      if (appointment.status === AppointmentStatus.COMPLETED) {
        throw new BadRequestException('Cannot cancel a completed appointment');
      }

      // Update appointment status & soft delete
      appointment.status = AppointmentStatus.CANCELLED;
      appointment.deletedAt = new Date();
      await queryRunner.manager.save(Appointment, appointment);

      // Free linked slot
      if (appointment.slotId) {
        const slot = await queryRunner.manager.findOne(Slot, {
          where: { id: appointment.slotId },
          lock: { mode: 'pessimistic_write' },
        });
        if (slot) {
          slot.status = SlotStatus.AVAILABLE;
          await queryRunner.manager.save(Slot, slot);
        }
      }

      await queryRunner.commitTransaction();

      this.logger.log(
        `[CANCELLATION_SUCCESS] Appointment ${id} cancelled by user ${currentUserId ?? 'system'}`,
      );

      return { success: true, message: `Appointment "${id}" cancelled and slot freed` };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `[CANCELLATION_FAILURE] Failed to cancel appointment ${id}: ${(err as Error).message}`,
      );
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}

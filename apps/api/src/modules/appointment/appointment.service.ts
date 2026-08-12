import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  AppointmentRepository,
  PaginatedAppointmentsResult,
} from './repositories/appointment.repository';
import { Appointment } from './entities/appointment.entity';
import { Slot } from '../slot/entities/slot.entity';
import { DoctorService } from '../doctor/doctor.service';
import { Prescription } from '../prescription/entities/prescription.entity';
import { MedicalNote } from '../medical-note/entities/medical-note.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { CompleteAppointmentDto } from './dto/complete-appointment.dto';
import { GetAppointmentsQueryDto } from './dto/get-appointments-query.dto';
import { AppointmentStatus } from '../../shared/enums/appointment-status.enum';
import { SlotStatus } from '../../shared/enums/slot-status.enum';
import { JwtUser } from '../../common/auth';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);

  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly doctorService: DoctorService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  /**
   * List appointments with strict role scoping, hospital-wide search, and filters.
   * - PATIENTS see ONLY their own appointments.
   * - DOCTORS see ONLY appointments for their own slots.
   * - ADMINS can view and search hospital-wide.
   */
  async findAll(
    user?: JwtUser,
    query?: GetAppointmentsQueryDto,
  ): Promise<PaginatedAppointmentsResult> {
    if (!user) {
      throw new UnauthorizedException('Authentication required to access appointments');
    }

    if (query?.dateFrom && query?.dateTo) {
      const from = new Date(query.dateFrom);
      const to = new Date(query.dateTo);
      if (from > to) {
        throw new BadRequestException('dateFrom cannot be greater than dateTo');
      }
    }

    const options = {
      ...query,
      q: query?.search || query?.q,
    };

    if (user.role === 'PATIENT') {
      options.patientId = user.id;
    } else if (user.role === 'DOCTOR') {
      const doctor = await this.doctorService.findByUserId(user.id);
      if (doctor) {
        options.doctorId = doctor.id;
      } else {
        return {
          items: [],
          meta: {
            page: options.page ?? 1,
            limit: options.limit ?? 10,
            totalItems: 0,
            totalPages: 0,
          },
        };
      }
    }

    const result = await this.appointmentRepository.findAll(options);

    // Patients cannot access internal medical history notes
    if (user.role === 'PATIENT') {
      result.items = result.items.map((item) => {
        item.medicalNotes = [];
        return item;
      });
    }

    return result;
  }

  /**
   * Admin-only hospital-wide appointments search and filter.
   */
  async findAdminAppointments(
    user?: JwtUser,
    query?: GetAppointmentsQueryDto,
  ): Promise<PaginatedAppointmentsResult> {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required for hospital-wide search');
    }

    this.logger.log(
      `[ADMIN_SEARCH] Admin ${user.id} performing hospital-wide appointment query`,
    );
    return this.findAll(user, query);
  }

  /**
   * Retrieve appointment details by ID with role-based ownership validation.
   */
  async findOne(id: string, user?: JwtUser): Promise<Appointment> {
    if (!user) {
      throw new UnauthorizedException(
        'Authentication required to access appointment details',
      );
    }

    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID "${id}" not found`);
    }

    if (user.role === 'PATIENT') {
      if (appointment.patientId !== user.id) {
        throw new ForbiddenException(
          'Access denied: Patients can only view their own appointments',
        );
      }
      appointment.medicalNotes = [];
    } else if (user.role === 'DOCTOR') {
      const doctor = await this.doctorService.findByUserId(user.id);
      if (!doctor || appointment.slot?.doctorId !== doctor.id) {
        throw new ForbiddenException(
          'Access denied: Doctors can only view appointments for their own slots',
        );
      }
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

      slot.status = SlotStatus.BOOKED;
      await queryRunner.manager.save(Slot, slot);

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

  /**
   * Transactional appointment completion workflow.
   * Marks appointment as COMPLETED and attaches optional prescription and clinical medical note.
   */
  async complete(
    id: string,
    user: JwtUser,
    dto?: CompleteAppointmentDto,
  ): Promise<Appointment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const appointment = await queryRunner.manager.findOne(Appointment, {
        where: { id },
        relations: ['slot'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!appointment) {
        throw new NotFoundException(`Appointment with ID "${id}" not found`);
      }

      if (appointment.status === AppointmentStatus.CANCELLED) {
        throw new BadRequestException('Cannot complete a cancelled appointment');
      }

      if (appointment.status === AppointmentStatus.COMPLETED) {
        throw new BadRequestException('Appointment is already completed');
      }

      let doctorIdForNote: string | undefined;

      if (user.role === 'DOCTOR') {
        const doctor = await this.doctorService.findByUserId(user.id);
        if (!doctor || appointment.slot?.doctorId !== doctor.id) {
          throw new ForbiddenException(
            'Doctors can only mark their own appointments as completed',
          );
        }
        doctorIdForNote = doctor.id;
      } else if (user.role === 'ADMIN') {
        doctorIdForNote = appointment.slot?.doctorId;
      } else {
        throw new ForbiddenException('Patients cannot complete appointments');
      }

      appointment.status = AppointmentStatus.COMPLETED;
      await queryRunner.manager.save(Appointment, appointment);

      if (dto?.prescription?.medicines && dto.prescription.medicines.length > 0) {
        const prescription = queryRunner.manager.create(Prescription, {
          appointmentId: id,
          medicines: dto.prescription.medicines as unknown as Record<string, unknown>[],
          instructions: dto.prescription.instructions ?? null,
        });
        await queryRunner.manager.save(Prescription, prescription);
      }

      if (dto?.medicalNote?.notes && doctorIdForNote) {
        const medicalNote = queryRunner.manager.create(MedicalNote, {
          appointmentId: id,
          doctorId: doctorIdForNote,
          notes: dto.medicalNote.notes,
        });
        await queryRunner.manager.save(MedicalNote, medicalNote);
      }

      await queryRunner.commitTransaction();

      this.logger.log(
        `[COMPLETION_SUCCESS] Appointment ${id} completed by user ${user.id}`,
      );

      return (await this.appointmentRepository.findById(id))!;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `[COMPLETION_FAILURE] Failed to complete appointment ${id}: ${(err as Error).message}`,
      );
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: string,
    dto: UpdateAppointmentDto,
    user?: JwtUser,
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID "${id}" not found`);
    }

    if (user) {
      if (user.role === 'DOCTOR') {
        const doctor = await this.doctorService.findByUserId(user.id);
        if (!doctor || appointment.slot?.doctorId !== doctor.id) {
          throw new ForbiddenException(
            'Access denied: Doctors can only update appointments assigned to their slots',
          );
        }
      } else if (user.role !== 'ADMIN') {
        throw new ForbiddenException('Only doctors and admins can update appointments');
      }
    }

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

      appointment.status = AppointmentStatus.CANCELLED;
      appointment.deletedAt = new Date();
      await queryRunner.manager.save(Appointment, appointment);

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

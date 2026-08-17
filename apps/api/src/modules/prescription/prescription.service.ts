import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrescriptionRepository } from './repositories/prescription.repository';
import { Prescription } from './entities/prescription.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { AppointmentRepository } from '../appointment/repositories/appointment.repository';
import { DoctorService } from '../doctor/doctor.service';
import { AppointmentStatus } from '../../shared/enums/appointment-status.enum';
import { JwtUser } from '../../common/auth';

@Injectable()
export class PrescriptionService {
  private readonly logger = new Logger(PrescriptionService.name);

  constructor(
    private readonly prescriptionRepository: PrescriptionRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly doctorService: DoctorService,
  ) {}

  async findAll(): Promise<Prescription[]> {
    return this.prescriptionRepository.findAll();
  }

  async findOne(id: string, user?: JwtUser): Promise<Prescription> {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const prescription = await this.prescriptionRepository.findById(id);
    if (!prescription) {
      throw new NotFoundException(`Prescription with ID "${id}" not found`);
    }

    if (prescription.appointmentId) {
      const appointment = await this.appointmentRepository.findById(
        prescription.appointmentId,
      );
      if (appointment) {
        if (user.role === 'PATIENT' && appointment.patientId !== user.id) {
          throw new ForbiddenException(
            'Access denied: Patients can only view prescriptions for their own appointments',
          );
        }
        if (user.role === 'DOCTOR') {
          const doctor = await this.doctorService.findByUserId(user.id);
          if (!doctor || appointment.slot?.doctorId !== doctor.id) {
            throw new ForbiddenException(
              'Access denied: Doctors can only view prescriptions for their own appointments',
            );
          }
        }
      }
    }

    return prescription;
  }

  async findByAppointmentId(
    appointmentId: string,
    user?: JwtUser,
  ): Promise<Prescription | null> {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID "${appointmentId}" not found`);
    }

    if (user.role === 'PATIENT' && appointment.patientId !== user.id) {
      throw new ForbiddenException(
        'Access denied: Patients can only view prescriptions for their own appointments',
      );
    }

    if (user.role === 'DOCTOR') {
      const doctor = await this.doctorService.findByUserId(user.id);
      if (!doctor || appointment.slot?.doctorId !== doctor.id) {
        throw new ForbiddenException(
          'Access denied: Doctors can only view prescriptions for their own appointments',
        );
      }
    }

    return this.prescriptionRepository.findByAppointmentId(appointmentId);
  }

  async createForAppointment(
    appointmentId: string,
    dto: CreatePrescriptionDto,
    user: JwtUser,
  ): Promise<Prescription> {
    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID "${appointmentId}" not found`);
    }

    if (appointment.status !== AppointmentStatus.COMPLETED) {
      throw new BadRequestException(
        'Prescriptions can only be created for completed appointments',
      );
    }

    if (user.role === 'DOCTOR') {
      const doctor = await this.doctorService.findByUserId(user.id);
      if (!doctor || appointment.slot?.doctorId !== doctor.id) {
        throw new ForbiddenException(
          'Doctors can only create prescriptions for their own appointments',
        );
      }
    } else if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Patients cannot create prescriptions');
    }

    const existing = await this.prescriptionRepository.findByAppointmentId(appointmentId);
    if (existing) {
      throw new ConflictException('A prescription already exists for this appointment');
    }

    const prescription = await this.prescriptionRepository.create({
      appointmentId,
      medicines: dto.medicines as unknown as Record<string, unknown>[],
      instructions: dto.instructions ?? null,
    });

    this.logger.log(
      `[PRESCRIPTION_CREATED] Prescription ${prescription.id} created for appointment ${appointmentId} by user ${user.id}`,
    );
    return prescription;
  }

  async update(
    id: string,
    dto: UpdatePrescriptionDto,
    user?: JwtUser,
  ): Promise<Prescription> {
    await this.findOne(id, user);
    const updated = await this.prescriptionRepository.update(
      id,
      dto as unknown as Partial<Prescription>,
    );
    if (!updated) {
      throw new NotFoundException(`Prescription with ID "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const prescription = await this.prescriptionRepository.findById(id);
    if (!prescription) {
      throw new NotFoundException(`Prescription with ID "${id}" not found`);
    }
    await this.prescriptionRepository.delete(id);
    return { success: true, message: `Prescription "${id}" deleted successfully` };
  }
}

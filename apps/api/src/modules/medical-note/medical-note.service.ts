import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MedicalNoteRepository } from './repositories/medical-note.repository';
import { MedicalNote } from './entities/medical-note.entity';
import { CreateMedicalNoteDto } from './dto/create-medical-note.dto';
import { UpdateMedicalNoteDto } from './dto/update-medical-note.dto';
import { AppointmentRepository } from '../appointment/repositories/appointment.repository';
import { DoctorService } from '../doctor/doctor.service';
import { JwtUser } from '../../common/auth';

@Injectable()
export class MedicalNoteService {
  private readonly logger = new Logger(MedicalNoteService.name);

  constructor(
    private readonly medicalNoteRepository: MedicalNoteRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly doctorService: DoctorService,
  ) {}

  async findAll(options?: {
    appointmentId?: string;
    doctorId?: string;
  }): Promise<MedicalNote[]> {
    return this.medicalNoteRepository.findAll(options);
  }

  async findOne(id: string, user?: JwtUser): Promise<MedicalNote> {
    if (user?.role === 'PATIENT') {
      throw new ForbiddenException('Patients cannot access internal clinical notes');
    }

    const note = await this.medicalNoteRepository.findById(id);
    if (!note) {
      throw new NotFoundException(`Medical note with ID "${id}" not found`);
    }

    if (user?.role === 'DOCTOR') {
      const doctor = await this.doctorService.findByUserId(user.id);
      if (!doctor || note.doctorId !== doctor.id) {
        throw new ForbiddenException(
          'Doctors can only view clinical notes for their own patients',
        );
      }
    }

    return note;
  }

  async findByAppointmentId(
    appointmentId: string,
    user?: JwtUser,
  ): Promise<MedicalNote[]> {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (user.role === 'PATIENT') {
      throw new ForbiddenException('Patients cannot access internal clinical notes');
    }

    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID "${appointmentId}" not found`);
    }

    if (user.role === 'DOCTOR') {
      const doctor = await this.doctorService.findByUserId(user.id);
      if (!doctor || appointment.slot?.doctorId !== doctor.id) {
        throw new ForbiddenException(
          'Doctors can only view clinical notes for their own appointments',
        );
      }
    }

    return this.medicalNoteRepository.findAll({ appointmentId });
  }

  async findPatientHistory(
    user: JwtUser,
  ): Promise<{ appointmentId: string; summary: string; createdAt: Date }[]> {
    // Patients do not see raw internal doctor notes, only high-level sanitized summaries
    this.logger.log(
      `[PATIENT_NOTES_VIEW] Patient ${user.id} requested patient-visible history`,
    );
    return [];
  }

  async createForAppointment(
    appointmentId: string,
    dto: CreateMedicalNoteDto,
    user: JwtUser,
  ): Promise<MedicalNote> {
    if (user.role !== 'DOCTOR' && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only doctors and admins can create clinical medical notes',
      );
    }

    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID "${appointmentId}" not found`);
    }

    let doctorId: string;
    if (user.role === 'DOCTOR') {
      const doctor = await this.doctorService.findByUserId(user.id);
      if (!doctor || appointment.slot?.doctorId !== doctor.id) {
        throw new ForbiddenException(
          'Doctors can only create clinical notes for their own appointments',
        );
      }
      doctorId = doctor.id;
    } else {
      if (!appointment.slot?.doctorId) {
        throw new NotFoundException('Doctor profile not found for this appointment slot');
      }
      doctorId = appointment.slot.doctorId;
    }

    const note = await this.medicalNoteRepository.create({
      appointmentId,
      doctorId,
      notes: dto.notes,
    });

    this.logger.log(
      `[MEDICAL_NOTE_CREATED] Medical note ${note.id} recorded for appointment ${appointmentId} by doctor ${doctorId}`,
    );
    return note;
  }

  async create(dto: CreateMedicalNoteDto): Promise<MedicalNote> {
    return this.medicalNoteRepository.create({
      appointmentId: dto.appointmentId,
      doctorId: dto.doctorId,
      notes: dto.notes,
    });
  }

  async update(
    id: string,
    dto: UpdateMedicalNoteDto,
    user?: JwtUser,
  ): Promise<MedicalNote> {
    await this.findOne(id, user);
    const updated = await this.medicalNoteRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Medical note with ID "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    await this.medicalNoteRepository.delete(id);
    return { success: true, message: `Medical note "${id}" deleted successfully` };
  }
}

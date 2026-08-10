import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentStatus } from '../../../shared/enums/appointment-status.enum';

@Injectable()
export class AppointmentRepository {
  constructor(
    @InjectRepository(Appointment)
    private readonly repo: Repository<Appointment>,
  ) {}

  async findAll(options?: {
    patientId?: string;
    doctorId?: string;
    status?: AppointmentStatus;
  }): Promise<Appointment[]> {
    const query = this.repo
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.slot', 'slot')
      .leftJoinAndSelect('slot.doctor', 'doctor')
      .leftJoinAndSelect('appointment.prescription', 'prescription')
      .leftJoinAndSelect('appointment.medicalNotes', 'medicalNotes');

    if (options?.patientId) {
      query.andWhere('appointment.patientId = :patientId', {
        patientId: options.patientId,
      });
    }

    if (options?.doctorId) {
      query.andWhere('slot.doctorId = :doctorId', { doctorId: options.doctorId });
    }

    if (options?.status) {
      query.andWhere('appointment.status = :status', { status: options.status });
    }

    query.orderBy('slot.startsAt', 'DESC');
    return query.getMany();
  }

  async findById(id: string): Promise<Appointment | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['slot', 'slot.doctor', 'prescription', 'medicalNotes'],
    });
  }

  async findBySlotId(slotId: string): Promise<Appointment | null> {
    return this.repo.findOne({
      where: { slotId },
      relations: ['slot'],
    });
  }

  async create(data: Partial<Appointment>): Promise<Appointment> {
    const appointment = this.repo.create(data);
    return this.repo.save(appointment);
  }

  async update(id: string, data: Partial<Appointment>): Promise<Appointment | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    Object.assign(existing, data);
    return this.repo.save(existing);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repo.softDelete(id);
    return (result.affected ?? 0) > 0;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from '../entities/prescription.entity';

@Injectable()
export class PrescriptionRepository {
  constructor(
    @InjectRepository(Prescription)
    private readonly repo: Repository<Prescription>,
  ) {}

  async findAll(): Promise<Prescription[]> {
    return this.repo.find({
      relations: ['appointment', 'appointment.slot', 'appointment.slot.doctor'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Prescription | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['appointment', 'appointment.slot', 'appointment.slot.doctor'],
    });
  }

  async findByAppointmentId(appointmentId: string): Promise<Prescription | null> {
    return this.repo.findOne({
      where: { appointmentId },
      relations: ['appointment'],
    });
  }

  async create(data: Partial<Prescription>): Promise<Prescription> {
    const prescription = this.repo.create(data);
    return this.repo.save(prescription);
  }

  async update(id: string, data: Partial<Prescription>): Promise<Prescription | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    Object.assign(existing, data);
    return this.repo.save(existing);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

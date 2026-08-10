import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalNote } from '../entities/medical-note.entity';

@Injectable()
export class MedicalNoteRepository {
  constructor(
    @InjectRepository(MedicalNote)
    private readonly repo: Repository<MedicalNote>,
  ) {}

  async findAll(options?: {
    appointmentId?: string;
    doctorId?: string;
  }): Promise<MedicalNote[]> {
    const query = this.repo
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.appointment', 'appointment')
      .leftJoinAndSelect('note.doctor', 'doctor');

    if (options?.appointmentId) {
      query.andWhere('note.appointmentId = :appointmentId', {
        appointmentId: options.appointmentId,
      });
    }

    if (options?.doctorId) {
      query.andWhere('note.doctorId = :doctorId', { doctorId: options.doctorId });
    }

    query.orderBy('note.createdAt', 'DESC');
    return query.getMany();
  }

  async findById(id: string): Promise<MedicalNote | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['appointment', 'doctor'],
    });
  }

  async create(data: Partial<MedicalNote>): Promise<MedicalNote> {
    const note = this.repo.create(data);
    return this.repo.save(note);
  }

  async update(id: string, data: Partial<MedicalNote>): Promise<MedicalNote | null> {
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

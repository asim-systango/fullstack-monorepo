import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorProfile } from '../entities/doctor-profile.entity';

@Injectable()
export class DoctorRepository {
  constructor(
    @InjectRepository(DoctorProfile)
    private readonly repo: Repository<DoctorProfile>,
  ) {}

  async findAll(options?: {
    specialization?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<DoctorProfile[]> {
    const query = this.repo.createQueryBuilder('doctor');

    if (options?.specialization) {
      query.andWhere('doctor.specialization ILIKE :specialization', {
        specialization: `%${options.specialization}%`,
      });
    }

    if (options?.isActive !== undefined) {
      query.andWhere('doctor.isActive = :isActive', { isActive: options.isActive });
    }

    if (options?.search) {
      query.andWhere(
        '(doctor.firstName ILIKE :search OR doctor.lastName ILIKE :search OR doctor.specialization ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    query.orderBy('doctor.createdAt', 'DESC');
    return query.getMany();
  }

  async findById(id: string): Promise<DoctorProfile | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['slots'],
    });
  }

  async findByUserId(userId: string): Promise<DoctorProfile | null> {
    return this.repo.findOne({ where: { userId } });
  }

  async create(data: Partial<DoctorProfile>): Promise<DoctorProfile> {
    const doctor = this.repo.create(data);
    return this.repo.save(doctor);
  }

  async update(id: string, data: Partial<DoctorProfile>): Promise<DoctorProfile | null> {
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

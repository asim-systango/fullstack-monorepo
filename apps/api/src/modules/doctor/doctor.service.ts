import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DoctorRepository } from './repositories/doctor.repository';
import { DoctorProfile } from './entities/doctor-profile.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorService {
  private readonly logger = new Logger(DoctorService.name);

  constructor(private readonly doctorRepository: DoctorRepository) {}

  async findAll(query?: {
    specialization?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<DoctorProfile[]> {
    return this.doctorRepository.findAll(query);
  }

  async findOne(id: string): Promise<DoctorProfile> {
    const doctor = await this.doctorRepository.findById(id);
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID "${id}" not found`);
    }
    return doctor;
  }

  async findByUserId(userId: string): Promise<DoctorProfile | null> {
    return this.doctorRepository.findByUserId(userId);
  }

  async create(dto: CreateDoctorDto): Promise<DoctorProfile> {
    this.logger.log(`Creating doctor profile for user ${dto.userId}`);
    return this.doctorRepository.create(dto);
  }

  async update(id: string, dto: UpdateDoctorDto): Promise<DoctorProfile> {
    await this.findOne(id); // Throws if not found
    const updated = await this.doctorRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Doctor with ID "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);
    await this.doctorRepository.softDelete(id);
    return { success: true, message: `Doctor profile "${id}" soft-deleted` };
  }
}

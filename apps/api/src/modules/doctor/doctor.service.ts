import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DoctorRepository } from './repositories/doctor.repository';
import { DoctorProfile } from './entities/doctor-profile.entity';
import { Slot } from '../slot/entities/slot.entity';
import { SlotStatus } from '../../shared/enums/slot-status.enum';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorService {
  private readonly logger = new Logger(DoctorService.name);

  constructor(
    private readonly doctorRepository: DoctorRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

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

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.softDelete(DoctorProfile, id);
      await queryRunner.manager.update(DoctorProfile, { id }, { isActive: false });

      await queryRunner.manager
        .createQueryBuilder()
        .update(Slot)
        .set({ status: SlotStatus.BLOCKED })
        .where('"doctorId" = :doctorId', { doctorId: id })
        .andWhere('status = :status', { status: SlotStatus.AVAILABLE })
        .andWhere('starts_at > :now', { now: new Date() })
        .execute();

      await queryRunner.commitTransaction();

      this.logger.log(
        `[DOCTOR_SOFT_DELETE] Doctor profile "${id}" soft-deleted and future available slots deactivated.`,
      );

      return {
        success: true,
        message: `Doctor profile "${id}" soft-deleted and future slots deactivated`,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `[DOCTOR_SOFT_DELETE_ERROR] Failed to soft-delete doctor "${id}": ${(err as Error).message}`,
      );
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}

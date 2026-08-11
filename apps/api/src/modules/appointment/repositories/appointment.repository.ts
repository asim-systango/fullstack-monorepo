import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentStatus } from '../../../shared/enums/appointment-status.enum';

export interface FindAllAppointmentOptions {
  patientId?: string;
  doctorId?: string;
  status?: AppointmentStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: 'startsAt' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedAppointmentsResult {
  items: Appointment[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

@Injectable()
export class AppointmentRepository {
  constructor(
    @InjectRepository(Appointment)
    private readonly repo: Repository<Appointment>,
  ) {}

  async findAll(
    options?: FindAllAppointmentOptions,
  ): Promise<PaginatedAppointmentsResult> {
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

    if (options?.dateFrom) {
      query.andWhere('slot.startsAt >= :dateFrom', {
        dateFrom: new Date(options.dateFrom),
      });
    }

    if (options?.dateTo) {
      query.andWhere('slot.startsAt <= :dateTo', {
        dateTo: new Date(options.dateTo),
      });
    }

    const searchTermRaw = (options?.search || options?.q || '').trim();
    if (searchTermRaw.length > 0) {
      const searchTerm = `%${searchTermRaw}%`;
      query.andWhere(
        new Brackets((qb) => {
          qb.where('doctor.firstName ILIKE :search', { search: searchTerm })
            .orWhere('doctor.lastName ILIKE :search', { search: searchTerm })
            .orWhere('doctor.specialization ILIKE :search', { search: searchTerm })
            .orWhere('appointment.reason ILIKE :search', { search: searchTerm })
            .orWhere('appointment.patientId = :exactSearch', {
              search: searchTerm,
              exactSearch: searchTermRaw,
            });
        }),
      );
    }

    const sortOrder = options?.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    if (options?.sortBy === 'createdAt') {
      query.orderBy('appointment.createdAt', sortOrder);
    } else {
      query.orderBy('slot.startsAt', sortOrder);
    }

    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(100, Math.max(1, options?.limit ?? 10));
    query.skip((page - 1) * limit).take(limit);

    const [items, totalItems] = await query.getManyAndCount();
    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
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

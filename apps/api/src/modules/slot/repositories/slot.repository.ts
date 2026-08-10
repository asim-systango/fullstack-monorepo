import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slot } from '../entities/slot.entity';
import { SlotStatus } from '../../../shared/enums/slot-status.enum';

@Injectable()
export class SlotRepository {
  constructor(
    @InjectRepository(Slot)
    private readonly repo: Repository<Slot>,
  ) {}

  async findAll(options?: {
    doctorId?: string;
    status?: SlotStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Slot[]> {
    const query = this.repo
      .createQueryBuilder('slot')
      .leftJoinAndSelect('slot.doctor', 'doctor');

    if (options?.doctorId) {
      query.andWhere('slot.doctorId = :doctorId', { doctorId: options.doctorId });
    }

    if (options?.status) {
      query.andWhere('slot.status = :status', { status: options.status });
    }

    if (options?.startDate) {
      query.andWhere('slot.startsAt >= :startDate', { startDate: options.startDate });
    }

    if (options?.endDate) {
      query.andWhere('slot.endsAt <= :endDate', { endDate: options.endDate });
    }

    query.orderBy('slot.startsAt', 'ASC');
    return query.getMany();
  }

  async findById(id: string): Promise<Slot | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['doctor', 'appointment'],
    });
  }

  async create(data: Partial<Slot>): Promise<Slot> {
    const slot = this.repo.create(data);
    return this.repo.save(slot);
  }

  async update(id: string, data: Partial<Slot>): Promise<Slot | null> {
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

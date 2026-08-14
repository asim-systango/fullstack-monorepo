import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ListFinesQueryDto } from './dto/list-fines-query.dto';
import type { WaiveFineDto } from './dto/waive-fine.dto';
import { FineStatus } from './enums/fine-status.enum';
import { Fine } from './fine.entity';

@Injectable()
export class FinesService {
  constructor(
    @InjectRepository(Fine)
    private readonly fines: Repository<Fine>,
  ) {}

  async list(query: ListFinesQueryDto): Promise<{
    items: Fine[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.fines
      .createQueryBuilder('fine')
      .leftJoinAndSelect('fine.loan', 'loan')
      .leftJoinAndSelect('loan.book', 'book');

    if (query.userId) {
      qb.andWhere('fine.user_id = :userId', { userId: query.userId });
    }
    if (query.status) {
      qb.andWhere('fine.status = :status', { status: query.status });
    }

    qb.orderBy('fine.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  listMine(userId: string, query: ListFinesQueryDto) {
    return this.list({ ...query, userId });
  }

  async findOne(id: string): Promise<Fine> {
    const fine = await this.fines.findOne({
      where: { id },
      relations: { loan: { book: true } },
    });
    if (!fine) {
      throw new NotFoundException('Fine not found');
    }
    return fine;
  }

  async markPaid(id: string, staffUserId: string): Promise<Fine> {
    const fine = await this.findOne(id);
    if (fine.status !== FineStatus.Unpaid) {
      throw new BadRequestException(
        fine.status === FineStatus.Paid
          ? 'Fine is already paid'
          : 'Fine is already waived',
      );
    }
    fine.status = FineStatus.Paid;
    fine.paidAt = new Date();
    fine.markedPaidBy = staffUserId;
    return this.fines.save(fine);
  }

  async waive(id: string, dto: WaiveFineDto, staffUserId: string): Promise<Fine> {
    const fine = await this.findOne(id);
    if (fine.status !== FineStatus.Unpaid) {
      throw new BadRequestException(
        fine.status === FineStatus.Waived
          ? 'Fine is already waived'
          : 'Fine is already paid',
      );
    }
    fine.status = FineStatus.Waived;
    fine.waivedReason = dto.reason.trim();
    fine.waivedAt = new Date();
    fine.waivedBy = staffUserId;
    return this.fines.save(fine);
  }
}

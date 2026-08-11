import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ListFinesQueryDto } from './dto/list-fines-query.dto';
import { Fine } from './fine.entity';

@Injectable()
export class FinesService {
  constructor(
    @InjectRepository(Fine)
    private readonly fines: Repository<Fine>,
  ) {}

  // Scaffold — overdue calc + mark paid next.
  list(_query: ListFinesQueryDto): Promise<{ items: Fine[]; total: number }> {
    return Promise.resolve({ items: [], total: 0 });
  }

  markPaid(_id: string): Promise<Fine> {
    throw new Error('Not implemented');
  }
}

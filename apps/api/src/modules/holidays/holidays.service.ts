import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { rethrowDbError } from '../../common/database';
import { todayIst, yearOf } from '../../common/dates';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { Holiday } from './holiday.entity';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(Holiday) private readonly holidays: Repository<Holiday>,
  ) {}

  list(year: number = yearOf(todayIst())) {
    return this.inRange(`${year}-01-01`, `${year}-12-31`);
  }

  inRange(start: string, end: string) {
    return this.holidays.find({
      where: { date: Between(start, end) },
      order: { date: 'ASC' },
    });
  }

  // used when counting working days
  async datesBetween(start: string, end: string): Promise<Set<string>> {
    const rows = await this.inRange(start, end);
    return new Set(rows.map((h) => h.date));
  }

  async create(dto: CreateHolidayDto) {
    const exists = await this.holidays.exists({ where: { date: dto.date } });
    if (exists) throw new ConflictException(dateTaken(dto.date));
    try {
      return await this.holidays.save(this.holidays.create(dto));
    } catch (err) {
      rethrowDbError(err, { conflict: dateTaken(dto.date) });
    }
  }

  async remove(id: string) {
    const result = await this.holidays.delete(id);
    if (!result.affected) throw new NotFoundException('Holiday not found');
    return { id, deleted: true };
  }
}

function dateTaken(date: string) {
  return `There is already a holiday on ${date}`;
}

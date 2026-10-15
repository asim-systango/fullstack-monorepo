import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { rethrowDbError } from '../../common/database';
import { LeaveRequest } from '../leave-requests/leave-request.entity';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { LeaveType } from './leave-type.entity';

@Injectable()
export class LeaveTypesService {
  constructor(
    @InjectRepository(LeaveType) private readonly types: Repository<LeaveType>,
    @InjectRepository(LeaveRequest) private readonly requests: Repository<LeaveRequest>,
  ) {}

  // deletedAt is a plain column here, so we filter archived types ourselves
  findActive() {
    return this.types.find({ where: { deletedAt: IsNull() }, order: { name: 'ASC' } });
  }

  findActiveById(id: string) {
    return this.types.findOne({ where: { id, deletedAt: IsNull() } });
  }

  async getActiveOrThrow(id: string) {
    const type = await this.findActiveById(id);
    if (!type) throw new NotFoundException('Leave type not found');
    return type;
  }

  async create(dto: CreateLeaveTypeDto) {
    await this.assertNameFree(dto.name);
    try {
      return await this.types.save(this.types.create(dto));
    } catch (err) {
      rethrowDbError(err, { conflict: nameTaken(dto.name) });
    }
  }

  async update(id: string, dto: UpdateLeaveTypeDto) {
    const type = await this.getActiveOrThrow(id);
    if (dto.name !== undefined && dto.name.toLowerCase() !== type.name.toLowerCase()) {
      await this.assertNameFree(dto.name);
    }
    Object.assign(type, dto);
    try {
      return await this.types.save(type);
    } catch (err) {
      rethrowDbError(err, { conflict: nameTaken(dto.name ?? type.name) });
    }
  }

  // "delete" = archive, old requests and balances still point at this type
  async archive(id: string) {
    const type = await this.getActiveOrThrow(id);
    const pending = await this.requests.count({
      where: { leaveTypeId: id, status: 'pending' },
    });
    if (pending > 0) {
      throw new ConflictException(
        `${type.name} still has ${pending} pending request(s). Approve, reject or cancel them first.`,
      );
    }
    type.deletedAt = new Date();
    await this.types.save(type);
    return { id, archived: true };
  }

  private async assertNameFree(name: string) {
    const taken = await this.types
      .createQueryBuilder('t')
      .where('lower(t.name) = lower(:name)', { name })
      .andWhere('t.deletedAt IS NULL')
      .getExists();
    if (taken) throw new ConflictException(nameTaken(name));
  }
}

function nameTaken(name: string) {
  return `A leave type called "${name}" already exists`;
}

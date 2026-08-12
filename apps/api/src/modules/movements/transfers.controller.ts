import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { Roles } from '../../common/auth';
import { MovementsService } from './movements.service';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class CreateTransferDto {
  sourceWarehouseId!: string;
  destWarehouseId!: string;
  productId!: string;
  quantity!: number;
  reason?: string;
}

@Controller('transfers')
export class TransfersController {
  constructor(private readonly movementsService: MovementsService) {}

  @Get()
  @Roles('admin', 'staff')
  async findAll() {
    const movements = await this.movementsService.getMovements({ type: 'transfer' });
    return { data: movements };
  }

  @Post()
  @Roles('admin', 'staff')
  async createTransfer(@Body() dto: CreateTransferDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    const result = await this.movementsService.recordTransfer({
      ...dto,
      userId,
    });
    return { data: result };
  }
}

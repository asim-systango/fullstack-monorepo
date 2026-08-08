import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { Roles } from '../../common/auth';
import { MovementsService } from './movements.service';
import { MovementType } from '../../database/entities/StockMovementEntity';
import { CreateMovementDto } from './dto';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Get()
  @Roles('admin', 'staff', 'user')
  async findAll(
    @Query('warehouseId') warehouseId?: string,
    @Query('productId') productId?: string,
    @Query('sku') sku?: string,
    @Query('type') type?: MovementType,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const movements = await this.movementsService.getMovements({
      warehouseId,
      productId,
      sku,
      type,
      dateFrom,
      dateTo,
    });
    return { data: movements };
  }

  @Post()
  @Roles('admin', 'staff', 'user')
  async create(@Body() dto: CreateMovementDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.id || dto.userId || '00000000-0000-0000-0000-000000000000';
    const movement = await this.movementsService.recordMovement({
      ...dto,
      userId,
    });
    return { data: movement };
  }
}
